# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> FM-23 Delete active file
- Location: tests\e2e\file-explorer.spec.ts:273:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.hover: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="file-item"][data-filename="fm23-moojbxsi-oqdcsy.yml"]')
    - locator resolved to <div data-testid="file-item" data-filename="fm23-moojbxsi-oqdcsy.yml" class="group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors bg-accent text-accent-foreground">…</div>
  - attempting hover action
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-state="open" aria-hidden="true" data-aria-hidden="true" data-slot="dialog-overlay" class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"></div> intercepts pointer events
    - retrying hover action
    - waiting 20ms
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div data-state="open" aria-hidden="true" data-aria-hidden="true" data-slot="dialog-overlay" class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"></div> intercepts pointer events
    - retrying hover action
      - waiting 100ms
    49 × waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div data-state="open" aria-hidden="true" data-aria-hidden="true" data-slot="dialog-overlay" class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"></div> intercepts pointer events
     - retrying hover action
       - waiting 500ms

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
                        - generic: fm09-mooja2oj-oqt500.yml
                        - generic:
                          - generic: May 2, 11:05 PM
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
                        - generic: fm11-mooja7es-z3zmni.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm12-renamed-moojaf3f-tuw5jp.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm13-moojai9s-s67zfc.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm14b-moojam60-2mg8x3.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm15-moojavsj-qk0759.yml
                        - generic:
                          - generic: May 2, 11:06 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm16-after-moojb289-9fbjml.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm17-moojb4h9-4s5tb4.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm18-dup-moojbbfl-niqi02.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm18-moojb8ms-0a08c6.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm19-moojbd8u-7jal2m.yml
                        - generic:
                          - generic: May 2, 11:06 PM
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
                        - generic: fm20-moojbgt4-t8or0k-copy.yaml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm20-moojbgt4-t8or0k.yml
                        - generic:
                          - generic: May 2, 11:07 PM
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
                        - generic: fm22-moojbtis-vjh35k.yml
                        - generic:
                          - generic: May 2, 11:07 PM
                          - generic: ·
                          - generic: 92 B
                      - button:
                        - img
                    - generic:
                      - img
                      - generic:
                        - generic: fm23-moojbxsi-oqdcsy.yml
                        - generic:
                          - generic: May 2, 11:07 PM
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
              - generic: fm23-moojbxsi-oqdcsy.yml
            - generic:
              - generic:
                - button:
                  - img
                  - text: Stats
            - generic:
              - button:
                - img
                - text: History
                - generic: "1"
            - generic:
              - button: Validate YAML
            - generic:
              - button:
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
                    - paragraph: 0 jobs · 0 targets
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
                      - img
                      - paragraph: No scrape configs defined
      - separator:
        - generic:
          - img
      - generic:
        - generic:
          - generic:
            - generic:
              - generic:
                - img
                - generic: fm23-moojbxsi-oqdcsy.yml
                - generic: 6 lines
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
                            - generic: "6"
                      - generic:
                        - generic:
                          - generic:
                            - generic: "global:"
                          - generic:
                            - generic: "scrape_interval: 15s"
                          - generic:
                            - generic: "evaluation_interval: 15s"
                          - generic:
                            - generic: "scrape_configs: []"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "Unsaved changes" [ref=e11]:
    - generic [ref=e12]:
      - heading "Unsaved changes" [level=2] [ref=e13]
      - paragraph [ref=e14]: You have unsaved changes. Discard and continue, or stay on this file.
    - generic [ref=e15]:
      - button "Keep" [active] [ref=e16]
      - button "Discard changes" [ref=e17]
    - button "Close" [ref=e18]:
      - img
      - generic [ref=e19]: Close
