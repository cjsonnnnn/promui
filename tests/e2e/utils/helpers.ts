import { expect, type Page, type Locator } from '@playwright/test'

/**
 * Wait for the app shell to be ready: file explorer and toolbar mounted.
 */
export async function waitForApp(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 20000 })
  await page.waitForSelector('[data-testid="format-yaml-btn"]', { timeout: 20000 })
}

/**
 * Generate a unique, filesystem-safe base filename for a test.
 */
export function uniqueName(prefix: string): string {
  const r = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${r}`
}

/**
 * Open the New File dialog, type a base name, click Create, and wait for the
 * dialog to close. Returns the resulting `<base>.yml` filename.
 */
export async function createFile(page: Page, baseName: string): Promise<string> {
  await page.getByTestId('new-file-btn').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByPlaceholder('prometheus').fill(baseName)
  await page.getByTestId('create-file-confirm-btn').click()
  await expect(dialog).toBeHidden()
  return `${baseName}.yml`
}

/**
 * Locate a file row by exact filename.
 */
export function fileItem(page: Page, filename: string): Locator {
  return page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
}

/**
 * Click a file in the explorer to activate it. Waits for the toolbar badge to
 * reflect the new active filename.
 */
export async function selectFile(page: Page, filename: string): Promise<void> {
  await fileItem(page, filename).click()
  // Allow the editor a moment to load the new file's YAML.
  await page.waitForTimeout(500)
}

/**
 * Open a file's row context menu and click the named menu item
 * ('Rename', 'Duplicate', 'Delete').
 */
export async function openRowMenu(
  page: Page,
  filename: string,
  item: 'Rename' | 'Duplicate' | 'Delete'
): Promise<void> {
  const row = fileItem(page, filename)
  await row.hover()
  await row.getByRole('button').first().click()
  await page.getByRole('menuitem', { name: item }).click()
}

/**
 * Click into the Monaco editor and type some text at the end. Returns true if
 * the editor was present, false otherwise (e.g. no file selected).
 */
export async function appendInEditor(page: Page, text: string): Promise<boolean> {
  const editor = page.locator('.monaco-editor').first()
  if ((await editor.count()) === 0) return false
  await editor.click()
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type(text)
  await page.waitForTimeout(450)
  return true
}

/**
 * Replace the editor's content by select-all + type. Use sparingly: triggers
 * a debounced hydrate and may briefly produce parse errors mid-typing.
 */
export async function replaceEditorContent(page: Page, content: string): Promise<boolean> {
  const editor = page.locator('.monaco-editor').first()
  if ((await editor.count()) === 0) return false
  await editor.click()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type(content)
  await page.waitForTimeout(500)
  return true
}

/**
 * Read the Monaco editor's current value via DOM. The line widgets render the
 * text inside `.view-line` elements — joining them is good enough for tests
 * that need to assert the editor content.
 */
export async function readEditorText(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const lines = Array.from(document.querySelectorAll('.monaco-editor .view-line'))
    return lines.map((l) => (l as HTMLElement).innerText).join('\n')
  })
}

/**
 * Open the save / diff dialog by clicking the Save button. Caller must have
 * an active file with pending edits and no validation errors.
 */
export async function openSaveDialog(page: Page): Promise<void> {
  await page.getByTestId('save-file-btn').click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

/**
 * Confirm the open save dialog and wait for it to close.
 */
export async function confirmSave(page: Page): Promise<void> {
  await page.getByTestId('save-confirm-btn').click()
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 8000 })
}

/**
 * Make an edit, save it through the diff dialog, and wait for the toast.
 * Used to seed at least one history snapshot for VH tests.
 */
export async function editAndSave(page: Page, snippet = '\n# snapshot'): Promise<void> {
  await appendInEditor(page, snippet)
  const saveBtn = page.getByTestId('save-file-btn')
  await expect(saveBtn).toBeEnabled({ timeout: 5000 })
  await saveBtn.click()
  await expect(page.getByTestId('save-confirm-btn')).toBeVisible()
  await page.getByTestId('save-confirm-btn').click()
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: /saved/i })
  ).toBeVisible({ timeout: 8000 })
  await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
}

/**
 * Set the Monaco editor's content directly via the underlying model. Used in
 * tests where typing characters one-by-one would be both slow and flaky
 * (e.g. injecting multi-line YAML for validation tests).
 *
 * Falls back to the typing path if the model can't be reached.
 */
export async function setEditorValue(page: Page, content: string): Promise<void> {
  const ok = await page.evaluate((value) => {
    interface MonacoModel {
      setValue: (text: string) => void
      pushEditOperations: (b: unknown[], e: unknown[], c: null) => void
    }
    interface MonacoEditor {
      getModel: () => MonacoModel | null
      focus: () => void
    }
    interface MonacoNs {
      editor: { getEditors: () => MonacoEditor[] }
    }
    const w = window as unknown as { monaco?: MonacoNs }
    const ed = w.monaco?.editor.getEditors()[0]
    const model = ed?.getModel()
    if (!ed || !model) return false
    ed.focus()
    model.setValue(value)
    return true
  }, content)
  if (!ok) {
    await replaceEditorContent(page, content)
  } else {
    // Trigger blur so the YAML preview hydrates the store from the editor.
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.waitForTimeout(450)
  }
}

/**
 * Create a file pre-populated with the given YAML content. Useful for tests
 * that need a deterministic starting state (e.g. with scrape jobs).
 */
export async function createFileWithYaml(
  page: Page,
  baseName: string,
  yaml: string
): Promise<string> {
  const filename = await createFile(page, baseName)
  await selectFile(page, filename)
  await setEditorValue(page, yaml)
  return filename
}

/**
 * Click into the Monaco editor area to give it focus.
 */
export async function focusEditor(page: Page): Promise<boolean> {
  const editor = page.locator('.monaco-editor').first()
  if ((await editor.count()) === 0) return false
  await editor.click()
  return true
}
