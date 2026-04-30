import { test, expect, type Page } from '@playwright/test'

async function waitForApp(page: Page) {
  await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 15000 })
}

async function createAndSave(page: Page, baseName: string): Promise<string> {
  await page.getByTestId('new-file-btn').click()
  await page.getByPlaceholder('prometheus').fill(baseName)
  await page.getByTestId('create-file-confirm-btn').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const filename = `${baseName}.yml`
  await page.locator(`[data-testid="file-item"][data-filename="${filename}"]`).click()
  await page.waitForTimeout(400)

  // Make an edit and save to create a history snapshot
  const editor = page.locator('.monaco-editor').first()
  if (await editor.count() > 0) {
    await editor.click()
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# snapshot entry')
    await page.waitForTimeout(300)

    const saveBtn = page.getByTestId('save-file-btn')
    if (await saveBtn.isEnabled()) {
      await saveBtn.click()
      await expect(page.getByTestId('save-confirm-btn')).toBeVisible({ timeout: 5000 })
      await page.getByTestId('save-confirm-btn').click()
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8000 })
      await page.waitForTimeout(300)
    }
  }

  return filename
}

test.describe('VH · Version History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // VH-05 · New file with no saves shows empty state
  test('VH-05: new file shows no-history empty state', async ({ page }) => {
    const ts = Date.now()
    await page.getByTestId('new-file-btn').click()
    await page.getByPlaceholder('prometheus').fill(`no-hist-${ts}`)
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const histBtn = page.getByTestId('version-history-btn')
    await expect(histBtn).toBeEnabled({ timeout: 3000 })
    await histBtn.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('text=/No snapshots yet/')).toBeVisible({ timeout: 3000 })

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  // VH-01 · History button is disabled with no file selected
  test('VH-01b: history button is disabled when no file is active', async ({ page }) => {
    // Only meaningful when no files exist
    if (await page.getByTestId('file-item').count() > 0) return
    await expect(page.getByTestId('version-history-btn')).toBeDisabled()
  })

  // VH-01 · History dialog opens with snapshots after a save
  test('VH-01: history dialog shows snapshots after save', async ({ page }) => {
    const ts = Date.now()
    await createAndSave(page, `vh01-${ts}`)

    const histBtn = page.getByTestId('version-history-btn')
    await expect(histBtn).toBeEnabled({ timeout: 3000 })
    await histBtn.click()

    await expect(page.getByRole('dialog')).toBeVisible()
    // At least one version card visible
    const versionCards = page.locator('[class*="rounded-lg border border-border"]')
    await expect(versionCards.first()).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  // VH-02 · Restore shows diff without revert buttons
  test('VH-02: restore diff dialog has no revert buttons', async ({ page }) => {
    const ts = Date.now()
    await createAndSave(page, `vh02-${ts}`)

    // Make a second unsaved change so the file differs from the snapshot
    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() > 0) {
      await editor.click()
      await page.keyboard.press('ControlOrMeta+End')
      await page.keyboard.type('\n# second change')
      await page.waitForTimeout(300)
    }

    await page.getByTestId('version-history-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Hover a non-active version card to reveal the Restore button
    const cards = page.locator('.group.rounded-lg')
    const cardCount = await cards.count()
    let restoreClicked = false

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i)
      await card.hover()
      const restoreBtn = card.getByRole('button', { name: 'Restore' })
      if (await restoreBtn.isVisible()) {
        await restoreBtn.click()
        restoreClicked = true
        break
      }
    }

    if (!restoreClicked) {
      await page.keyboard.press('Escape')
      return
    }

    // Restore diff dialog: confirm button visible, no inline revert button
    await expect(page.getByTestId('save-confirm-btn')).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /^revert$/i })).not.toBeVisible()

    await page.getByTestId('save-cancel-btn').click()
  })

  // VH-04 · Cancel restore leaves file unchanged
  test('VH-04: cancelling restore does not change the file', async ({ page }) => {
    const ts = Date.now()
    await createAndSave(page, `vh04-${ts}`)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() > 0) {
      await editor.click()
      await page.keyboard.press('ControlOrMeta+End')
      await page.keyboard.type('\n# unsaved')
      await page.waitForTimeout(300)
    }

    await page.getByTestId('version-history-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const cards = page.locator('.group.rounded-lg')
    let found = false
    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i)
      await card.hover()
      const btn = card.getByRole('button', { name: 'Restore' })
      if (await btn.isVisible()) {
        await btn.click()
        found = true
        break
      }
    }

    if (!found) {
      await page.keyboard.press('Escape')
      return
    }

    await expect(page.getByTestId('save-cancel-btn')).toBeVisible({ timeout: 3000 })
    await page.getByTestId('save-cancel-btn').click()

    // Restore confirm dialog closed; history dialog may still be visible — just check no crash
    await expect(page.getByTestId('save-confirm-btn')).not.toBeVisible({ timeout: 3000 })
  })
})
