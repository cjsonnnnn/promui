import { test, expect, type Page } from '@playwright/test'
import {
  createFile,
  readEditorText,
  selectFile,
  setEditorValue,
  uniqueName,
  waitForApp,
} from './utils/helpers'

function treeButton(page: Page, label: string) {
  return page.locator('button', { hasText: label }).first()
}

async function gotoGlobal(page: Page): Promise<void> {
  await treeButton(page, 'Global').click()
  await page.waitForTimeout(200)
}

async function gotoScrapeConfigs(page: Page): Promise<void> {
  await treeButton(page, 'Scrape Configs').click()
  await page.waitForTimeout(200)
}

const GROUPED_YAML = [
  'global:',
  '  scrape_interval: 15s',
  'scrape_configs:',
  '# ===== Backend =====',
  '  - job_name: backend-api',
  '    static_configs:',
  '      - targets: ["api:9090"]',
  '# ===== Frontend =====',
  '  - job_name: frontend-web',
  '    static_configs:',
  '      - targets: ["web:9100"]',
  '  - job_name: solo',
  '    static_configs:',
  '      - targets: ["solo:9100"]',
  '',
].join('\n')

test.describe('Section Editor Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  // ─── Global section (ED-20..23) ──────────────────────────────────────────

  test('ED-20 Global — scrape_interval accepts valid duration', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed20'))
    await selectFile(page, filename)
    await gotoGlobal(page)
    const input = page.locator('input[placeholder="15s"]').first()
    await input.fill('30s')
    await page.waitForTimeout(400)
    const yaml = await readEditorText(page)
    expect(yaml).toMatch(/scrape_interval:\s*30s/)
  })

  test('ED-21 Global — evaluation_interval accepts valid duration', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed21'))
    await selectFile(page, filename)
    await gotoGlobal(page)
    const inputs = page.locator('input[placeholder="15s"]')
    // Second "15s" input is evaluation_interval (scrape_timeout uses "10s").
    const evalInput = inputs.nth(1)
    await evalInput.fill('1m')
    await page.waitForTimeout(400)
    const yaml = await readEditorText(page)
    expect(yaml).toMatch(/evaluation_interval:\s*1m/)
  })

  test('ED-22 Global — invalid duration shows inline error', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed22'))
    await selectFile(page, filename)
    await gotoGlobal(page)
    const input = page.locator('input[placeholder="15s"]').first()
    await input.fill('1x')
    await page.waitForTimeout(400)
    // Validate the config so errors surface.
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(400)
    // Validation errors render inline at top of the YAML preview.
    await expect(
      page.locator('[data-slot="badge"][class*="destructive"]').first()
    ).toBeVisible({ timeout: 4000 })
  })

  test('ED-23 Global — changes reflected in YAML editor', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed23'))
    await selectFile(page, filename)
    await gotoGlobal(page)
    const input = page.locator('input[placeholder="15s"]').first()
    await input.fill('45s')
    await page.waitForTimeout(400)
    const yaml = await readEditorText(page)
    expect(yaml).toMatch(/scrape_interval:\s*45s/)
  })

  // ─── Scrape configs (ED-24..30) ──────────────────────────────────────────

  test('ED-24 Scrape configs — all jobs listed', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed24'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    await expect(page.getByText('backend-api', { exact: true })).toBeVisible({ timeout: 4000 })
    await expect(page.getByText('frontend-web', { exact: true })).toBeVisible()
    await expect(page.getByText('solo', { exact: true })).toBeVisible()
  })

  test('ED-25 Add scrape job — opens modal', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed25'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible({ timeout: 3000 })
    // Job name input is empty.
    await expect(page.locator('#jobName')).toHaveValue('')
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('ED-26 Add scrape job — saved', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed26'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible({ timeout: 3000 })
    const jobName = `job-${Math.random().toString(36).slice(2, 7)}`
    await page.locator('#jobName').fill(jobName)
    // Fill the first target.
    const targetInputs = page.locator('input[placeholder*="192.168"]')
    await targetInputs.first().fill('localhost:9100')
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toHaveCount(0, { timeout: 3000 })
    await expect(page.getByText(jobName, { exact: true })).toBeVisible({ timeout: 4000 })
    const yaml = await readEditorText(page)
    expect(yaml).toContain(jobName)
  })

  test('ED-27 Edit scrape job — modal pre-filled', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed27'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    // Find the row for "backend-api" and click its menu, then Edit.
    const row = page.locator('div').filter({ has: page.getByText('backend-api', { exact: true }) }).first()
    const menuBtn = row
      .locator('button')
      .filter({ has: page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal') })
      .first()
    await menuBtn.click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: 'Edit Job' })).toBeVisible({ timeout: 3000 })
    await expect(page.locator('#jobName')).toHaveValue('backend-api')
    // Target should be present.
    const targetInputs = page.locator('input[placeholder*="192.168"]')
    await expect(targetInputs.first()).toHaveValue('api:9090')
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('ED-28 Edit scrape job — cancel discards', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed28'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    const row = page.locator('div').filter({ has: page.getByText('backend-api', { exact: true }) }).first()
    const menuBtn = row
      .locator('button')
      .filter({ has: page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal') })
      .first()
    await menuBtn.click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: 'Edit Job' })).toBeVisible({ timeout: 3000 })
    await page.locator('#jobName').fill('changed-name')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Edit Job' })).toHaveCount(0)
    // Original name preserved.
    await expect(page.getByText('backend-api', { exact: true })).toBeVisible()
    await expect(page.getByText('changed-name', { exact: true })).toHaveCount(0)
  })

  test('ED-29 Delete scrape job', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed29'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    const row = page.locator('div').filter({ has: page.getByText('solo', { exact: true }) }).first()
    const menuBtn = row
      .locator('button')
      .filter({ has: page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal') })
      .first()
    await menuBtn.click()
    await page.getByRole('menuitem', { name: 'Delete job' }).click()
    // A confirmation dialog appears.
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      const confirmBtn = dialog
        .getByRole('button', { name: /delete|remove/i })
        .first()
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click()
      }
    }
    await page.waitForTimeout(500)
    await expect(page.getByText('solo', { exact: true })).toHaveCount(0)
    const yaml = await readEditorText(page)
    expect(yaml).not.toMatch(/^\s*-\s*job_name:\s*solo\s*$/m)
  })

  test('ED-30 Add scrape job — empty job_name rejected', async ({ page }) => {
    const filename = await createFile(page, uniqueName('ed30'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible({ timeout: 3000 })
    // Submit without a job name.
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByText('Job name is required')).toBeVisible({ timeout: 3000 })
    // Modal still open.
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  // ─── Prefix View (PV-01..06) ─────────────────────────────────────────────

  test('PV-01 Prefix View — starts inactive', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv01'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    await expect(page.getByTestId('prefix-view-btn')).toHaveAttribute('aria-pressed', 'false')
  })

  test('PV-02 Prefix View — activate', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv02'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    const btn = page.getByTestId('prefix-view-btn')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    // After activating, jobs are organized by prefix — "backend-*" header appears.
    await expect(page.getByText(/backend-\*/).first()).toBeVisible({ timeout: 3000 })
  })

  test('PV-03 Prefix View — deactivate', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv03'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    const btn = page.getByTestId('prefix-view-btn')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  test('PV-04 Prefix View active — button style', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv04'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    const btn = page.getByTestId('prefix-view-btn')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    // Active button uses bg-primary or bg-foreground (default variant).
    await expect(btn).toHaveClass(/bg-primary/)
  })

  test('PV-05 Prefix View inactive — button style', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv05'))
    await selectFile(page, filename)
    await gotoScrapeConfigs(page)
    const btn = page.getByTestId('prefix-view-btn')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    // Outline variant — has border but not bg-primary.
    await expect(btn).toHaveClass(/border/)
    await expect(btn).not.toHaveClass(/bg-primary/)
  })

  test('PV-06 Prefix View — does not modify YAML', async ({ page }) => {
    const filename = await createFile(page, uniqueName('pv06'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    await page.waitForTimeout(400)
    const before = await readEditorText(page)
    await page.getByTestId('prefix-view-btn').click()
    await page.waitForTimeout(300)
    await page.getByTestId('prefix-view-btn').click()
    await page.waitForTimeout(300)
    const after = await readEditorText(page)
    expect(after).toBe(before)
  })

  // ─── Grouping (GR-01..06) ────────────────────────────────────────────────

  test('GR-01 Groups shown as separators', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr01'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    // The group section header renders with the group label as text.
    await expect(page.getByText('Backend', { exact: true }).first()).toBeVisible({ timeout: 4000 })
    await expect(page.getByText('Frontend', { exact: true }).first()).toBeVisible()
  })

  test('GR-02 Jobs appear under their group', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr02'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    // The Backend section contains backend-api, the Frontend section contains
    // frontend-web. Validate by finding the group panel container that wraps
    // both the header and the job rows.
    const backendSection = page
      .locator('.rounded-lg.border')
      .filter({ has: page.getByText('Backend', { exact: true }) })
      .first()
    await expect(backendSection.getByText('backend-api', { exact: true })).toBeVisible()
    const frontendSection = page
      .locator('.rounded-lg.border')
      .filter({ has: page.getByText('Frontend', { exact: true }) })
      .first()
    await expect(frontendSection.getByText('frontend-web', { exact: true })).toBeVisible()
  })

  test('GR-03 Ungrouped jobs in default section', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr03'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      [
        'global:',
        '  scrape_interval: 15s',
        'scrape_configs:',
        '  - job_name: orphan',
        '    static_configs:',
        '      - targets: ["x:9100"]',
        '',
      ].join('\n')
    )
    await gotoScrapeConfigs(page)
    // The default ungrouped section header appears.
    await expect(page.getByText('Ungrouped', { exact: true }).first()).toBeVisible({ timeout: 4000 })
    const ungroupedSection = page
      .locator('.rounded-lg.border')
      .filter({ has: page.getByText('Ungrouped', { exact: true }) })
      .first()
    await expect(ungroupedSection.getByText('orphan', { exact: true })).toBeVisible()
  })

  test('GR-04 Group name extracted from comment', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr04'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      [
        'global:',
        '  scrape_interval: 15s',
        'scrape_configs:',
        '# ===== My Group =====',
        '  - job_name: alpha',
        '    static_configs:',
        '      - targets: ["a:9100"]',
        '',
      ].join('\n')
    )
    await gotoScrapeConfigs(page)
    await expect(page.getByText('My Group', { exact: true }).first()).toBeVisible({ timeout: 4000 })
  })

  test('GR-05 Group structure preserved on edit', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr05'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoScrapeConfigs(page)
    // Edit backend-api: change scrape_interval via the modal.
    const row = page.locator('div').filter({ has: page.getByText('backend-api', { exact: true }) }).first()
    const menuBtn = row
      .locator('button')
      .filter({ has: page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal') })
      .first()
    await menuBtn.click()
    await page.getByRole('menuitem', { name: 'Edit' }).click()
    await expect(page.getByRole('heading', { name: 'Edit Job' })).toBeVisible({ timeout: 3000 })
    await page.locator('input[placeholder="e.g., 15s"]').first().fill('45s')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await page.waitForTimeout(400)
    const yaml = await readEditorText(page)
    expect(yaml).toContain('Backend')
    expect(yaml).toContain('backend-api')
    // Group header for Backend is preserved.
    expect(yaml).toMatch(/=====\s*Backend\s*=====/)
  })

  test('GR-06 Multiple groups all rendered', async ({ page }) => {
    const filename = await createFile(page, uniqueName('gr06'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      [
        'global:',
        '  scrape_interval: 15s',
        'scrape_configs:',
        '# ===== Alpha =====',
        '  - job_name: a-job',
        '    static_configs:',
        '      - targets: ["a:9100"]',
        '# ===== Beta =====',
        '  - job_name: b-job',
        '    static_configs:',
        '      - targets: ["b:9100"]',
        '# ===== Gamma =====',
        '  - job_name: g-job',
        '    static_configs:',
        '      - targets: ["g:9100"]',
        '',
      ].join('\n')
    )
    await gotoScrapeConfigs(page)
    for (const name of ['Alpha', 'Beta', 'Gamma']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 4000 })
    }
  })
})
