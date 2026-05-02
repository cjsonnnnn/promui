# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> FM-08 Create file — cancel discards input
- Location: tests\e2e\file-explorer.spec.ts:89:7

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByRole('dialog').getByPlaceholder('prometheus')
Expected: ""
Received: "fm08-mooj9vm7-nt78il"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" with timeout 5000ms
  - waiting for getByRole('dialog').getByPlaceholder('prometheus')
    9 × locator resolved to <input data-slot="input" placeholder="prometheus" value="fm08-mooj9vm7-nt78il" class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disable…/>
      - unexpected value "fm08-mooj9vm7-nt78il"

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - img
          - generic:
            - heading [level=1]: Prometheus Config
            - paragraph: Configuration Manager
      - generic:
        - button:
          - img
          - generic: Select theme
        - generic:
          - button:
            - img
            - text: Reload Prometheus
    - generic:
      - generic:
        - generic:
          - generic:
            - generic:
              - img
              - generic: Config Files
            - generic:
              - button:
                - img
              - button:
                - img
              - button:
                - img
          - generic:
            - generic: Config Directory
            - generic: ./configs
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - img
                      - generic:
                        - generic: bug1.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 199 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: bug2-inactive.yml
                        - generic:
                          - generic: Apr 29, 04:15 AM
                          - generic: ·
                          - generic: 78 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: dsqsfsad.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 570 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-moohu89s-eb3pvu.yml
                        - generic:
                          - generic: May 2, 10:25 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-mooifyvz-qoacc9.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm01-mooj9bni-843vgt.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-moohuerp-3rvcs3.yml
                        - generic:
                          - generic: May 2, 10:25 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-mooig31b-h418o9.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm02-mooj9ifu-mquaza.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-moohuu0i-o96sht.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-mooigejg-bwyd98.yml
                        - generic:
                          - generic: May 2, 10:42 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm07-mooj9s5c-ksgu7i.yml
                        - generic:
                          - generic: May 2, 11:05 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm09-moohv3yl-bnbh58.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm09-mooih8so-gm2462.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm11-moohv9we-pih5tt.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm11-mooihel5-uwx094.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm12-moohvdo8-4p7vs0.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm12-renamed-mooihkd2-914sg1.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm13-moohvmv0-jrmtno.yml
                        - generic:
                          - generic: May 2, 10:26 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm13-mooihqpr-zw9s49.yml
                        - generic:
                          - generic: May 2, 10:43 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm14a-moohwakh-irb7x1.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm14b-mooihxbh-fxb7yc.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm15-moohwyn8-qp4me9.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm15-mooii8qk-lx16k5.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-moohx39t-wotcuk.yml
                        - generic:
                          - generic: May 2, 10:27 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-mooiifrs-yqf29c.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm17-moohxrak-uqqs1o.yml
                        - generic:
                          - generic: May 2, 10:28 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm17-mooij3sm-z07a78.yml
                        - generic:
                          - generic: May 2, 10:44 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-dup-mooijcgi-u8ctey.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-moohxxuu-tg44uu.yml
                        - generic:
                          - generic: May 2, 10:28 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm18-mooijair-iebs6m.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm19-mooijfq8-gro411.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-mooijmo8-ac3tar-copy.yaml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-mooijmo8-ac3tar.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm22-mooik2u6-3zoj8v.yml
                        - generic:
                          - generic: May 2, 10:45 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm25-mooikgel-14bmku.yml
                        - generic:
                          - generic: May 2, 10:46 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm27-mooikm60-htsi9i.yml
                        - generic:
                          - generic: May 2, 10:46 PM
                          - generic: ·
                          - generic: 31 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: lkfa.yml
                        - generic:
                          - generic: Apr 29, 03:01 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: prometheus-copy.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 20.3 KB
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: prometheus.yml
                        - generic:
                          - generic: Apr 29, 03:03 AM
                          - generic: ·
                          - generic: 19.6 KB
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: sfsd.yml
                        - generic:
                          - generic: Apr 29, 04:43 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: smkoq.yml
                        - generic:
                          - generic: Apr 29, 03:00 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: ssdasqdaasdasd.yml
                        - generic:
                          - generic: May 2, 09:53 PM
                          - generic: ·
                          - generic: 627 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test-markers.yml
                        - generic:
                          - generic: Apr 29, 05:21 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test-unsaved.yml
                        - generic:
                          - generic: Apr 29, 03:34 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: test1.yml
                        - generic:
                          - generic: Apr 29, 11:11 AM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
          - generic:
            - button:
              - img
              - text: New File
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic: Configuration
            - button:
              - img
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button:
                      - img
                      - generic: Global
                  - generic:
                    - button:
                      - img
                      - generic: Scrape Configs
                      - generic: "1"
                  - generic:
                    - button:
                      - img
                      - generic: Rule Files
                  - generic:
                    - button:
                      - img
                      - generic: Alerting / Alertmanagers
                  - generic:
                    - button:
                      - img
                      - generic: Remote Write
                  - generic:
                    - button:
                      - img
                      - generic: Remote Read
                  - generic:
                    - button:
                      - img
                      - generic: Storage
                  - generic:
                    - button:
                      - img
                      - generic: Tracing
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic:
              - generic: Active file
              - generic: bug1.yml
            - generic:
              - generic:
                - button:
                  - img
                  - text: Stats
            - generic:
              - button:
                - img
                - text: History
                - generic: "11"
            - generic:
              - button: Validate YAML
            - generic:
              - button [disabled]:
                - img
                - text: Save file
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - img
                  - generic:
                    - heading [level=2]: Scrape Configurations
                    - paragraph: 1 jobs · 1 targets
                - generic:
                  - generic:
                    - button:
                      - img
                      - text: Prefix View
                  - generic:
                    - button:
                      - img
                      - text: Add Job
              - generic:
                - generic:
                  - img
                  - textbox:
                    - /placeholder: Search jobs or targets...
                - button:
                  - img
                  - text: Actions
                - button:
                  - img
                  - text: Groups
                - combobox:
                  - generic: All jobs
                  - img
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - button:
                          - generic:
                            - checkbox
                            - img
                            - img
                            - generic: Ungrouped
                            - generic: 1 jobs
                        - generic:
                          - generic:
                            - generic:
                              - checkbox
                              - button:
                                - img
                              - generic:
                                - generic:
                                  - generic: h
                                  - generic: 1 targets
                              - button:
                                - img
                            - generic:
                              - generic: 32.23.1.5:512
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - img
                - generic: bug1.yml
                - generic: 12 lines
              - generic:
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
                - generic:
                  - button:
                    - img
            - generic:
              - generic:
                - generic:
                  - code:
                    - generic:
                      - textbox
                      - textbox
                      - generic:
                        - generic:
                          - generic:
                            - generic: 
                            - generic: "1"
                          - generic:
                            - generic: "2"
                          - generic:
                            - generic: "3"
                          - generic:
                            - generic: "4"
                          - generic:
                            - generic: "5"
                          - generic:
                            - generic: 
                            - generic: "6"
                          - generic:
                            - generic: 
                            - generic: "7"
                          - generic:
                            - generic: 
                            - generic: "8"
                          - generic:
                            - generic: 
                            - generic: "9"
                          - generic:
                            - generic: "10"
                          - generic:
                            - generic: "11"
                          - generic:
                            - generic: "12"
                      - generic:
                        - generic:
                          - generic:
                            - generic: "global:"
                          - generic:
                            - generic: "scrape_interval: 123s"
                          - generic:
                            - generic: "evaluation_interval: 15s"
                          - generic:
                            - generic: "scrape_configs:"
                          - generic:
                            - generic: "# ========= Ungrouped"
                          - generic:
                            - generic: =========
                          - generic:
                            - generic: "- job_name: h"
                          - generic:
                            - generic: "static_configs:"
                          - generic:
                            - generic: "- targets:"
                          - generic:
                            - generic: "- 32.23.1.5:512"
  - region "Notifications alt+T"
  - generic [ref=e5] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e6]:
      - img [ref=e7]
    - generic [ref=e10]:
      - button "Open issues overlay" [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: "1"
          - generic [ref=e14]: "2"
        - generic [ref=e15]:
          - text: Issue
          - generic [ref=e16]: s
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - alert
  - dialog "Create New YAML File" [ref=e21]:
    - generic [ref=e22]:
      - heading "Create New YAML File" [level=2] [ref=e23]
      - paragraph [ref=e24]: Enter a name. The .yml extension is added automatically if you omit it.
    - generic [ref=e25]:
      - textbox "prometheus" [active] [ref=e26]: fm08-mooj9vm7-nt78il
      - paragraph [ref=e27]: Will be saved as fm08-mooj9vm7-nt78il.yml
    - generic [ref=e28]:
      - button "Cancel" [ref=e29]
      - button "Create" [ref=e30]
    - button "Close" [ref=e31]:
      - img
      - generic [ref=e32]: Close
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
  14  |     await page.goto('/')
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
> 100 |     await expect(page.getByRole('dialog').getByPlaceholder('prometheus')).toHaveValue('')
      |                                                                           ^ Error: expect(locator).toHaveValue(expected) failed
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
  115 |     const base = uniqueName('fm10')
  116 |     await page.getByTestId('new-file-btn').click()
  117 |     const dialog = page.getByRole('dialog')
  118 |     await dialog.getByPlaceholder('prometheus').fill(base)
  119 |     await page.keyboard.press('Escape')
  120 |     await expect(dialog).toBeHidden()
  121 |     await expect(fileItem(page, `${base}.yml`)).toHaveCount(0)
  122 |   })
  123 | 
  124 |   // ─── Select / activate ────────────────────────────────────────────────────
  125 | 
  126 |   test('FM-11 Select file', async ({ page }) => {
  127 |     const base = uniqueName('fm11')
  128 |     const filename = await createFile(page, base)
  129 |     const row = fileItem(page, filename)
  130 |     await row.click()
  131 |     await page.waitForTimeout(400)
  132 |     // Active row receives the bg-accent class.
  133 |     await expect(row).toHaveClass(/bg-accent/)
  134 |   })
  135 | 
  136 |   // ─── Rename file ─────────────────────────────────────────────────────────
  137 | 
  138 |   test('FM-12 Rename file — happy path', async ({ page }) => {
  139 |     const base = uniqueName('fm12')
  140 |     const filename = await createFile(page, base)
  141 |     const newBase = uniqueName('fm12-renamed')
  142 |     await openRowMenu(page, filename, 'Rename')
  143 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
  144 |     const input = page.getByRole('dialog').getByRole('textbox')
  145 |     await input.fill(newBase)
  146 |     await page.getByTestId('rename-confirm-btn').click()
  147 |     await expect(page.getByRole('dialog')).toBeHidden()
  148 |     await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
  149 |     await expect(fileItem(page, filename)).toHaveCount(0)
  150 |   })
  151 | 
  152 |   test('FM-13 Rename file — slash rejected', async ({ page }) => {
  153 |     const base = uniqueName('fm13')
  154 |     const filename = await createFile(page, base)
  155 |     await openRowMenu(page, filename, 'Rename')
  156 |     const input = page.getByRole('dialog').getByRole('textbox')
  157 |     await input.fill('../bad')
  158 |     await page.getByTestId('rename-confirm-btn').click()
  159 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
  160 |     await expect(page.getByText(/slashes/i)).toBeVisible()
  161 |   })
  162 | 
  163 |   test('FM-14 Rename file — rename to existing name', async ({ page }) => {
  164 |     const a = uniqueName('fm14a')
  165 |     const b = uniqueName('fm14b')
  166 |     const fileA = await createFile(page, a)
  167 |     await createFile(page, b)
  168 |     await openRowMenu(page, fileA, 'Rename')
  169 |     const input = page.getByRole('dialog').getByRole('textbox')
  170 |     await input.fill(b)
  171 |     await page.getByTestId('rename-confirm-btn').click()
  172 |     // Dialog stays open with an error.
  173 |     await expect(page.getByRole('heading', { name: 'Rename File' })).toBeVisible()
  174 |     await expect(page.getByText(/already exists|exists/i).first()).toBeVisible()
  175 |   })
  176 | 
  177 |   test('FM-15 Rename file — same name is graceful', async ({ page }) => {
  178 |     const base = uniqueName('fm15')
  179 |     const filename = await createFile(page, base)
  180 |     await openRowMenu(page, filename, 'Rename')
  181 |     // Confirm without modifying.
  182 |     await page.getByTestId('rename-confirm-btn').click()
  183 |     await expect(page.getByRole('dialog')).toBeHidden()
  184 |     await expect(fileItem(page, filename)).toBeVisible()
  185 |   })
  186 | 
  187 |   test('FM-16 Rename file — Enter key submits', async ({ page }) => {
  188 |     const base = uniqueName('fm16')
  189 |     const filename = await createFile(page, base)
  190 |     const newBase = uniqueName('fm16-after')
  191 |     await openRowMenu(page, filename, 'Rename')
  192 |     const input = page.getByRole('dialog').getByRole('textbox')
  193 |     await input.fill(newBase)
  194 |     await input.press('Enter')
  195 |     await expect(page.getByRole('dialog')).toBeHidden()
  196 |     await expect(fileItem(page, `${newBase}.yml`)).toBeVisible()
  197 |   })
  198 | 
  199 |   test('FM-17 Rename file — cancel leaves file unchanged', async ({ page }) => {
  200 |     const base = uniqueName('fm17')
```