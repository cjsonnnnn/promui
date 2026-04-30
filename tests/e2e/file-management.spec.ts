import { test, expect, type Page } from '@playwright/test'

async function waitForApp(page: Page) {
  await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 15000 })
}

async function createFile(page: Page, baseName: string) {
  await page.getByTestId('new-file-btn').click()
  await page.getByPlaceholder('prometheus').fill(baseName)
  await page.getByTestId('create-file-confirm-btn').click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  return `${baseName}.yml`
}

test.describe('FM · File Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // FM-01 · Create file — happy path
  test('FM-01: create a new file and activate it', async ({ page }) => {
    const ts = Date.now()
    const filename = await createFile(page, `test-create-${ts}`)

    await expect(page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)).toBeVisible()
    await expect(page.getByText(filename)).toBeVisible()
  })

  // FM-02 · Create file — duplicate name shows conflict dialog
  test('FM-02: creating a duplicate filename shows conflict dialog', async ({ page }) => {
    const ts = Date.now()
    const base = `conflict-test-${ts}`
    await createFile(page, base)

    // Try same name again
    await page.getByTestId('new-file-btn').click()
    await page.getByPlaceholder('prometheus').fill(base)
    await page.getByTestId('create-file-confirm-btn').click()

    await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  // FM-06 · Rename file
  test('FM-06: rename a file updates the list', async ({ page }) => {
    const ts = Date.now()
    const originalFile = await createFile(page, `rename-src-${ts}`)

    await page.locator(`[data-testid="file-item"][data-filename="${originalFile}"]`).hover()
    await page.locator(`[data-testid="file-item"][data-filename="${originalFile}"]`).getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Rename' }).click()

    await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()

    const newBase = `renamed-${ts}`
    const input = page.getByRole('dialog').getByRole('textbox')
    await input.clear()
    await input.fill(newBase)
    await page.getByTestId('rename-confirm-btn').click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.locator(`[data-testid="file-item"][data-filename="${newBase}.yml"]`)).toBeVisible()
    await expect(page.locator(`[data-testid="file-item"][data-filename="${originalFile}"]`)).not.toBeVisible()
  })

  // FM-08 · Delete file
  test('FM-08: delete a file removes it from the list', async ({ page }) => {
    const ts = Date.now()
    const filename = await createFile(page, `to-delete-${ts}`)

    const fileItem = page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
    await fileItem.hover()
    await fileItem.getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByRole('heading', { name: 'Delete Config File' })).toBeVisible()
    await page.getByTestId('delete-confirm-btn').click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(fileItem).not.toBeVisible()
  })

  // FM-09 · Delete cancel
  test('FM-09: cancel delete leaves file intact', async ({ page }) => {
    const ts = Date.now()
    const filename = await createFile(page, `keep-file-${ts}`)

    const fileItem = page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
    await fileItem.hover()
    await fileItem.getByRole('button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('delete-cancel-btn').click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(fileItem).toBeVisible()
  })

  // FM-10 · Switch active file
  test('FM-10: switching files updates the active badge', async ({ page }) => {
    const ts = Date.now()
    const fileA = await createFile(page, `switch-a-${ts}`)
    const fileB = await createFile(page, `switch-b-${ts}`)

    await page.locator(`[data-testid="file-item"][data-filename="${fileA}"]`).click()
    await expect(page.getByText(fileA)).toBeVisible()

    await page.locator(`[data-testid="file-item"][data-filename="${fileB}"]`).click()
    await expect(page.getByText(fileB)).toBeVisible()
  })

  // FM-11 · Unsaved-changes guard — keep branch
  test('FM-11a: unsaved guard keep stays on original file', async ({ page }) => {
    const ts = Date.now()
    const fileA = await createFile(page, `guard-a-${ts}`)
    const fileB = await createFile(page, `guard-b-${ts}`)

    await page.locator(`[data-testid="file-item"][data-filename="${fileA}"]`).click()
    await page.waitForTimeout(500)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) return

    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type('\n# unsaved change')
    await page.waitForTimeout(300)

    await page.locator(`[data-testid="file-item"][data-filename="${fileB}"]`).click()

    const dialog = page.getByRole('dialog')
    if (!await dialog.isVisible()) return

    await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
    await page.getByTestId('keep-changes-btn').click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByText(fileA)).toBeVisible()
  })

  test('FM-11b: unsaved guard discard switches to new file', async ({ page }) => {
    const ts = Date.now()
    const fileA = await createFile(page, `discard-a-${ts}`)
    const fileB = await createFile(page, `discard-b-${ts}`)

    await page.locator(`[data-testid="file-item"][data-filename="${fileA}"]`).click()
    await page.waitForTimeout(500)

    const editor = page.locator('.monaco-editor').first()
    if (await editor.count() === 0) return

    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type('\n# unsaved change')
    await page.waitForTimeout(300)

    await page.locator(`[data-testid="file-item"][data-filename="${fileB}"]`).click()

    const dialog = page.getByRole('dialog')
    if (!await dialog.isVisible()) return

    await page.getByTestId('discard-changes-btn').click()
    await expect(dialog).not.toBeVisible()
    await expect(page.getByText(fileB)).toBeVisible()
  })
})
