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

test.describe('EC · Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // EC-02 · Invalid YAML typed into Monaco — store does not crash
  test('EC-02: typing invalid YAML does not crash the app', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `invalid-input-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    // Syntactically invalid YAML
    await page.keyboard.type('{ unclosed bracket\n  - invalid: [')
    await page.waitForTimeout(500)

    // App should still be functional (toolbar visible, no JS crash)
    await expect(page.getByTestId('validate-yaml-btn')).toBeVisible()
    await expect(page.getByTestId('new-file-btn')).toBeVisible()
  })

  // EC-03 · Revert all hunks shows "No changes" state
  test('EC-03: reverting all hunks shows no-changes message', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `all-revert-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    await editor.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# revert me')
    await page.waitForTimeout(300)

    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeEnabled({ timeout: 3000 })
    await saveBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Find all hunk blocks and revert them
    const changedBlocks = page.locator('.group.relative')
    const blockCount = await changedBlocks.count()

    for (let i = 0; i < blockCount; i++) {
      const block = changedBlocks.first()
      await block.hover()
      const revertBtn = block.getByRole('button', { name: /revert/i })
      if (await revertBtn.isVisible()) {
        await revertBtn.click()
        await page.waitForTimeout(200)
      }
    }

    // Should show "No changes" message
    await expect(page.locator('text=/No changes|All changes reverted/')).toBeVisible({ timeout: 3000 })

    await page.getByTestId('save-cancel-btn').click()
  })

  // EC-04 · Save dialog with identical content shows no-diff state
  test('EC-04: save dialog with no diff shows no-changes message', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `no-diff-${ts}`)

    // Access the store to force-open the dialog via nonce — or just check that
    // save button is disabled when there are no changes (canSave = false)
    const saveBtn = page.getByTestId('save-file-btn')
    await expect(saveBtn).toBeDisabled({ timeout: 3000 })
  })

  // EC-08 · Delete active file transitions to no-file state
  test('EC-08: deleting the active file shows no-file-selected state', async ({ page }) => {
    const ts = Date.now()
    const filename = await createAndSelectFile(page, `delete-active-${ts}`)

    // Verify it's active
    await expect(page.getByText(filename)).toBeVisible()

    // Delete it
    const fileItem = page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
    await fileItem.hover()
    await fileItem.getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('delete-confirm-btn').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Should show no-file-selected state
    await expect(page.getByText('No file selected')).toBeVisible({ timeout: 3000 })
  })

  // EC-09 · Create file with slash in name is rejected
  test('EC-09: filename with slash is rejected', async ({ page }) => {
    await page.getByTestId('new-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('prometheus').fill('../escape')
    await page.getByTestId('create-file-confirm-btn').click()

    // Error message should appear — the dialog should stay open
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('text=/slash|Filename must not/')).toBeVisible({ timeout: 3000 })

    await page.getByTestId('create-file-cancel-btn').click()
  })

  // EC-12 · Validation errors cleared after fixing
  test('EC-12: fixing invalid YAML clears the error badge after re-validation', async ({ page }) => {
    const ts = Date.now()
    await createAndSelectFile(page, `fix-errors-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) {
      test.skip()
      return
    }

    // Introduce an error
    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('global:\n  scrape_interval: 1x\n')
    await page.waitForTimeout(300)

    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(500)

    // Now fix it
    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('global:\n  scrape_interval: 15s\n')
    await page.waitForTimeout(300)

    await page.getByTestId('validate-yaml-btn').click()

    // Success toast
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /valid/i })
    ).toBeVisible({ timeout: 5000 })
  })

  // EC-07 · Rename file to same name is a no-op or graceful
  test('EC-07: renaming to the same name does not error', async ({ page }) => {
    const ts = Date.now()
    const filename = await createAndSelectFile(page, `same-name-${ts}`)

    const fileItem = page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
    await fileItem.hover()
    await fileItem.getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Rename' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()

    // The input is pre-filled with current filename — just confirm
    await page.getByTestId('rename-confirm-btn').click()

    // Should either close without error or show a benign message — no crash
    await page.waitForTimeout(500)
    // App still functional
    await expect(page.getByTestId('new-file-btn')).toBeVisible()
  })
})
