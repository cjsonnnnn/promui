# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-explorer.spec.ts >> File Explorer Panel >> FM-01 Create file — happy path
- Location: tests\e2e\file-explorer.spec.ts:20:7

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByRole('dialog')
Expected: hidden
Received: visible
Timeout:  5000ms

Call log:
  - Expect "toBeHidden" with timeout 5000ms
  - waiting for getByRole('dialog')
    8 × locator resolved to <div role="dialog" tabindex="-1" data-state="open" id="radix-_R_1t79bmplb_" data-slot="dialog-content" aria-labelledby="radix-_R_1t79bmplbH1_" aria-describedby="radix-_R_1t79bmplbH2_" class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 round…>…</div>
      - unexpected value "visible"

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
              - generic: No file selected
            - generic:
              - generic:
                - button:
                  - img
                  - text: Stats
            - generic:
              - button [disabled]:
                - img
                - text: History
            - generic:
              - button [disabled]: Validate YAML
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
                    - paragraph: Select a file to view jobs
                - generic:
                  - generic:
                    - button [disabled]:
                      - img
                      - text: Prefix View
                  - generic:
                    - button [disabled]:
                      - img
                      - text: Add Job
              - generic:
                - generic:
                  - img
                  - textbox [disabled]:
                    - /placeholder: Select a file first...
                - button [disabled]:
                  - img
                  - text: Actions
                - button [disabled]:
                  - img
                  - text: Groups
                - combobox [disabled]:
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
                - generic: No file selected
                - img
              - generic:
                - generic:
                  - button [disabled]:
                    - img
                - generic:
                  - button [disabled]:
                    - img
                - generic:
                  - button [disabled]:
                    - img
                - generic:
                  - button:
                    - img
            - generic:
              - generic:
                - img
                - paragraph: Select or create YAML file
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e6] [cursor=pointer]:
    - img [ref=e7]
  - alert
  - dialog "Create New YAML File" [ref=e11]:
    - generic [ref=e12]:
      - heading "Create New YAML File" [level=2] [ref=e13]
      - paragraph [ref=e14]: Enter a name. The .yml extension is added automatically if you omit it.
    - generic [ref=e15]:
      - textbox "prometheus" [ref=e16]: fm01-mooj9bni-843vgt
      - paragraph [ref=e17]: Will be saved as fm01-mooj9bni-843vgt.yml
    - generic [ref=e18]:
      - button "Cancel" [ref=e19]
      - button "Create" [active] [ref=e20]
    - button "Close" [ref=e21]:
      - img
      - generic [ref=e22]: Close
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
> 29  |   await expect(dialog).toBeHidden()
      |                        ^ Error: expect(locator).toBeHidden() failed
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
  60  |   await row.hover()
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
```