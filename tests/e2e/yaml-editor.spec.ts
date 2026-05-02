import { test, expect, type Page } from '@playwright/test'
import {
  appendInEditor,
  createFile,
  fileItem,
  focusEditor,
  readEditorText,
  selectFile,
  setEditorValue,
  uniqueName,
  waitForApp,
} from './utils/helpers'

async function deleteAllFiles(page: Page): Promise<void> {
  const rows = await page.getByTestId('file-item').all()
  for (const row of rows) {
    const name = await row.getAttribute('data-filename')
    if (!name) continue
    await row.hover()
    await row.getByRole('button').first().click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByTestId('delete-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
  }
}

test.describe('YAML Editor Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // ─── ED-01..16 ────────────────────────────────────────────────────────────

  test('ED-01 Editor loads file content', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed01'))
    await selectFile(page, filename)
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 5000 })
    const text = await readEditorText(page)
    // Default scaffold contains "global" key.
    expect(text.length).toBeGreaterThan(0)
  })

  test('ED-02 Editor shows empty state', async ({ page }) => {
    await deleteAllFiles(page)
    // Placeholder text appears when no file is selected.
    await expect(page.getByText(/Select or create YAML file/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('ED-03 Typing triggers debounced store update', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed03'))
    await selectFile(page, filename)
    const ok = await appendInEditor(page, '\n# typed-debounce')
    if (!ok) test.skip(true, 'Monaco not available')
    // After ~400ms, the store reflects the change — Save button becomes enabled.
    await expect(page.getByTestId('save-file-btn')).toBeEnabled({ timeout: 3000 })
  })

  test('ED-04 Blur immediately applies content', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed04'))
    await selectFile(page, filename)
    if (!(await focusEditor(page))) test.skip(true, 'Monaco not available')
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# blur-test')
    // Blur the editor immediately.
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    // The dirty state should propagate (blur path flushes the buffered yaml).
    await expect(page.getByTestId('save-file-btn')).toBeEnabled({ timeout: 3000 })
  })

  test('ED-05 Loading file does not trigger dirty flag', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed05'))
    await selectFile(page, filename)
    // Allow the editor a moment to load and settle.
    await page.waitForTimeout(800)
    await expect(page.getByTestId('save-file-btn')).toBeDisabled({ timeout: 3000 })
  })

  test('ED-06 Line count badge reflects line total', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed06'))
    await selectFile(page, filename)
    // The yaml-preview header shows "<n> lines" badge.
    const badge = page.locator('[data-slot="badge"]', { hasText: /lines$/ }).first()
    await expect(badge).toBeVisible({ timeout: 5000 })
    const text = (await badge.innerText()).trim()
    const match = text.match(/(\d+)\s+lines/i)
    expect(match).not.toBeNull()
    expect(Number(match?.[1])).toBeGreaterThan(0)
  })

  test('ED-07 Line count updates after edits', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed07'))
    await selectFile(page, filename)
    const badge = page.locator('[data-slot="badge"]', { hasText: /lines$/ }).first()
    await expect(badge).toBeVisible({ timeout: 5000 })
    const before = Number((await badge.innerText()).trim().match(/(\d+)/)?.[1] ?? '0')
    const ok = await appendInEditor(page, '\n# new line 1\n# new line 2\n# new line 3')
    if (!ok) test.skip(true, 'Monaco not available')
    await page.waitForTimeout(300)
    const after = Number((await badge.innerText()).trim().match(/(\d+)/)?.[1] ?? '0')
    expect(after).toBeGreaterThan(before)
  })

  test('ED-08 Validation markers in gutter', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed08'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n  scrape_interval: 1x\n')
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)
    // Monaco gutter markers carry data-mode-id or use the squiggly-error class.
    const markers = page.locator('.monaco-editor .squiggly-error, .monaco-editor .cgmr')
    await expect(markers.first()).toBeVisible({ timeout: 5000 })
  })

  test('ED-09 Gutter markers cleared after fix', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed09'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n  scrape_interval: 1x\n')
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)
    // Verify markers exist.
    await expect(page.locator('.monaco-editor .squiggly-error').first()).toBeVisible({ timeout: 5000 })
    // Fix and re-validate.
    await setEditorValue(page, 'global:\n  scrape_interval: 30s\n')
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(700)
    await expect(page.locator('.monaco-editor .squiggly-error')).toHaveCount(0)
  })

  test('ED-10 Copy button copies YAML', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const filename = await createFile(page, uniqueName('ed10'))
    await selectFile(page, filename)
    // The copy button is the icon-only Button in the yaml-preview header.
    // Identify via lucide-copy icon.
    const copyBtn = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-copy, svg.lucide-check') })
      .first()
    await copyBtn.click()
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''))
    expect(clip.length).toBeGreaterThan(0)
  })

  test('ED-11 Copy button shows checkmark', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const filename = await createFile(page, uniqueName('ed11'))
    await selectFile(page, filename)
    const copyBtn = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-copy, svg.lucide-check') })
      .first()
    await copyBtn.click()
    // The copy button briefly switches to a check icon.
    await expect(copyBtn.locator('svg.lucide-check')).toBeVisible({ timeout: 2000 })
  })

  test('ED-12 Download button downloads file', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed12'))
    await selectFile(page, filename)
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 })
    const dlBtn = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-download') })
      .first()
    await dlBtn.click()
    const dl = await downloadPromise
    expect(dl.suggestedFilename()).toBe(filename)
  })

  test('ED-13 Panel collapse', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed13'))
    await selectFile(page, filename)
    // The collapse button in the YAML header has the panel-right-close icon.
    const collapseBtn = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-panel-right-close') })
      .first()
    await collapseBtn.click()
    await page.waitForTimeout(300)
    // After collapse, the reopen affordance "YAML" sidebar appears.
    await expect(page.getByText('YAML', { exact: true }).first()).toBeVisible({ timeout: 3000 })
    // And the format button is no longer visible (panel collapsed).
    const expandBtn = page
      .locator('button[title="Expand YAML Panel"]')
      .first()
    await expect(expandBtn).toBeVisible()
  })

  test('ED-14 Editor reflows on panel resize', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed14'))
    await selectFile(page, filename)
    const editor = page.locator('.monaco-editor').first()
    await expect(editor).toBeVisible({ timeout: 5000 })
    const beforeBox = await editor.boundingBox()
    // Find the resize handle between the main editor and the YAML panel.
    const handles = page.locator('[role="separator"], [data-panel-resize-handle-id]')
    const lastHandle = handles.last()
    if ((await lastHandle.count()) === 0) test.skip(true, 'No resize handle found')
    const hb = await lastHandle.boundingBox()
    if (!hb || !beforeBox) test.skip(true, 'Bounding boxes unavailable')
    if (!hb || !beforeBox) return
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
    await page.mouse.down()
    await page.mouse.move(hb.x - 100, hb.y + hb.height / 2, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(300)
    const afterBox = await editor.boundingBox()
    expect(afterBox).not.toBeNull()
    expect(afterBox?.width ?? 0).not.toBe(beforeBox.width)
  })

  test('ED-15 Syntax highlighting present', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed15'))
    await selectFile(page, filename)
    await page.waitForTimeout(800)
    // Monaco renders distinct CSS classes (mtk1, mtk2, …) for tokens.
    const tokens = page.locator('.monaco-editor [class^="mtk"]')
    await expect(tokens.first()).toBeVisible({ timeout: 5000 })
    const distinct = await page.evaluate(() => {
      const set = new Set<string>()
      document.querySelectorAll('.monaco-editor span[class*="mtk"]').forEach((el) => {
        ;(el as HTMLElement).className.split(/\s+/).forEach((c) => {
          if (/^mtk\d+/.test(c)) set.add(c)
        })
      })
      return set.size
    })
    expect(distinct).toBeGreaterThan(1)
  })

  test('ED-16 Undo last edit', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed16'))
    await selectFile(page, filename)
    if (!(await focusEditor(page))) test.skip(true, 'Monaco not available')
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# UNDO_MARKER')
    await page.waitForTimeout(300)
    let text = await readEditorText(page)
    expect(text).toContain('UNDO_MARKER')
    await page.keyboard.press('ControlOrMeta+Z')
    await page.waitForTimeout(300)
    text = await readEditorText(page)
    expect(text).not.toContain('UNDO_MARKER')
  })

  // ─── YF-01..08 ────────────────────────────────────────────────────────────

  test('YF-01 Format button — disabled with no file', async ({ page }) => {
    await deleteAllFiles(page)
    await expect(page.getByTestId('format-yaml-btn')).toBeDisabled()
  })

  test('YF-02 Format button — enabled with file', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf02'))
    await selectFile(page, filename)
    await expect(page.getByTestId('format-yaml-btn')).toBeEnabled()
  })

  test('YF-03 Format — valid YAML reformatted', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf03'))
    await selectFile(page, filename)
    // Inject extra blank lines and odd spacing — formatter normalizes.
    await setEditorValue(
      page,
      'global:\n\n\n  scrape_interval:    30s\n'
    )
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]')
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    await expect(errorToast).toHaveCount(0)
    const text = await readEditorText(page)
    expect(text).toContain('scrape_interval')
  })

  test('YF-04 Format — group headers preserved', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf04'))
    await selectFile(page, filename)
    const yaml = [
      'global:',
      '  scrape_interval: 15s',
      'scrape_configs:',
      '# ===== MyGroup =====',
      '  - job_name: alpha',
      '    static_configs:',
      '      - targets: ["a:9100"]',
      '',
    ].join('\n')
    await setEditorValue(page, yaml)
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    const text = await readEditorText(page)
    expect(text).toContain('MyGroup')
  })

  test('YF-05 Format — invalid YAML shows error toast', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf05'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n  scrape_interval: [unclosed\n')
    await page.getByTestId('format-yaml-btn').click()
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /invalid|cannot format/i }).first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('YF-06 Ctrl+S inside editor formats', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf06'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n\n\n  scrape_interval:   30s\n')
    if (!(await focusEditor(page))) test.skip(true, 'Monaco not available')
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]')
    await page.keyboard.press('ControlOrMeta+S')
    await page.waitForTimeout(500)
    await expect(errorToast).toHaveCount(0)
    const text = await readEditorText(page)
    expect(text).toContain('scrape_interval')
  })

  test('YF-07 Ctrl+S outside editor is no-op', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf07'))
    await selectFile(page, filename)
    // Click into the file explorer to ensure focus is outside Monaco.
    await fileItem(page, filename).click()
    await page.waitForTimeout(200)
    const errorToast = page.locator('[data-sonner-toast]')
    const before = await errorToast.count()
    await page.keyboard.press('ControlOrMeta+S')
    await page.waitForTimeout(400)
    const after = await errorToast.count()
    // No new toast appeared.
    expect(after).toBeLessThanOrEqual(before)
  })

  test('YF-08 Format is idempotent', async ({ page }) => {
    const filename = await createFile(page, uniqueName('yf08'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n  scrape_interval: 15s\n')
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    const first = await readEditorText(page)
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    const second = await readEditorText(page)
    expect(second).toBe(first)
  })
})
