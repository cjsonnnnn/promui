import { test, expect } from '@playwright/test'
import {
  appendInEditor,
  createFile,
  fileItem,
  openRowMenu,
  selectFile,
  uniqueName,
  waitForApp,
} from './utils/helpers'

test.describe('File Explorer Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // ─── Create file ──────────────────────────────────────────────────────────

  test('FM-01 Create file — happy path', async ({ page }) => {
    const base = uniqueName('fm01')
    const filename = await createFile(page, base)
    await expect(fileItem(page, filename)).toBeVisible()
    // The newly created file becomes active — its filename is shown in the YAML preview header.
    await expect(page.getByText(filename, { exact: false }).first()).toBeVisible()
  })

  test('FM-02 Create file — extension auto-appended', async ({ page }) => {
    const base = uniqueName('fm02')
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    // The dialog shows a preview "Will be saved as <base>.yml" before the user confirms.
    await expect(dialog.getByText(`${base}.yml`)).toBeVisible()
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(dialog).toBeHidden()
    await expect(fileItem(page, `${base}.yml`)).toBeVisible()
  })

  test('FM-03 Create file — empty name rejected', async ({ page }) => {
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Filename is required')).toBeVisible()
  })

  test('FM-04 Create file — whitespace-only name rejected', async ({ page }) => {
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill('   ')
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Filename is required')).toBeVisible()
  })

  test('FM-05 Create file — slash in name rejected', async ({ page }) => {
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill('../escape')
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByText(/slashes/i)).toBeVisible()
  })

  test('FM-06 Create file — `.yml`-only name rejected', async ({ page }) => {
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill('.yml')
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Filename is required')).toBeVisible()
  })

  test('FM-07 Create file — duplicate name triggers conflict', async ({ page }) => {
    const base = uniqueName('fm07')
    await createFile(page, base)
    // Try to create the same name again
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
    // Suggested alternative is pre-filled in the conflict dialog.
    const newNameInput = page.getByRole('dialog').getByRole('textbox')
    await expect(newNameInput).not.toHaveValue('')
  })

  test('FM-08 Create file — cancel discards input', async ({ page }) => {
    const base = uniqueName('fm08')
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    await page.getByTestId('create-file-cancel-btn').click()
    await expect(dialog).toBeHidden()
    // No file with that name should exist.
    await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
    // Reopening the dialog should show empty input.
    await page.getByTestId('new-file-btn').click()
    await expect(page.getByRole('dialog').getByPlaceholder('prometheus')).toHaveValue('')
    await page.getByTestId('create-file-cancel-btn').click()
  })

  test('FM-09 Create file — Enter key submits', async ({ page }) => {
    const base = uniqueName('fm09')
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    await dialog.getByPlaceholder('prometheus').press('Enter')
    await expect(dialog).toBeHidden()
    await expect(fileItem(page, `${base}.yml`)).toBeVisible()
  })

  test('FM-10 Create file — Escape closes dialog', async ({ page }) => {
    const base = uniqueName('fm10')
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
  })

  // ─── Select / activate ────────────────────────────────────────────────────

  test('FM-11 Select file', async ({ page }) => {
    const base = uniqueName('fm11')
    const filename = await createFile(page, base)
    const row = fileItem(page, filename)
    await row.click()
    await page.waitForTimeout(400)
    // Active row receives the bg-accent class.
    await expect(row).toHaveClass(/bg-accent/)
  })

  // ─── Rename file ─────────────────────────────────────────────────────────

  test('FM-12 Rename file — happy path', async ({ page }) => {
    const base = uniqueName('fm12')
    const filename = await createFile(page, base)
    const newBase = uniqueName('fm12-renamed')
    await openRowMenu(page, filename, 'Rename')
    await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
    const input = page.getByRole('dialog').getByRole('textbox')
    await input.fill(newBase)
    await page.getByTestId('rename-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
    await expect(fileItem(page, filename)).toHaveCount(0)
  })

  test('FM-13 Rename file — slash rejected', async ({ page }) => {
    const base = uniqueName('fm13')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Rename')
    const input = page.getByRole('dialog').getByRole('textbox')
    await input.fill('../bad')
    await page.getByTestId('rename-confirm-btn').click()
    await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
    await expect(page.getByText(/slashes/i)).toBeVisible()
  })

  test('FM-14 Rename file — rename to existing name', async ({ page }) => {
    const a = uniqueName('fm14a')
    const b = uniqueName('fm14b')
    const fileA = await createFile(page, a)
    await createFile(page, b)
    await openRowMenu(page, fileA, 'Rename')
    const input = page.getByRole('dialog').getByRole('textbox')
    await input.fill(b)
    await page.getByTestId('rename-confirm-btn').click()
    // Dialog stays open with an error.
    await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
    await expect(page.getByText(/already exists|exists/i).first()).toBeVisible()
  })

  test('FM-15 Rename file — same name is graceful', async ({ page }) => {
    const base = uniqueName('fm15')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Rename')
    // Confirm without modifying.
    await page.getByTestId('rename-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, filename)).toBeVisible()
  })

  test('FM-16 Rename file — Enter key submits', async ({ page }) => {
    const base = uniqueName('fm16')
    const filename = await createFile(page, base)
    const newBase = uniqueName('fm16-after')
    await openRowMenu(page, filename, 'Rename')
    const input = page.getByRole('dialog').getByRole('textbox')
    await input.fill(newBase)
    await input.press('Enter')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
  })

  test('FM-17 Rename file — cancel leaves file unchanged', async ({ page }) => {
    const base = uniqueName('fm17')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Rename')
    await page.getByRole('dialog').getByRole('textbox').fill('something-else')
    await page.getByTestId('rename-cancel-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, filename)).toBeVisible()
  })

  // ─── Duplicate file ──────────────────────────────────────────────────────

  test('FM-18 Duplicate file — happy path', async ({ page }) => {
    const base = uniqueName('fm18')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Duplicate')
    await expect(page.getByRole('heading', { name: 'Duplicate File' })).toBeVisible()
    // Default suggestion is `<base>-copy.yaml` — clear and use a unique name.
    const input = page.getByRole('dialog').getByRole('textbox')
    const dupBase = uniqueName('fm18-dup')
    await input.fill(dupBase)
    await page.getByRole('button', { name: 'Duplicate' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, `${dupBase}.yml`)).toBeVisible()
    await expect(fileItem(page, filename)).toBeVisible()
  })

  test('FM-19 Duplicate file — name pre-filled', async ({ page }) => {
    const base = uniqueName('fm19')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Duplicate')
    const input = page.getByRole('dialog').getByRole('textbox')
    await expect(input).toHaveValue(`${base}-copy.yaml`)
  })

  test('FM-20 Duplicate file — auto-increments if copy exists', async ({ page }) => {
    const base = uniqueName('fm20')
    const filename = await createFile(page, base)

    // Create the first copy.
    await openRowMenu(page, filename, 'Duplicate')
    let input = page.getByRole('dialog').getByRole('textbox')
    await expect(input).toHaveValue(`${base}-copy.yaml`)
    await page.getByRole('button', { name: 'Duplicate' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()

    // Open Duplicate again — suggestion should now be incremented.
    await openRowMenu(page, filename, 'Duplicate')
    input = page.getByRole('dialog').getByRole('textbox')
    await expect(input).toHaveValue(`${base}-copy-1.yaml`)
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  // ─── Delete file ─────────────────────────────────────────────────────────

  test('FM-21 Delete file — confirm', async ({ page }) => {
    const base = uniqueName('fm21')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Delete')
    await expect(page.getByRole('heading', { name: 'Delete Config File' })).toBeVisible()
    await page.getByTestId('delete-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, filename)).toHaveCount(0)
  })

  test('FM-22 Delete file — cancel', async ({ page }) => {
    const base = uniqueName('fm22')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Delete')
    await page.getByTestId('delete-cancel-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, filename)).toBeVisible()
  })

  test('FM-23 Delete active file', async ({ page }) => {
    const base = uniqueName('fm23')
    const filename = await createFile(page, base)
    await selectFile(page, filename)
    await openRowMenu(page, filename, 'Delete')
    await page.getByTestId('delete-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, filename)).toHaveCount(0)
    // Toolbar badge should fall back when no file is active. If other files
    // remain selected, "No file selected" may not appear — only assert the
    // deleted filename is no longer the active label.
    const badge = page.locator('span.font-mono', { hasText: filename })
    await expect(badge).toHaveCount(0)
  })

  test('FM-24 Delete last file', async ({ page }) => {
    // Delete every file in the list. We use a fresh page instance to avoid
    // depending on the seed state of /configs.
    const all = await page.getByTestId('file-item').all()
    for (const row of all) {
      const name = await row.getAttribute('data-filename')
      if (!name) continue
      await openRowMenu(page, name, 'Delete')
      await page.getByTestId('delete-confirm-btn').click()
      await expect(page.getByRole('dialog')).toBeHidden()
    }
    await expect(page.getByText(/No config files loaded|Create or upload/i).first()).toBeVisible()
  })

  // ─── Upload ──────────────────────────────────────────────────────────────

  test('FM-25 Upload valid YAML file', async ({ page }) => {
    const base = uniqueName('fm25')
    const filename = `${base}.yml`
    const upload = page.locator('input[type="file"]')
    await upload.setInputFiles({
      name: filename,
      mimeType: 'application/x-yaml',
      buffer: Buffer.from('global:\n  scrape_interval: 30s\n'),
    })
    await expect(fileItem(page, filename)).toBeVisible({ timeout: 5000 })
  })

  test('FM-26 Upload non-YAML file', async ({ page }) => {
    const filename = `${uniqueName('fm26')}.txt`
    const upload = page.locator('input[type="file"]')
    await upload.setInputFiles({
      name: filename,
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not yaml'),
    })
    await expect(page.getByText(/must end with .yml/i).first()).toBeVisible()
    await expect(fileItem(page, filename)).toHaveCount(0)
  })

  test('FM-27 Upload duplicate YAML filename', async ({ page }) => {
    const base = uniqueName('fm27')
    const filename = `${base}.yml`
    const upload = page.locator('input[type="file"]')
    await upload.setInputFiles({
      name: filename,
      mimeType: 'application/x-yaml',
      buffer: Buffer.from('global:\n  scrape_interval: 15s\n'),
    })
    await expect(fileItem(page, filename)).toBeVisible({ timeout: 5000 })
    // Re-upload the same filename — should trigger conflict resolution.
    await upload.setInputFiles({
      name: filename,
      mimeType: 'application/x-yaml',
      buffer: Buffer.from('global:\n  scrape_interval: 30s\n'),
    })
    await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  // ─── Refresh / metadata ──────────────────────────────────────────────────

  test('FM-28 Refresh file list', async ({ page }) => {
    const refresh = page.getByRole('button').filter({ has: page.locator('.lucide-refresh-cw, [class*="lucide-refresh"]') }).first()
    // Fall back to a tooltip-trigger lookup if the icon-class hint above is not enough.
    const target = (await refresh.count()) > 0
      ? refresh
      : page.locator('button', { has: page.locator('svg') }).filter({ hasText: '' }).nth(1)
    await target.click()
    // The list should still be present afterwards.
    await expect(page.getByText(/Config Files/).first()).toBeVisible()
  })

  test('FM-29 Config directory path displayed', async ({ page }) => {
    await expect(page.getByText('Config Directory')).toBeVisible()
    // The badge below the label should contain the path.
    const badge = page.locator('text=Config Directory').locator('..').locator('[data-slot="badge"], .font-mono').first()
    await expect(badge).toBeVisible()
  })

  test('FM-30 Rapid file clicks', async ({ page }) => {
    const a = await createFile(page, uniqueName('fm30a'))
    const b = await createFile(page, uniqueName('fm30b'))
    const c = await createFile(page, uniqueName('fm30c'))
    // Click rapidly without awaiting between.
    await fileItem(page, a).click()
    await fileItem(page, b).click()
    await fileItem(page, c).click()
    await page.waitForTimeout(800)
    await expect(fileItem(page, c)).toHaveClass(/bg-accent/)
  })

  // ─── Conflict resolution dialog ──────────────────────────────────────────

  test('FM-31 Conflict dialog — new valid name resolves conflict', async ({ page }) => {
    const base = uniqueName('fm31')
    await createFile(page, base)
    // Trigger conflict by attempting the same name.
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(base)
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
    const conflictInput = page.getByRole('dialog').getByRole('textbox')
    const altBase = uniqueName('fm31-alt')
    await conflictInput.fill(altBase)
    await page.getByRole('button', { name: 'Rename file' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(fileItem(page, `${altBase}.yml`)).toBeVisible()
  })

  test('FM-32 Conflict dialog — entering another existing name', async ({ page }) => {
    const a = uniqueName('fm32a')
    const b = uniqueName('fm32b')
    await createFile(page, a)
    await createFile(page, b)
    // Trigger conflict on `a`.
    await page.getByTestId('new-file-btn').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('prometheus').fill(a)
    await page.getByTestId('create-file-confirm-btn').click()
    await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
    const conflictInput = page.getByRole('dialog').getByRole('textbox')
    await conflictInput.fill(b)
    await page.getByRole('button', { name: 'Rename file' }).click()
    await expect(page.getByText('That filename also exists')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('FM-33 Duplicate file — cancel', async ({ page }) => {
    const base = uniqueName('fm33')
    const filename = await createFile(page, base)
    await openRowMenu(page, filename, 'Duplicate')
    const input = page.getByRole('dialog').getByRole('textbox')
    const initialValue = await input.inputValue()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    // The suggested copy filename was never created.
    await expect(fileItem(page, initialValue)).toHaveCount(0)
    await expect(fileItem(page, filename)).toBeVisible()
  })

  // ─── Unsaved changes guard (UC) ──────────────────────────────────────────

  test.describe('Unsaved changes guard', () => {
    async function setupDirty(page: import('@playwright/test').Page): Promise<{
      a: string
      b: string
    }> {
      const a = await createFile(page, uniqueName('uc-a'))
      const b = await createFile(page, uniqueName('uc-b'))
      await selectFile(page, a)
      const dirty = await appendInEditor(page, '\n# unsaved')
      if (!dirty) test.skip(true, 'Monaco not available in this environment')
      return { a, b }
    }

    test('UC-01 Guard fires on file switch', async ({ page }) => {
      const { a, b } = await setupDirty(page)
      await fileItem(page, b).click()
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
      // We stayed on `a`.
      await expect(fileItem(page, a)).toHaveClass(/bg-accent/)
    })

    test('UC-02 Guard fires on new file action', async ({ page }) => {
      await setupDirty(page)
      await page.getByTestId('new-file-btn').click()
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
    })

    test('UC-03 Guard fires on rename action', async ({ page }) => {
      const { a } = await setupDirty(page)
      await openRowMenu(page, a, 'Rename')
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
    })

    test('UC-04 Guard fires on duplicate action', async ({ page }) => {
      const { a } = await setupDirty(page)
      await openRowMenu(page, a, 'Duplicate')
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
    })

    test('UC-05 "Keep" — stays on current file', async ({ page }) => {
      const { a, b } = await setupDirty(page)
      await fileItem(page, b).click()
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
      await expect(page.getByRole('dialog')).toBeHidden()
      await expect(fileItem(page, a)).toHaveClass(/bg-accent/)
    })

    test('UC-06 "Discard" — proceeds with action', async ({ page }) => {
      const { a, b } = await setupDirty(page)
      await fileItem(page, b).click()
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('discard-changes-btn').click()
      await expect(page.getByRole('dialog')).toBeHidden()
      await expect(fileItem(page, b)).toHaveClass(/bg-accent/)
      // The originally-active file no longer has the active highlight.
      await expect(fileItem(page, a)).not.toHaveClass(/bg-accent/)
    })

    test('UC-07 No guard with no edits', async ({ page }) => {
      const a = await createFile(page, uniqueName('uc07-a'))
      const b = await createFile(page, uniqueName('uc07-b'))
      await selectFile(page, a)
      await fileItem(page, b).click()
      await page.waitForTimeout(400)
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toHaveCount(0)
      await expect(fileItem(page, b)).toHaveClass(/bg-accent/)
    })

    test('UC-08 Guard fires on delete action', async ({ page }) => {
      const { a } = await setupDirty(page)
      await openRowMenu(page, a, 'Delete')
      await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible()
      await page.getByTestId('keep-changes-btn').click()
    })
  })
})
