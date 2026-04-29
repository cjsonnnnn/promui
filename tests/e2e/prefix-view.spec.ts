import { test, expect } from '@playwright/test'

test.describe('Prefix View button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to hydrate
    await page.waitForSelector('[data-testid="prefix-view-btn"]')
  })

  test('starts in inactive state', async ({ page }) => {
    const btn = page.getByTestId('prefix-view-btn')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  test('toggles to active on first click', async ({ page }) => {
    const btn = page.getByTestId('prefix-view-btn')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  test('toggles back to inactive on second click', async ({ page }) => {
    const btn = page.getByTestId('prefix-view-btn')
    await btn.click()
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
  })
})
