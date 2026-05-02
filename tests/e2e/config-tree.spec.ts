import { test, expect, type Page } from '@playwright/test'
import {
  createFile,
  selectFile,
  setEditorValue,
  uniqueName,
  waitForApp,
} from './utils/helpers'

async function deleteAllFiles(page: Page): Promise<void> {
  const rows = await page.getByTestId('file-item').all()
  for (const row of rows) {
    const name = await row.getAttribute('data-filename')
    if (!name) continue
    await row.hover()
    await row.getByRole('button').first().click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByTestId('delete-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden()
  }
}

function treeButton(page: Page, label: string) {
  return page.locator('button', { hasText: label }).first()
}

test.describe('Config Tree Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  test('CN-01 All eight sections listed', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn01'))
    await selectFile(page, filename)
    for (const label of [
      'Global',
      'Scrape Configs',
      'Rule Files',
      'Alerting / Alertmanagers',
      'Remote Write',
      'Remote Read',
      'Storage',
      'Tracing',
    ]) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
  })

  test('CN-02 Click section switches editor', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn02'))
    await selectFile(page, filename)
    // Click "Scrape Configs" in the tree.
    await treeButton(page, 'Scrape Configs').click()
    await page.waitForTimeout(300)
    // The Scrape Configurations section header is visible.
    await expect(page.getByRole('heading', { name: 'Scrape Configurations' })).toBeVisible({ timeout: 3000 })
    // Switch to Global.
    await treeButton(page, 'Global').click()
    await page.waitForTimeout(300)
    await expect(page.getByRole('heading', { name: 'Global Configuration' })).toBeVisible({ timeout: 3000 })
  })

  test('CN-03 Active section visually indicated', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn03'))
    await selectFile(page, filename)
    const globalBtn = treeButton(page, 'Global')
    await globalBtn.click()
    await page.waitForTimeout(200)
    await expect(globalBtn).toHaveClass(/bg-accent/)
    // Other sections should not be active.
    const scrapeBtn = treeButton(page, 'Scrape Configs')
    await expect(scrapeBtn).not.toHaveClass(/bg-accent/)
  })

  test('CN-04 Empty state with no file', async ({ page }) => {
    await deleteAllFiles(page)
    // The tree items render with reduced opacity when no file is loaded.
    const globalBtn = treeButton(page, 'Global')
    await expect(globalBtn).toBeVisible()
    await expect(globalBtn).toHaveClass(/opacity-50/)
  })

  test('CN-05 Panel collapse', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn05'))
    await selectFile(page, filename)
    // The collapse button has the panel-right-close icon, inside the
    // "Configuration" tree header. Locate the heading then click the
    // sibling icon button.
    const header = page.getByText('Configuration', { exact: true }).first()
    await expect(header).toBeVisible()
    const collapseBtn = header.locator('..').getByRole('button').first()
    await collapseBtn.click()
    await page.waitForTimeout(300)
    // After collapse, the reopen affordance "Config" sidebar appears.
    await expect(page.locator('button[title="Expand Config Panel"]')).toBeVisible({ timeout: 3000 })
  })

  test('CN-06 Sections with non-default content indicated', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn06'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      [
        'global:',
        '  scrape_interval: 15s',
        'scrape_configs:',
        '  - job_name: alpha',
        '    static_configs:',
        '      - targets: ["a:9100"]',
        '',
      ].join('\n')
    )
    // Sections with content should NOT have opacity-50 (they're enabled).
    const scrapeBtn = treeButton(page, 'Scrape Configs')
    await expect(scrapeBtn).not.toHaveClass(/opacity-50/)
    // The badge inside Scrape Configs row should display "1".
    const badge = scrapeBtn.locator('[data-slot="badge"]').first()
    await expect(badge).toBeVisible({ timeout: 3000 })
    await expect(badge).toHaveText('1')
    // Tracing has no data — the row should be dimmed.
    await expect(treeButton(page, 'Tracing')).toHaveClass(/opacity-50/)
  })

  test('CN-07 Section switch preserves other section edits', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn07'))
    await selectFile(page, filename)
    // Edit global first.
    await treeButton(page, 'Global').click()
    await page.waitForTimeout(200)
    const scrapeIntervalInput = page.getByPlaceholder('15s').first()
    await scrapeIntervalInput.fill('45s')
    await page.waitForTimeout(200)
    // Switch to scrape configs.
    await treeButton(page, 'Scrape Configs').click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('heading', { name: 'Scrape Configurations' })).toBeVisible()
    // Switch back to Global — the previous edit should still be there.
    await treeButton(page, 'Global').click()
    await page.waitForTimeout(200)
    await expect(page.locator('input').filter({ hasText: '' }).filter({ hasText: '' }).first()).toBeVisible()
    const value = await page.locator('input[placeholder="15s"]').first().inputValue()
    expect(value).toBe('45s')
  })

  test('CN-08 Panel re-expands after collapse', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cn08'))
    await selectFile(page, filename)
    const header = page.getByText('Configuration', { exact: true }).first()
    const collapseBtn = header.locator('..').getByRole('button').first()
    await collapseBtn.click()
    await page.waitForTimeout(300)
    const reopenBtn = page.locator('button[title="Expand Config Panel"]')
    await expect(reopenBtn).toBeVisible({ timeout: 3000 })
    await reopenBtn.click()
    await page.waitForTimeout(300)
    // Tree section list is visible again.
    await expect(page.getByText('Configuration', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Scrape Configs').first()).toBeVisible()
  })
})
