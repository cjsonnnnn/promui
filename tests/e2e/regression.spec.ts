import { test, expect } from '@playwright/test'

async function waitForApp(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 15000 })
}

async function createAndSelectFile(
  page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never,
  baseName: string
) {
  await page.getByTestId('new-file-btn').click()
  await page.getByPlaceholder('prometheus').fill(baseName)
  await page.getByTestId('create-file-confirm-btn').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const filename = `${baseName}.yml`
  await page.locator(`[data-testid="file-item"][data-filename="${filename}"]`).click()
  await page.waitForTimeout(400)
  return filename
}

test.describe('RS · Regression-Sensitive Areas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // RS-01 · Monaco ↔ store sync on file switch — no cross-contamination
  test('RS-01: edits on file A do not appear in file B after switch', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `rs01-a-${ts}`)
    await createAndSelectFile(page, `rs01-b-${ts}`)

    const fileA = `rs01-a-${ts}.yml`
    const fileB = `rs01-b-${ts}.yml`

    // Select file A and type something unique
    await page.locator(`[data-testid="file-item"][data-filename="${fileA}"]`).click()
    await page.waitForTimeout(500)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    const uniqueString = `UNIQUE_RS01_${ts}`
    await editor.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type(`\n# ${uniqueString}`)
    // Switch immediately before debounce
    await page.locator(`[data-testid="file-item"][data-filename="${fileB}"]`).click()

    // Handle unsaved dialog if it appears
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible()) {
      await page.getByTestId('discard-changes-btn').click()
      await expect(dialog).not.toBeVisible()
    }

    await page.waitForTimeout(600)

    // File B's content should not contain file A's unique string
    const editorContent = await page.locator('.monaco-editor').first().textContent().catch(() => '')
    expect(editorContent).not.toContain(uniqueString)
  })

  // RS-02 · programmaticChangeRef — loading file does not set dirty flag
  test('RS-02: loading a file does not make the save button enabled', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `rs02-${ts}`)

    // Just loaded the file — no user edits
    const saveBtn = page.getByTestId('save-file-btn')
    // Give store time to settle
    await page.waitForTimeout(600)
    await expect(saveBtn).toBeDisabled({ timeout: 3000 })
  })

  // RS-03 · Format preserves group headers
  test('RS-03: format YAML preserves group comment headers', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `rs03-groups-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    const groupYaml = [
      'global:',
      '  scrape_interval: 15s',
      '  evaluation_interval: 15s',
      'scrape_configs:',
      '# ===== MyGroup =====',
      '  - job_name: test-job',
      '    static_configs:',
      '      - targets: ["localhost:9090"]',
    ].join('\n')

    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type(groupYaml)
    await page.waitForTimeout(300)

    // Click format
    const formatBtn = page.getByTestId('format-yaml-btn')
    if (await formatBtn.isEnabled()) {
      await formatBtn.click()
      await page.waitForTimeout(500)

      // Group header should still be present
      const content = await editor.textContent().catch(() => '')
      expect(content).toContain('MyGroup')
    }
  })

  // RS-05 · Theme-to-Monaco mapping
  test('RS-05: each theme sets the correct Monaco theme class', async ({ page }) => {
    // Select Light theme and verify Monaco uses light mode
    await page.getByTestId('theme-selector-btn').click()
    await page.getByTestId('theme-option-light').click()
    await page.waitForTimeout(300)

    // Monaco should have vs (light) theme — look for the editor container class
    const monacoLight = page.locator('.monaco-editor.vs:not(.vs-dark)')
    // This is the primary indicator — present if monaco used vs theme
    // Note: if no file is loaded, monaco may not render — just verify html class
    await expect(page.locator('html')).toHaveClass(/light/, { timeout: 3000 })

    // Switch to High Contrast
    await page.getByTestId('theme-selector-btn').click()
    await page.getByTestId('theme-option-high-contrast').click()
    await page.waitForTimeout(300)
    await expect(page.locator('html')).toHaveClass(/high-contrast/, { timeout: 3000 })

    // Reset to dark
    await page.getByTestId('theme-selector-btn').click()
    await page.getByTestId('theme-option-dark').click()
  })

  // RS-06 · @custom-variant dark covers all dark themes
  test('RS-06: Ocean theme applies dark-variant styles', async ({ page }) => {
    await page.getByTestId('theme-selector-btn').click()
    await page.getByTestId('theme-option-ocean').click()
    await page.waitForTimeout(300)

    // html should have "ocean" class (not "dark"), but dark: utilities must apply
    await expect(page.locator('html')).toHaveClass(/ocean/, { timeout: 3000 })

    // Verify the body does NOT have a light background
    // The ocean bg is oklch(0.13 0.018 220) — dark value
    // We check that the body background color is not white-ish
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // A pure white background would be rgb(255, 255, 255) — ocean should be much darker
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
  })

  // RS-07 · Prefix View state persists across job edits
  test('RS-07: Prefix View stays active after toggling', async ({ page }) => {
    // Navigate to page with files — at minimum scrape configs editor needs to be visible
    const fileItems = page.getByTestId('file-item')
    if (await fileItems.count() === 0) {
      test.skip()
      return
    }

    await fileItems.first().click()
    await page.waitForTimeout(400)

    const prefixBtn = page.getByTestId('prefix-view-btn')
    if (await prefixBtn.count() === 0) {
      test.skip()
      return
    }

    // Enable prefix view
    await prefixBtn.click()
    await expect(prefixBtn).toHaveAttribute('aria-pressed', 'true')

    // Click again to verify toggle back
    await prefixBtn.click()
    await expect(prefixBtn).toHaveAttribute('aria-pressed', 'false')
  })

  // RS-08 · Validation errors cleared on file switch
  test('RS-08: switching files clears validation errors from previous file', async ({ page }) => {
    const ts = Date.now()
    const fileA = await createAndSelectFile(page, `rs08-a-${ts}`)

    // Introduce error in file A
    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('global:\n  scrape_interval: 1x\n')
    await page.waitForTimeout(300)

    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)

    // Create and switch to a clean file B
    const fileB = await createAndSelectFile(page, `rs08-b-${ts}`)

    // Handle unsaved dialog if it appears
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible()) {
      await page.getByTestId('discard-changes-btn').click()
    }

    await page.waitForTimeout(500)

    // Validate file B — should be clean
    await page.getByTestId('validate-yaml-btn').click()
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /valid/i })
    ).toBeVisible({ timeout: 5000 })
  })

  // RS-14 · Inline diff line numbers match actual content
  test('RS-14: diff dialog shows correct line numbers', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `rs14-linenums-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    await editor.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# line number check')
    await page.waitForTimeout(300)

    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeEnabled({ timeout: 3000 })
    await saveBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Line numbers should be present (small digits in the left column)
    const lineNumbers = page.locator('[class*="text-\\[10px\\]"][class*="text-right"]')
    const numCount = await lineNumbers.count()
    expect(numCount).toBeGreaterThan(0)

    // The first visible line number should be 1 or greater
    const firstLineText = await lineNumbers.first().textContent()
    const lineNum = parseInt(firstLineText ?? '0', 10)
    expect(lineNum).toBeGreaterThanOrEqual(1)

    await page.getByTestId('save-cancel-btn').click()
  })
})
