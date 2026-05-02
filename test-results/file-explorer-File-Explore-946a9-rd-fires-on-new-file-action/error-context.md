# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> Unsaved changes guard >> UC-02 Guard fires on new file action
- Location: tests\e2e\file-explorer.spec.ts:454:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import {
  3   |   appendInEditor,
  4   |   createFile,
  5   |   fileItem,
  6   |   openRowMenu,
  7   |   selectFile,
  8   |   uniqueName,
  9   |   waitForApp,
  10  | } from './utils/helpers'
  11  | 
  12  | test.describe('File Explorer Panel', () => {
  13  |   test.beforeEach(async ({ page }) => {
> 14  |     await page.goto('/')
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  15  |     await waitForApp(page)
  16  |   })
  17  | 
  18  |   // ─── Create file ──────────────────────────────────────────────────────────
  19  | 
  20  |   test('FM-01 Create file — happy path', async ({ page }) => {
  21  |     const base = uniqueName('fm01')
  22  |     const filename = await createFile(page, base)
  23  |     await expect(fileItem(page, filename)).toBeVisible()
  24  |     // The newly created file becomes active — its filename is shown in the YAML preview header.
  25  |     await expect(page.getByText(filename, { exact: false }).first()).toBeVisible()
  26  |   })
  27  | 
  28  |   test('FM-02 Create file — extension auto-appended', async ({ page }) => {
  29  |     const base = uniqueName('fm02')
  30  |     await page.getByTestId('new-file-btn').click()
  31  |     const dialog = page.getByRole('dialog')
  32  |     await dialog.getByPlaceholder('prometheus').fill(base)
  33  |     // The dialog shows a preview "Will be saved as <base>.yml" before the user confirms.
  34  |     await expect(dialog.getByText(`${base}.yml`)).toBeVisible()
  35  |     await page.getByTestId('create-file-confirm-btn').click()
  36  |     await expect(dialog).toBeHidden()
  37  |     await expect(fileItem(page, `${base}.yml`)).toBeVisible()
  38  |   })
  39  | 
  40  |   test('FM-03 Create file — empty name rejected', async ({ page }) => {
  41  |     await page.getByTestId('new-file-btn').click()
  42  |     const dialog = page.getByRole('dialog')
  43  |     await page.getByTestId('create-file-confirm-btn').click()
  44  |     await expect(dialog).toBeVisible()
  45  |     await expect(page.getByText('Filename is required')).toBeVisible()
  46  |   })
  47  | 
  48  |   test('FM-04 Create file — whitespace-only name rejected', async ({ page }) => {
  49  |     await page.getByTestId('new-file-btn').click()
  50  |     const dialog = page.getByRole('dialog')
  51  |     await dialog.getByPlaceholder('prometheus').fill('   ')
  52  |     await page.getByTestId('create-file-confirm-btn').click()
  53  |     await expect(dialog).toBeVisible()
  54  |     await expect(page.getByText('Filename is required')).toBeVisible()
  55  |   })
  56  | 
  57  |   test('FM-05 Create file — slash in name rejected', async ({ page }) => {
  58  |     await page.getByTestId('new-file-btn').click()
  59  |     const dialog = page.getByRole('dialog')
  60  |     await dialog.getByPlaceholder('prometheus').fill('../escape')
  61  |     await page.getByTestId('create-file-confirm-btn').click()
  62  |     await expect(dialog).toBeVisible()
  63  |     await expect(page.getByText(/slashes/i)).toBeVisible()
  64  |   })
  65  | 
  66  |   test('FM-06 Create file — `.yml`-only name rejected', async ({ page }) => {
  67  |     await page.getByTestId('new-file-btn').click()
  68  |     const dialog = page.getByRole('dialog')
  69  |     await dialog.getByPlaceholder('prometheus').fill('.yml')
  70  |     await page.getByTestId('create-file-confirm-btn').click()
  71  |     await expect(dialog).toBeVisible()
  72  |     await expect(page.getByText('Filename is required')).toBeVisible()
  73  |   })
  74  | 
  75  |   test('FM-07 Create file — duplicate name triggers conflict', async ({ page }) => {
  76  |     const base = uniqueName('fm07')
  77  |     await createFile(page, base)
  78  |     // Try to create the same name again
  79  |     await page.getByTestId('new-file-btn').click()
  80  |     const dialog = page.getByRole('dialog')
  81  |     await dialog.getByPlaceholder('prometheus').fill(base)
  82  |     await page.getByTestId('create-file-confirm-btn').click()
  83  |     await expect(page.getByRole('heading', { name: 'File already exists' })).toBeVisible()
  84  |     // Suggested alternative is pre-filled in the conflict dialog.
  85  |     const newNameInput = page.getByRole('dialog').getByRole('textbox')
  86  |     await expect(newNameInput).not.toHaveValue('')
  87  |   })
  88  | 
  89  |   test('FM-08 Create file — cancel discards input', async ({ page }) => {
  90  |     const base = uniqueName('fm08')
  91  |     await page.getByTestId('new-file-btn').click()
  92  |     const dialog = page.getByRole('dialog')
  93  |     await dialog.getByPlaceholder('prometheus').fill(base)
  94  |     await page.getByTestId('create-file-cancel-btn').click()
  95  |     await expect(dialog).toBeHidden()
  96  |     // No file with that name should exist.
  97  |     await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
  98  |     // Reopening the dialog should show empty input.
  99  |     await page.getByTestId('new-file-btn').click()
  100 |     await expect(page.getByRole('dialog').getByPlaceholder('prometheus')).toHaveValue('')
  101 |     await page.getByTestId('create-file-cancel-btn').click()
  102 |   })
  103 | 
  104 |   test('FM-09 Create file — Enter key submits', async ({ page }) => {
  105 |     const base = uniqueName('fm09')
  106 |     await page.getByTestId('new-file-btn').click()
  107 |     const dialog = page.getByRole('dialog')
  108 |     await dialog.getByPlaceholder('prometheus').fill(base)
  109 |     await dialog.getByPlaceholder('prometheus').press('Enter')
  110 |     await expect(dialog).toBeHidden()
  111 |     await expect(fileItem(page, `${base}.yml`)).toBeVisible()
  112 |   })
  113 | 
  114 |   test('FM-10 Create file — Escape closes dialog', async ({ page }) => {
```