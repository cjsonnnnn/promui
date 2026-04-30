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

async function makeEdit(page: Page): Promise<boolean> {
  const editor = page.locator('.monaco-editor').first()
  if (await editor.count() === 0) return false
  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('\n# test change')
  await page.waitForTimeout(400)
  return true
}

test.describe('SD · Save / Diff Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // SD-01 · Save dialog opens with diff after edit
  test('SD-01: save button opens diff dialog after edit', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd01-${ts}`)
    if (!await makeEdit(page)) return

    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeEnabled({ timeout: 3000 })
    await saveBtn.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Save changes' })).toBeVisible()
    await page.getByTestId('save-cancel-btn').click()
  })

  // SD-02 · Diff shows red/green lines
  test('SD-02: diff dialog renders added lines', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd02-${ts}`)
    if (!await makeEdit(page)) return

    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Added line with green background
    await expect(page.locator('.bg-success\\/10').first()).toBeVisible({ timeout: 5000 })
    await page.getByTestId('save-cancel-btn').click()
  })

  // SD-02b · Hunk revert button appears on hover
  test('SD-02b: revert button appears on hover of changed block', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd02b-${ts}`)
    if (!await makeEdit(page)) return

    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const changedBlock = page.locator('.group.relative').first()
    if (await changedBlock.count() === 0) {
      await page.getByTestId('save-cancel-btn').click()
      return
    }

    await changedBlock.hover()
    await expect(changedBlock.getByRole('button', { name: /revert/i })).toBeVisible({ timeout: 2000 })
    await page.getByTestId('save-cancel-btn').click()
  })

  // SD-03 · Reverting all hunks shows no-changes
  test('SD-03: reverting all hunks shows no-changes message', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd03-${ts}`)
    if (!await makeEdit(page)) return

    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Revert all visible hunk blocks
    for (let attempts = 0; attempts < 10; attempts++) {
      const block = page.locator('.group.relative').first()
      if (await block.count() === 0) break
      await block.hover()
      const btn = block.getByRole('button', { name: /revert/i })
      if (!await btn.isVisible()) break
      await btn.click()
      await page.waitForTimeout(150)
    }

    await expect(page.locator('text=/No changes|All changes reverted/')).toBeVisible({ timeout: 3000 })
    await page.getByTestId('save-cancel-btn').click()
  })

  // SD-04 · Confirm save success
  test('SD-04: confirming save closes dialog and disables save button', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd04-${ts}`)
    if (!await makeEdit(page)) return

    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeEnabled({ timeout: 3000 })
    await saveBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByTestId('save-confirm-btn').click()

    await expect(page.locator('[data-sonner-toast]').filter({ hasText: /saved/i })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    await expect(saveBtn).toBeDisabled({ timeout: 3000 })
  })

  // SD-05 · Cancel save keeps edits
  test('SD-05: cancelling save dialog keeps unsaved edits', async ({ page }) => {
    const ts = Date.now()
    await createAndSelect(page, `sd05-${ts}`)
    if (!await makeEdit(page)) return

    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeEnabled({ timeout: 3000 })
    await saveBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByTestId('save-cancel-btn').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(saveBtn).toBeEnabled()
  })
})
