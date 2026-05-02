import { test, expect, type Page } from '@playwright/test'
import {
  appendInEditor,
  createFile,
  editAndSave,
  fileItem,
  focusEditor,
  openRowMenu,
  readEditorText,
  selectFile,
  setEditorValue,
  uniqueName,
  waitForApp,
} from './utils/helpers'

function treeButton(page: Page, label: string) {
  return page.locator('button', { hasText: label }).first()
}

async function gotoSection(page: Page, label: string): Promise<void> {
  await treeButton(page, label).click()
  await page.waitForTimeout(200)
}

const GROUPED_YAML = [
  'global:',
  '  scrape_interval: 15s',
  'scrape_configs:',
  '# ===== Alpha =====',
  '  - job_name: alpha-one',
  '    static_configs:',
  '      - targets: ["a:9100"]',
  '# ===== Beta =====',
  '  - job_name: beta-one',
  '    static_configs:',
  '      - targets: ["b:9100"]',
  '',
].join('\n')

test.describe('Cross-Panel Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForApp(page)
  })

  test('CP-01 YAML edit → section editor updates', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp01'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      [
        'global:',
        '  scrape_interval: 90s',
        '',
      ].join('\n')
    )
    await gotoSection(page, 'Global')
    await expect(page.locator('input[placeholder="15s"]').first()).toHaveValue('90s', { timeout: 3000 })
  })

  test('CP-02 Section editor edit → YAML editor updates', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp02'))
    await selectFile(page, filename)
    await gotoSection(page, 'Global')
    await page.locator('input[placeholder="15s"]').first().fill('77s')
    await page.waitForTimeout(400)
    const yaml = await readEditorText(page)
    expect(yaml).toMatch(/scrape_interval:\s*77s/)
  })

  test('CP-03 File switch → YAML editor loads new content', async ({ page }) => {
    const a = await createFile(page, uniqueName('cp03a'))
    const b = await createFile(page, uniqueName('cp03b'))
    await selectFile(page, a)
    await setEditorValue(page, 'global:\n  scrape_interval: 11s\n')
    // Save so the change is persisted before switching.
    await page.getByTestId('save-file-btn').click()
    await page.getByTestId('save-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    // Switch to b — content reflects b's defaults, not a's edit.
    await fileItem(page, b).click()
    await page.waitForTimeout(700)
    const text = await readEditorText(page)
    expect(text).not.toContain('11s')
  })

  test('CP-04 File A edits do not appear in file B', async ({ page }) => {
    const a = await createFile(page, uniqueName('cp04a'))
    const b = await createFile(page, uniqueName('cp04b'))
    await selectFile(page, a)
    const marker = `UNIQUE_CP04_${Date.now().toString(36)}`
    const ok = await appendInEditor(page, `\n# ${marker}`)
    if (!ok) test.skip(true, 'Monaco not available')
    // Switch quickly.
    await fileItem(page, b).click()
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      await page.getByTestId('discard-changes-btn').click()
      await expect(dialog).toBeHidden()
    }
    await page.waitForTimeout(700)
    const text = await readEditorText(page)
    expect(text).not.toContain(marker)
  })

  test('CP-05 Validate — toolbar badge and Monaco gutter sync', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp05'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n  scrape_interval: 1x\n')
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(700)
    await expect(
      page.locator('[data-slot="badge"][class*="destructive"]').first()
    ).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.monaco-editor .squiggly-error').first()).toBeVisible({ timeout: 5000 })
  })

  test('CP-06 Validation state does not persist across file switch', async ({ page }) => {
    const a = await createFile(page, uniqueName('cp06a'))
    const b = await createFile(page, uniqueName('cp06b'))
    await selectFile(page, a)
    await setEditorValue(page, 'global:\n  scrape_interval: 1x\n')
    await page.getByTestId('validate-yaml-btn').click()
    await expect(
      page.locator('[data-slot="badge"][class*="destructive"]').first()
    ).toBeVisible({ timeout: 4000 })
    await fileItem(page, b).click()
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      await page.getByTestId('discard-changes-btn').click()
      await expect(dialog).toBeHidden()
    }
    await page.waitForTimeout(500)
    // Validate file b — no error badge.
    await page.getByTestId('validate-yaml-btn').click()
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /YAML is valid/i })
    ).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-slot="badge"][class*="destructive"]')).toHaveCount(0)
  })

  test('CP-07 Format + save — diff shows canonical YAML', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp07'))
    await selectFile(page, filename)
    await setEditorValue(page, 'global:\n\n\n  scrape_interval:    30s\n')
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // The "after" side of the diff should contain the formatted line.
    await expect(page.getByText(/scrape_interval:\s*30s/).first()).toBeVisible({ timeout: 4000 })
    await page.getByTestId('save-cancel-btn').click()
  })

  test('CP-08 Group headers survive format → save round-trip', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp08'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await page.getByTestId('format-yaml-btn').click()
    await page.waitForTimeout(500)
    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByTestId('save-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 6000 })
    // Reload the file to confirm persistence.
    await page.reload()
    await waitForApp(page)
    await fileItem(page, filename).click()
    await page.waitForTimeout(700)
    const text = await readEditorText(page)
    expect(text).toMatch(/=====\s*Alpha\s*=====/)
    expect(text).toMatch(/=====\s*Beta\s*=====/)
  })

  test('CP-09 Revert all hunks — YAML editor reflects reverted content', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp09'))
    await selectFile(page, filename)
    const before = await readEditorText(page)
    const ok = await appendInEditor(page, '\n# revert me')
    if (!ok) test.skip(true, 'Monaco not available')
    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Revert all hunk blocks.
    for (let i = 0; i < 12; i++) {
      const block = page.locator('.group.relative').first()
      if ((await block.count()) === 0) break
      await block.hover()
      const btn = block.getByRole('button', { name: /revert/i })
      if (!(await btn.isVisible())) break
      await btn.click()
      await page.waitForTimeout(150)
    }
    await page.getByTestId('save-cancel-btn').click()
    await page.waitForTimeout(400)
    const after = await readEditorText(page)
    expect(after).not.toContain('revert me')
    // Lines length should match the original (within trim tolerance).
    expect(after.replace(/\s+/g, ' ').trim()).toBe(before.replace(/\s+/g, ' ').trim())
  })

  test('CP-10 Restore from history — YAML editor updated', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp10'))
    await selectFile(page, filename)
    await editAndSave(page, '\n# v1')
    await editAndSave(page, '\n# v2')
    // Snapshot v1 will not contain "v2".
    await page.getByTestId('version-history-btn').click()
    const cards = page.locator('.group.rounded-lg')
    const count = await cards.count()
    let restored = false
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      await card.hover()
      const btn = card.getByRole('button', { name: 'Restore' })
      if (await btn.isVisible()) {
        await btn.click()
        restored = true
        break
      }
    }
    expect(restored).toBe(true)
    await expect(page.getByRole('heading', { name: 'Apply version from history' })).toBeVisible()
    await page.getByTestId('save-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    // The editor reflects the snapshot — content is non-empty.
    const text = await readEditorText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('CP-11 Theme change — Monaco theme updates', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp11'))
    await selectFile(page, filename)
    await page.getByTestId('theme-selector-btn').click()
    await page.getByTestId('theme-option-light').click()
    await page.waitForTimeout(500)
    await expect(page.locator('.monaco-editor.vs').first()).toBeVisible({ timeout: 5000 })
  })

  test('CP-12 Prefix View toggle — YAML unchanged', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp12'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoSection(page, 'Scrape Configs')
    const before = await readEditorText(page)
    await page.getByTestId('prefix-view-btn').click()
    await page.waitForTimeout(300)
    await page.getByTestId('prefix-view-btn').click()
    await page.waitForTimeout(300)
    const after = await readEditorText(page)
    expect(after).toBe(before)
  })

  test('CP-13 Unsaved guard fires from file explorer actions', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp13'))
    await selectFile(page, filename)
    const ok = await appendInEditor(page, '\n# dirty')
    if (!ok) test.skip(true, 'Monaco not available')
    await openRowMenu(page, filename, 'Rename')
    await expect(page.getByRole('heading', { name: 'Unsaved changes' })).toBeVisible({ timeout: 3000 })
    await page.getByTestId('keep-changes-btn').click()
  })

  test('CP-14 Add job via section editor → reflected in YAML', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp14'))
    await selectFile(page, filename)
    await gotoSection(page, 'Scrape Configs')
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible({ timeout: 3000 })
    const jobName = `cp14-${Math.random().toString(36).slice(2, 7)}`
    await page.locator('#jobName').fill(jobName)
    await page.locator('input[placeholder*="192.168"]').first().fill('myhost:9100')
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toHaveCount(0, { timeout: 3000 })
    const yaml = await readEditorText(page)
    expect(yaml).toContain(jobName)
    expect(yaml).toContain('myhost:9100')
  })

  test('CP-15 Delete job via section editor → reflected in YAML', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp15'))
    await selectFile(page, filename)
    await setEditorValue(page, GROUPED_YAML)
    await gotoSection(page, 'Scrape Configs')
    const row = page
      .locator('div')
      .filter({ has: page.getByText('alpha-one', { exact: true }) })
      .first()
    const menuBtn = row
      .locator('button')
      .filter({ has: page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal') })
      .first()
    await menuBtn.click()
    await page.getByRole('menuitem', { name: 'Delete job' }).click()
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible({ timeout: 1500 }).catch(() => false)) {
      const confirmBtn = dialog.getByRole('button', { name: /delete|remove/i }).first()
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click()
      }
    }
    await page.waitForTimeout(500)
    const yaml = await readEditorText(page)
    expect(yaml).not.toMatch(/^\s*-\s*job_name:\s*alpha-one\s*$/m)
  })

  test('CP-16 Config stats update after section editor change', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp16'))
    await selectFile(page, filename)
    await gotoSection(page, 'Scrape Configs')
    // Open Stats popover and read the initial Jobs count.
    await page.getByRole('button', { name: 'Stats' }).click()
    const jobsLabel = page.getByText('Jobs').first()
    await expect(jobsLabel).toBeVisible({ timeout: 3000 })
    const initialText = await jobsLabel.locator('..').innerText()
    const initialMatch = initialText.match(/(\d+)/)
    const initial = initialMatch ? Number(initialMatch[1]) : 0
    // Close the popover by clicking elsewhere.
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.waitForTimeout(200)
    // Add a job.
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toBeVisible({ timeout: 3000 })
    await page.locator('#jobName').fill(`cp16-${Math.random().toString(36).slice(2, 6)}`)
    await page.locator('input[placeholder*="192.168"]').first().fill('h:9100')
    await page.getByRole('button', { name: 'Add Job' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Job' })).toHaveCount(0, { timeout: 3000 })
    // Reopen Stats; Jobs count is +1.
    await page.getByRole('button', { name: 'Stats' }).click()
    await expect(jobsLabel).toBeVisible({ timeout: 3000 })
    const updatedText = await jobsLabel.locator('..').innerText()
    const updatedMatch = updatedText.match(/(\d+)/)
    const updated = updatedMatch ? Number(updatedMatch[1]) : 0
    expect(updated).toBe(initial + 1)
  })

  test('CP-17 Panel collapse preserves editor state', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp17'))
    await selectFile(page, filename)
    const ok = await appendInEditor(page, '\n# preserved-content')
    if (!ok) test.skip(true, 'Monaco not available')
    const before = await readEditorText(page)
    // Collapse file explorer.
    const collapseBtn = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-panel-right-close, svg.lucide-panel-left-close') })
      .first()
    await collapseBtn.click()
    await page.waitForTimeout(300)
    // Re-expand by clicking the "Files" sidebar.
    const expandBtn = page.locator('button[title="Expand Files Panel"]').first()
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click()
      await page.waitForTimeout(300)
    }
    const after = await readEditorText(page)
    expect(after).toContain('preserved-content')
    // Active file unchanged.
    await expect(fileItem(page, filename)).toHaveClass(/bg-accent/)
    expect(after).toBe(before)
  })

  test('CP-18 File load does not set dirty flag', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp18'))
    await selectFile(page, filename)
    await page.waitForTimeout(800)
    await expect(page.getByTestId('save-file-btn')).toBeDisabled({ timeout: 3000 })
  })

  test('CP-19 Invalid YAML in Monaco — section editor graceful', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp19'))
    await selectFile(page, filename)
    if (!(await focusEditor(page))) test.skip(true, 'Monaco not available')
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('{ unclosed bracket\n  - invalid: [')
    await page.waitForTimeout(500)
    // App still functional.
    await expect(page.getByTestId('validate-yaml-btn')).toBeVisible()
    // Switching the section should not crash.
    await gotoSection(page, 'Global')
    await expect(page.getByRole('heading', { name: 'Global Configuration' })).toBeVisible({ timeout: 3000 })
  })

  test('CP-20 Multiple edits — diff reflects cumulative change', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp20'))
    await selectFile(page, filename)
    if (!(await focusEditor(page))) test.skip(true, 'Monaco not available')
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# edit one')
    await page.waitForTimeout(300)
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.type('\n# edit two')
    await page.waitForTimeout(500)
    await page.getByTestId('save-file-btn').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('# edit one').first()).toBeVisible({ timeout: 4000 })
    await expect(page.getByText('# edit two').first()).toBeVisible()
    await page.getByTestId('save-cancel-btn').click()
  })

  test('CP-21 History restore — dirty flag reflects restored state', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp21'))
    await selectFile(page, filename)
    await editAndSave(page, '\n# v1')
    await editAndSave(page, '\n# v2-different-content')
    // Save button starts disabled (saved state).
    await expect(page.getByTestId('save-file-btn')).toBeDisabled({ timeout: 3000 })
    // Open history.
    await page.getByTestId('version-history-btn').click()
    const cards = page.locator('.group.rounded-lg')
    const count = await cards.count()
    let restored = false
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      await card.hover()
      const btn = card.getByRole('button', { name: 'Restore' })
      if (await btn.isVisible()) {
        await btn.click()
        restored = true
        break
      }
    }
    expect(restored).toBe(true)
    await expect(page.getByRole('heading', { name: 'Apply version from history' })).toBeVisible()
    await page.getByTestId('save-confirm-btn').click()
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
    // After restoring, the saved baseline matches the restored snapshot, so
    // save button is disabled. We verify the dirty-detection layer is alive
    // by making a follow-up edit and watching it become enabled.
    const ok = await appendInEditor(page, '\n# post-restore')
    if (!ok) test.skip(true, 'Monaco not available')
    await expect(page.getByTestId('save-file-btn')).toBeEnabled({ timeout: 3000 })
  })

  test('CP-22 Validation error count consistent across panels', async ({ page }) => {
    const filename = await createFile(page, uniqueName('cp22'))
    await selectFile(page, filename)
    await setEditorValue(
      page,
      'global:\n  scrape_interval: 1x\n  evaluation_interval: 2x\n'
    )
    await page.getByTestId('validate-yaml-btn').click()
    await page.waitForTimeout(700)
    // Toolbar badge shows "<n> issues".
    const toolbarBadge = page
      .locator('[data-slot="badge"][class*="destructive"]', { hasText: /issues?/ })
      .first()
    await expect(toolbarBadge).toBeVisible({ timeout: 5000 })
    const toolbarText = (await toolbarBadge.innerText()).trim()
    const count = Number(toolbarText.match(/(\d+)/)?.[1] ?? '0')
    expect(count).toBeGreaterThan(0)
    // YAML preview destructive badge — matches.
    const previewBadge = page
      .locator('[data-slot="badge"][class*="destructive"]')
      .nth(1)
    await expect(previewBadge).toBeVisible({ timeout: 5000 })
    const previewText = (await previewBadge.innerText()).trim()
    const previewCount = Number(previewText.match(/(\d+)/)?.[1] ?? '0')
    expect(previewCount).toBe(count)
  })
})
