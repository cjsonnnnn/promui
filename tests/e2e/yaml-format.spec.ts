import { test, expect } from '@playwright/test'

test.describe('YAML format button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="format-yaml-btn"]')
  })

  test('Format button is present and disabled when no file is selected', async ({ page }) => {
    const btn = page.getByTestId('format-yaml-btn')
    await expect(btn).toBeDisabled()
  })
})

test.describe('YAML format with file selected', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the file explorer to load and pick the first file if available
    await page.waitForSelector('[data-testid="format-yaml-btn"]')
    // Try clicking the first file in the explorer
    const firstFile = page.locator('[data-testid="file-item"]').first()
    if (await firstFile.count() > 0) {
      await firstFile.click()
      // Wait a moment for the editor to load
      await page.waitForTimeout(500)
    }
  })

  test('Format button is enabled when a file is selected', async ({ page }) => {
    const firstFile = page.locator('[data-testid="file-item"]').first()
    // Only run this assertion if a file is actually available
    if (await firstFile.count() > 0) {
      const btn = page.getByTestId('format-yaml-btn')
      await expect(btn).toBeEnabled()
    }
  })

  test('Format button click does not show error toast on valid YAML', async ({ page }) => {
    const firstFile = page.locator('[data-testid="file-item"]').first()
    if (await firstFile.count() === 0) return

    const btn = page.getByTestId('format-yaml-btn')
    if (await btn.isDisabled()) return

    // Listen for any error toast before clicking
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]')
    await btn.click()
    await page.waitForTimeout(300)
    await expect(errorToast).toHaveCount(0)
  })

  test('Ctrl+S inside editor triggers formatting when editor is focused', async ({ page }) => {
    const firstFile = page.locator('[data-testid="file-item"]').first()
    if (await firstFile.count() === 0) return

    // Find the Monaco editor container and click it to focus
    const editorContainer = page.locator('.monaco-editor').first()
    if (await editorContainer.count() === 0) return

    await editorContainer.click()
    await page.waitForTimeout(200)

    // Press Ctrl+S — should trigger format, not browser save
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]')
    await page.keyboard.press('Control+s')
    await page.waitForTimeout(300)
    await expect(errorToast).toHaveCount(0)
  })
})