```

# Test source

```ts
  1   | import { expect, type Page, type Locator } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * Wait for the app shell to be ready: file explorer and toolbar mounted.
  5   |  */
  6   | export async function waitForApp(page: Page): Promise<void> {
  7   |   await page.waitForSelector('[data-testid="new-file-btn"]', { timeout: 20000 })
  8   |   await page.waitForSelector('[data-testid="format-yaml-btn"]', { timeout: 20000 })
  9   | }
  10  | 
  11  | /**
  12  |  * Generate a unique, filesystem-safe base filename for a test.
  13  |  */
  14  | export function uniqueName(prefix: string): string {
  15  |   const r = Math.random().toString(36).slice(2, 8)
  16  |   return `${prefix}-${Date.now().toString(36)}-${r}`
  17  | }
  18  | 
  19  | /**
  20  |  * Open the New File dialog, type a base name, click Create, and wait for the
  21  |  * dialog to close. Returns the resulting `<base>.yml` filename.
  22  |  */
  23  | export async function createFile(page: Page, baseName: string): Promise<string> {
  24  |   await page.getByTestId('new-file-btn').click()
  25  |   const dialog = page.getByRole('dialog')
  26  |   await expect(dialog).toBeVisible()
  27  |   await dialog.getByPlaceholder('prometheus').fill(baseName)
  28  |   await page.getByTestId('create-file-confirm-btn').click()
  29  |   await expect(dialog).toBeHidden()
  30  |   return `${baseName}.yml`
  31  | }
  32  | 
  33  | /**
  34  |  * Locate a file row by exact filename.
  35  |  */
  36  | export function fileItem(page: Page, filename: string): Locator {
  37  |   return page.locator(`[data-testid="file-item"][data-filename="${filename}"]`)
  38  | }
  39  | 
  40  | /**
  41  |  * Click a file in the explorer to activate it. Waits for the toolbar badge to
  42  |  * reflect the new active filename.
  43  |  */
  44  | export async function selectFile(page: Page, filename: string): Promise<void> {
  45  |   await fileItem(page, filename).click()
  46  |   // Allow the editor a moment to load the new file's YAML.
  47  |   await page.waitForTimeout(500)
  48  | }
  49  | 
  50  | /**
  51  |  * Open a file's row context menu and click the named menu item
  52  |  * ('Rename', 'Duplicate', 'Delete').
  53  |  */
  54  | export async function openRowMenu(
  55  |   page: Page,
  56  |   filename: string,
  57  |   item: 'Rename' | 'Duplicate' | 'Delete'
  58  | ): Promise<void> {
  59  |   const row = fileItem(page, filename)
> 60  |   await row.hover()
      |             ^ Error: locator.hover: Test timeout of 30000ms exceeded.
  61  |   await row.getByRole('button').first().click()
  62  |   await page.getByRole('menuitem', { name: item }).click()
  63  | }
  64  | 
  65  | /**
  66  |  * Click into the Monaco editor and type some text at the end. Returns true if
  67  |  * the editor was present, false otherwise (e.g. no file selected).
  68  |  */
  69  | export async function appendInEditor(page: Page, text: string): Promise<boolean> {
  70  |   const editor = page.locator('.monaco-editor').first()
  71  |   if ((await editor.count()) === 0) return false
  72  |   await editor.click()
  73  |   await page.keyboard.press('ControlOrMeta+End')
  74  |   await page.keyboard.type(text)
  75  |   await page.waitForTimeout(450)
  76  |   return true
  77  | }
  78  | 
  79  | /**
  80  |  * Replace the editor's content by select-all + type. Use sparingly: triggers
  81  |  * a debounced hydrate and may briefly produce parse errors mid-typing.
  82  |  */
  83  | export async function replaceEditorContent(page: Page, content: string): Promise<boolean> {
  84  |   const editor = page.locator('.monaco-editor').first()
  85  |   if ((await editor.count()) === 0) return false
  86  |   await editor.click()
  87  |   await page.keyboard.press('ControlOrMeta+A')
  88  |   await page.keyboard.type(content)
  89  |   await page.waitForTimeout(500)
  90  |   return true
  91  | }
  92  | 
  93  | /**
  94  |  * Read the Monaco editor's current value via DOM. The line widgets render the
  95  |  * text inside `.view-line` elements — joining them is good enough for tests
  96  |  * that need to assert the editor content.
  97  |  */
  98  | export async function readEditorText(page: Page): Promise<string> {
  99  |   return await page.evaluate(() => {
  100 |     const lines = Array.from(document.querySelectorAll('.monaco-editor .view-line'))
  101 |     return lines.map((l) => (l as HTMLElement).innerText).join('\n')
  102 |   })
  103 | }
  104 | 
  105 | /**
  106 |  * Open the save / diff dialog by clicking the Save button. Caller must have
  107 |  * an active file with pending edits and no validation errors.
  108 |  */
  109 | export async function openSaveDialog(page: Page): Promise<void> {
  110 |   await page.getByTestId('save-file-btn').click()
  111 |   await expect(page.getByRole('dialog')).toBeVisible()
  112 | }
  113 | 
  114 | /**
  115 |  * Confirm the open save dialog and wait for it to close.
  116 |  */
  117 | export async function confirmSave(page: Page): Promise<void> {
  118 |   await page.getByTestId('save-confirm-btn').click()
  119 |   await expect(page.getByRole('dialog')).toBeHidden({ timeout: 8000 })
  120 | }
  121 | 
  122 | /**
  123 |  * Make an edit, save it through the diff dialog, and wait for the toast.
  124 |  * Used to seed at least one history snapshot for VH tests.
  125 |  */
  126 | export async function editAndSave(page: Page, snippet = '\n# snapshot'): Promise<void> {
  127 |   await appendInEditor(page, snippet)
  128 |   const saveBtn = page.getByTestId('save-file-btn')
  129 |   await expect(saveBtn).toBeEnabled({ timeout: 5000 })
  130 |   await saveBtn.click()
  131 |   await expect(page.getByTestId('save-confirm-btn')).toBeVisible()
  132 |   await page.getByTestId('save-confirm-btn').click()
  133 |   await expect(
  134 |     page.locator('[data-sonner-toast]').filter({ hasText: /saved/i })
  135 |   ).toBeVisible({ timeout: 8000 })
  136 |   await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 })
  137 | }
  138 | 
  139 | /**
  140 |  * Set the Monaco editor's content directly via the underlying model. Used in
  141 |  * tests where typing characters one-by-one would be both slow and flaky
  142 |  * (e.g. injecting multi-line YAML for validation tests).
  143 |  *
  144 |  * Falls back to the typing path if the model can't be reached.
  145 |  */
  146 | export async function setEditorValue(page: Page, content: string): Promise<void> {
  147 |   const ok = await page.evaluate((value) => {
  148 |     interface MonacoModel {
  149 |       setValue: (text: string) => void
  150 |       pushEditOperations: (b: unknown[], e: unknown[], c: null) => void
  151 |     }
  152 |     interface MonacoEditor {
  153 |       getModel: () => MonacoModel | null
  154 |       focus: () => void
  155 |     }
  156 |     interface MonacoNs {
  157 |       editor: { getEditors: () => MonacoEditor[] }
  158 |     }
  159 |     const w = window as unknown as { monaco?: MonacoNs }
  160 |     const ed = w.monaco?.editor.getEditors()[0]
```