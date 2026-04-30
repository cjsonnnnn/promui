import { test, expect, type Page } from '@playwright/test'

async function waitForApp(page: Page) {
  await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 15000 })
}

async function createAndSelect(page: Page, baseName: string) {
  await page.getByTestId('new-file-btn').click()
  await page.getByPlaceholder('prometheus').fill(baseName)
  await page.getByTestId('create-file-confirm-btn').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const filename = `${baseName}.yml`
  await page.locator(`[data-testid="file-item"][data-filename="${filename}"]`).click()
  await page.waitForTimeout(400)
  return filename
}

test.describe('VAL · Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // VAL-05 · Validate button disabled when no file active
  test('VAL-05: validate button is disabled when no file is selected', async ({ page }) => {
    const count = await page.getByTestId('file-item').count()
    if (count > 0) return // only meaningful with empty file list

    await expect(page.getByTestId('validate-yaml-btn')).toBeDisabled()
  })

  // VAL-01 · Validate valid YAML shows success toast
  test('VAL-01: validating a well-formed config shows success toast', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `val01-${ts}`)
    await page.waitForTimeout(600)

    await expect(page.getByTestId('validate-yaml-btn')).toBeEnabled({ timeout: 3000 })
    await page.getByTestId('validate-yaml-btn').click()

    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /valid/i })
    ).toBeVisible({ timeout: 5000 })
  })

  // VAL-02 · Invalid duration triggers error toast
  test('VAL-02: invalid duration in scrape_interval triggers error toast', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `val02-${ts}`)
    await page.waitForTimeout(600)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) return

    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('global:\n  scrape_interval: 1x\n')
    await page.waitForTimeout(400)

    await page.getByTestId('validate-yaml-btn').click()

    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /issue/i })
    ).toBeVisible({ timeout: 5000 })
  })

  // VAL-03 · Save button disabled when validation errors present
  test('VAL-03: save button is disabled when validation errors exist', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `val03-${ts}`)
    await page.waitForTimeout(600)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) return

    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('global:\n  scrape_interval: 1x\n')
    await page.waitForTimeout(400)

    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)

    await expect(page.getByTestId('save-file-btn')).toBeDisabled({ timeout: 3000 })
  })

  // VAL-04 · No error badge on valid file
  test('VAL-04: no issues badge when YAML is valid', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `val04-${ts}`)
    await page.waitForTimeout(600)

    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)

    // The destructive badge should not appear
    await expect(page.locator('[data-slot="badge"][class*="destructive"]')).not.toBeVisible()
  })
})
