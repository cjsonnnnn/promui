# E2E Test Specification — promui

---

## 1. How to Run

```bash
# Dev server must be running (or Playwright will start it via webServer config)
npm run dev

# Run all tests (headless)
npx playwright test

# Run in headed mode (watch the browser)
npx playwright test --headed

# Open the interactive UI mode
npx playwright test --ui

# Debug a specific file (headed + step-through)
npx playwright test --debug tests/e2e/file-management.spec.ts

# Run a single file
npx playwright test tests/e2e/save-diff.spec.ts

# Run tests matching a title pattern
npx playwright test -g "CP-04"
```

> **Note:** Turbopack panics on this CPU (missing BMI2). The dev server uses `--webpack` explicitly (`npm run dev`). Playwright's `webServer` config reuses an existing server on port 3000 — start the server before running tests to skip the cold-start wait.

---

## 2. Coverage Summary

| Panel | Scenarios | Description |
|-------|-----------|-------------|
| File Explorer | 41 (FM-01–FM-33, UC-01–UC-08) | File lifecycle, filename validation, upload, refresh, conflict resolution, unsaved changes guard |
| Toolbar | 59 (VAL-01–VAL-11, SD-01–SD-05, SD-10–SD-22, VH-01–VH-03, VH-10–VH-21, TH-01–TH-15) | Active file display, validate, save + diff dialog, version history + restore, theme selection |
| YAML Editor | 24 (ED-01–ED-16, YF-01–YF-08) | Raw editing, undo, format, copy/download, line count, validation markers |
| Config Tree | 8 (CN-01–CN-08) | Section navigation, active indicators, panel collapse and expand |
| Section Editor | 23 (ED-20–ED-30, PV-01–PV-06, GR-01–GR-06) | Form editing, job CRUD, job validation, prefix view, YAML group management |
| Cross-Panel | 22 (CP-01–CP-22) | State sync and content integrity across panel boundaries |
| **Total** | **177** | |

---

## 3. Panel Structure

The UI is divided into five interacting panels:

- **File Explorer** — left sidebar; manages config files on disk
- **Toolbar** — top bar; global actions (validate, save, history, theme)
- **YAML Editor** — right panel; raw Monaco editor for the active file
- **Config Tree** — second panel from the left; section navigation for the active config
- **Section Editor** — center panel; form-based editor for the selected config section

---

## 4. ID System

| Prefix | Domain | Primary panel |
|--------|--------|---------------|
| `FM` | File Management | File Explorer |
| `UC` | Unsaved Changes | File Explorer |
| `VAL` | Validation | Toolbar |
| `SD` | Save & Diff | Toolbar |
| `VH` | Version History | Toolbar |
| `TH` | Theme | Toolbar |
| `ED` | Editor Behavior | YAML Editor + Section Editor |
| `YF` | YAML Formatting | YAML Editor |
| `CN` | Config Navigation | Config Tree |
| `PV` | Prefix View | Section Editor |
| `GR` | Grouping | Section Editor |
| `CP` | Cross-Panel | Spans multiple panels |

IDs are sequential within each prefix (`FM-01`, `FM-02`, …). Gaps in numbering are intentional: IDs are never reused after deletion. Numbers above 10 within a prefix (e.g. `SD-10`) indicate scenarios that belong to a secondary context for that prefix (e.g. `SD-01–SD-05` = toolbar save button; `SD-10–SD-22` = the save/diff dialog).

---

## 5. Classification

Panels define **where** an interaction happens — the UI location a user is looking at and acting on. IDs define **what** feature or domain a scenario belongs to, regardless of layout.

A scenario is grouped under the panel that **triggers** it, not where the effect is observed. A save-dialog scenario belongs to Toolbar because the user initiates it by clicking Save, even though the dialog renders as an overlay. A duplicate-conflict scenario belongs to File Explorer because the user initiates it there.

---

## 6. Scenario Coverage Rules

Every panel's scenarios must collectively address all of the following dimensions:

| Dimension | Applies to |
|-----------|-----------|
| **Basic actions** — click, type, select, confirm | All panels |
| **Edge cases** — boundary inputs, empty states, no-file states | All panels |
| **Destructive actions** — delete, discard, overwrite | File Explorer, Toolbar |
| **Rapid interactions** — fast clicks, switching before debounce fires | File Explorer, YAML Editor, Cross-Panel |
| **Invalid inputs** — bad filenames, malformed YAML, wrong formats | File Explorer, YAML Editor, Section Editor |
| **Keyboard shortcuts** — Enter, Escape, Ctrl+S, Ctrl+Z | File Explorer, YAML Editor, Toolbar |
| **Panel synchronization** — changes in one panel visible in another | Cross-Panel; also inline within each panel's sync scenarios |

Scenarios that do not fit one panel cleanly belong in **Cross-Panel (CP)**.

---

## 7. Panel Scenarios

---

### File Explorer Panel

The left panel. Users manage config files here: create, select, rename, duplicate, delete, and upload. Filename validation and conflict resolution also happen here.

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| FM-01 | Create file — happy path | User opens dialog, enters valid name, confirms | File appears in list; becomes the active file |
| FM-02 | Create file — extension auto-appended | User enters name without `.yml` | Preview shows `name.yml`; created file uses that name |
| FM-03 | Create file — empty name rejected | User clicks Create with blank input | Error "Filename is required" shown; dialog stays open |
| FM-04 | Create file — whitespace-only name rejected | User enters only spaces | Error "Filename is required" shown; dialog stays open |
| FM-05 | Create file — slash in name rejected | User enters `../escape` or `a/b` | Error about slashes shown; dialog stays open |
| FM-06 | Create file — `.yml`-only name rejected | User enters just `.yml` | Error "Filename is required" shown; dialog stays open |
| FM-07 | Create file — duplicate name triggers conflict | User enters name of an existing file | Conflict resolution dialog opens with suggested alternative |
| FM-08 | Create file — cancel discards input | User opens dialog then clicks Cancel | Dialog closes; no file created; input cleared on next open |
| FM-09 | Create file — Enter key submits | User types name and presses Enter | Behaves identically to clicking Create |
| FM-10 | Create file — Escape closes dialog | User presses Escape | Dialog closes; no file created |
| FM-11 | Select file | User clicks a file in the list | File becomes active; row highlighted |
| FM-12 | Rename file — happy path | User opens rename, enters valid new name, confirms | List shows new name; old name gone |
| FM-13 | Rename file — slash rejected | User enters `../bad` in rename dialog | Error about slashes; dialog stays open |
| FM-14 | Rename file — rename to existing name | User enters another file's name | Error shown; dialog stays open |
| FM-15 | Rename file — same name is graceful | User confirms without changing the name | Dialog closes; file unchanged; no error |
| FM-16 | Rename file — Enter key submits | User presses Enter after typing | Behaves identically to clicking Rename |
| FM-17 | Rename file — cancel leaves file unchanged | User opens rename and clicks Cancel | Dialog closes; filename unchanged |
| FM-18 | Duplicate file — happy path | User opens duplicate dialog, confirms | Copy appears in list; original unchanged |
| FM-19 | Duplicate file — name pre-filled | User opens duplicate dialog | Input pre-filled with `<original>-copy.yml` |
| FM-20 | Duplicate file — auto-increments if copy exists | Copy name already taken | Suggestion becomes `<original>-copy-2.yml`, then `-3`, etc. |
| FM-21 | Delete file — confirm | User opens delete dialog, confirms | File removed from list |
| FM-22 | Delete file — cancel | User opens delete dialog, cancels | File remains in list |
| FM-23 | Delete active file | User deletes the currently active file | File removed; toolbar shows "No file selected" |
| FM-24 | Delete last file | User deletes the only file | Explorer shows empty-state message |
| FM-25 | Upload valid YAML file | User selects a `.yml` file via upload | File appears in the list |
| FM-26 | Upload non-YAML file | User selects a `.txt` or `.json` file | Error shown; no file added |
| FM-27 | Upload duplicate YAML filename | Uploaded name matches an existing file | Conflict resolution dialog appears |
| FM-28 | Refresh file list | User clicks the refresh button | List re-syncs with filesystem; spinner shown briefly |
| FM-29 | Config directory path displayed | App loads | Config directory path shown in explorer header |
| FM-30 | Rapid file clicks | User clicks different files quickly | Last-clicked file becomes active; no state corruption |
| FM-31 | Conflict dialog — new valid name resolves conflict | User enters a unique name and confirms | File created with new name; conflict and create dialogs both close |
| FM-32 | Conflict dialog — entering another existing name | User types a name that also exists | Error "That filename also exists" shown in conflict dialog |
| FM-33 | Duplicate file — cancel | User opens duplicate dialog then clicks Cancel | Dialog closes; no copy created; original file unchanged |

#### Unsaved Changes Guard

Triggered from File Explorer when the user attempts to navigate away from a file with unsaved edits.

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| UC-01 | Guard fires on file switch | User has edits and clicks another file | "Unsaved changes" dialog appears |
| UC-02 | Guard fires on new file action | User has edits and clicks New File | Guard fires before the create dialog opens |
| UC-03 | Guard fires on rename action | User has edits and clicks Rename | Guard fires before the rename dialog opens |
| UC-04 | Guard fires on duplicate action | User has edits and clicks Duplicate | Guard fires before the duplicate dialog opens |
| UC-05 | "Keep" — stays on current file | User clicks Keep in guard dialog | Dialog closes; original file stays active; edits intact |
| UC-06 | "Discard" — proceeds with action | User clicks Discard | Dialog closes; action proceeds; unsaved edits lost |
| UC-07 | No guard with no edits | No changes made, user switches files | File switches immediately with no dialog |
| UC-08 | Guard fires on delete action | User has edits and clicks Delete | Guard fires before the delete confirmation dialog opens |

---

### Toolbar Panel

The top bar. Shows the active file, validation state, and config stats. Houses the Validate, Save, Version History, and Theme buttons.

#### Validation

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| VAL-01 | Active file badge — shows filename | User selects a file | Toolbar badge updates to the selected filename |
| VAL-02 | Active file badge — no file selected | No file is active | Badge reads "No file selected" |
| VAL-03 | Validate button — disabled with no file | No file active | Validate button is disabled |
| VAL-04 | Validate button — spinner while running | User clicks Validate | Loading spinner shown on button during async check |
| VAL-05 | Validate — valid config | File has valid Prometheus YAML | Toast "YAML is valid" appears; no error badge |
| VAL-06 | Validate — invalid duration | `scrape_interval: 1x` present | Error toast with issue count appears |
| VAL-07 | Validate — error badge appears | Config has validation errors | Destructive badge visible in toolbar |
| VAL-08 | Validate — badge shows exact count | Two separate validation errors | Badge text reads "2 issues" |
| VAL-09 | Validate — no badge when valid | Valid config validated | No destructive badge shown |
| VAL-10 | Validate — errors cleared after fix | User fixes YAML and re-validates | Badge disappears; success toast shown |
| VAL-11 | Validate — duplicate job names | Two scrape jobs share the same `job_name` | Error toast appears; error badge shown in toolbar |

#### Save

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| SD-01 | Save button — disabled with no file | No file active | Save button is disabled |
| SD-02 | Save button — disabled with no changes | File loaded, no edits made | Save button is disabled |
| SD-03 | Save button — enabled after edit | User modifies the YAML | Save button becomes enabled |
| SD-04 | Save button — disabled with validation errors | Errors present in config | Save button disabled regardless of pending edits |
| SD-05 | Save button — opens diff dialog | User clicks Save with pending changes | Save / diff dialog opens |
| SD-10 | Diff shows before and after | Dialog opened after an edit | Before (red/−) and after (green/+) lines both rendered |
| SD-11 | Added lines — green background | A new line was added | Added line has green background and `+` marker |
| SD-12 | Removed lines — red background | A line was removed | Removed line has red background and `−` marker |
| SD-13 | Context lines shown | Lines adjacent to changed lines visible | Unchanged context lines rendered as plain text |
| SD-14 | Large unchanged regions collapsed | Many unchanged lines between two hunks | `··· N unchanged lines ···` separator shown |
| SD-15 | Revert button on hover | User hovers a changed hunk block | Revert (`↺ revert`) button appears at top-right of block |
| SD-16 | Revert single hunk | User clicks revert on one block | That block reverted; other changed blocks unchanged |
| SD-17 | Revert all hunks — no-changes state | User reverts every hunk block | "No changes" / "All changes reverted" message shown |
| SD-18 | Confirm disabled when no diff remains | All hunks reverted | Confirm save button disabled |
| SD-19 | Confirm save | User clicks Confirm with changes remaining | Dialog closes; toast "File saved"; save button disabled |
| SD-20 | Cancel save | User clicks Cancel | Dialog closes; edits retained; save button still enabled |
| SD-21 | Line numbers in diff | Diff rendered | Line numbers visible in left margin; first visible number ≥ 1 |
| SD-22 | Save failure surfaced | Server returns an error during save | Error message shown in dialog; dialog remains open |

#### Version History

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| VH-01 | History button — disabled with no file | No file active | Version History button is disabled |
| VH-02 | History button — opens dialog | User clicks with a file active | Version history dialog opens |
| VH-03 | History button — badge shows snapshot count | File has saved history | Badge on button reflects number of snapshots |
| VH-10 | Empty state for unsaved file | File created but never saved | "No snapshots yet" message shown |
| VH-11 | Snapshots listed after save | File saved at least once | At least one version card visible |
| VH-12 | Cards show timestamp | Version cards rendered | Formatted date/time shown on each card |
| VH-13 | Multiple saves produce multiple cards | File saved several times | All snapshots listed; newest first |
| VH-14 | Active snapshot marked | A snapshot matches current content | "Currently active" badge on matching version |
| VH-15 | Restore button on hover | User hovers a non-active version card | "Restore" button appears on the card |
| VH-16 | Restore opens diff dialog | User clicks Restore | Diff dialog opens showing snapshot vs current content |
| VH-17 | Restore diff is read-only | Restore diff dialog open | No inline revert buttons; diff is for review only |
| VH-18 | Confirm restore | User clicks Confirm in restore dialog | Editor content replaced with snapshot; dialog closes |
| VH-19 | Cancel restore | User clicks Cancel in restore dialog | File unchanged; restore dialog closes |
| VH-20 | Escape closes history dialog | User presses Escape | History dialog closes |
| VH-21 | Restore creates a new history snapshot | User confirms a restore | A new snapshot entry appears at the top of the history list |

#### Theme

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| TH-01 | Open popover | User clicks the palette button | Popover opens |
| TH-02 | All options present | Popover is open | System, Dark, Light, Darker, Soft, Ocean, High Contrast all visible |
| TH-03 | Select Dark | User clicks Dark | `<html>` class includes `dark` |
| TH-04 | Select Light | User clicks Light | `<html>` class includes `light` |
| TH-05 | Select Darker | User clicks Darker | `<html>` class includes `darker` |
| TH-06 | Select Soft | User clicks Soft | `<html>` class includes `soft` |
| TH-07 | Select Ocean | User clicks Ocean | `<html>` class includes `ocean` |
| TH-08 | Select High Contrast | User clicks High Contrast | `<html>` class includes `high-contrast` |
| TH-09 | Select System | User clicks System | Theme follows OS color preference |
| TH-10 | Theme persists on reload | User selects Soft, then reloads page | Same theme applied after reload |
| TH-11 | Active theme shows checkmark | Dark is active, popover opened | Checkmark shown inside Dark card; absent from others |
| TH-12 | Dismiss without changing | User opens popover and clicks outside | Popover closes; theme unchanged |
| TH-13 | Light maps to Monaco `vs` | Light theme selected | Monaco editor uses the `vs` (light) theme |
| TH-14 | High Contrast maps to Monaco `hc-black` | High Contrast selected | Monaco editor uses the `hc-black` theme |
| TH-15 | Dark-family themes apply dark-variant utilities | Dark, Darker, Soft, or Ocean selected | Dark-variant CSS utilities apply to UI elements |

---

### YAML Editor Panel

The right panel. A Monaco-based editor that shows the raw YAML of the active file. Users can type directly, use the Format button, copy, or download the content.

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| ED-01 | Editor loads file content | User selects a file | Monaco editor displays the file's YAML |
| ED-02 | Editor shows empty state | No file selected | Editor shows placeholder or disabled state |
| ED-03 | Typing triggers debounced store update | User types in editor | After ~400ms, the store reflects the change |
| ED-04 | Blur immediately applies content | User clicks outside the editor | Store updated immediately without waiting for debounce |
| ED-05 | Loading file does not trigger dirty flag | File is selected and loaded | Save button remains disabled; no unsaved-change state |
| ED-06 | Line count badge reflects line total | Editor has content | Badge in panel footer shows correct line count |
| ED-07 | Line count updates after edits | User adds or removes lines | Line count badge updates to reflect new total |
| ED-08 | Validation markers in gutter | Config validated with errors | Red markers appear in Monaco gutter at error lines |
| ED-09 | Gutter markers cleared after fix | User fixes errors and re-validates | Gutter markers disappear |
| ED-10 | Copy button copies YAML | User clicks Copy | Clipboard contains current YAML content |
| ED-11 | Copy button shows checkmark | User clicks Copy | Button icon briefly changes to a checkmark |
| ED-12 | Download button downloads file | User clicks Download | Browser initiates download of the YAML file |
| ED-13 | Panel collapse | User clicks the collapse button | YAML editor panel collapses; a reopen affordance is visible |
| ED-14 | Editor reflows on panel resize | User resizes adjacent panels | Editor fills available space without overflow |
| ED-15 | Syntax highlighting present | YAML loaded in editor | YAML keys, values, and comments have distinct colors |
| ED-16 | Undo last edit | User presses Ctrl+Z | Last typed change is undone; previous content restored in editor |
| YF-01 | Format button — disabled with no file | No file active | Format button is disabled |
| YF-02 | Format button — enabled with file | File is active | Format button is enabled |
| YF-03 | Format — valid YAML reformatted | User clicks Format on valid YAML | Content normalized to canonical form; no error toast |
| YF-04 | Format — group headers preserved | YAML has `# ===== Group =====` comments | After format, group headers still present in output |
| YF-05 | Format — invalid YAML shows error toast | Editor contains unparseable YAML | Toast "Cannot format: invalid YAML" appears; editor unchanged |
| YF-06 | Ctrl+S inside editor formats | User presses Ctrl+S while editor is focused | Same effect as clicking Format |
| YF-07 | Ctrl+S outside editor is no-op | User presses Ctrl+S while editor is not focused | No formatting triggered; no error; no toast |
| YF-08 | Format is idempotent | User formats already-canonical YAML | Content unchanged after second format |

---

### Config Tree Panel

The second panel from the left. A navigation tree listing all top-level Prometheus config sections. Clicking a section switches the Section Editor to that section's form.

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| CN-01 | All eight sections listed | File active | global, scrape_configs, alerting, rule_files, remote_write, remote_read, storage, tracing are all shown |
| CN-02 | Click section switches editor | User clicks "scrape_configs" | Section Editor switches to the scrape configs form |
| CN-03 | Active section visually indicated | User selects a section | Selected section has an active/highlight state |
| CN-04 | Empty state with no file | No file active | Config tree shows empty or disabled state |
| CN-05 | Panel collapse | User clicks the collapse button | Config tree panel collapses; reopen affordance visible |
| CN-06 | Sections with non-default content indicated | Section has user-configured values | Visual distinction from sections at default |
| CN-07 | Section switch preserves other section edits | User edits global, switches to scrape_configs, switches back | Global edits still present |
| CN-08 | Panel re-expands after collapse | User clicks the reopen affordance after collapsing | Config tree panel is visible again; section list restored |

---

### Section Editor Panel

The center panel. Displays a form-based editor for the currently selected config section. For scrape configs, includes job management, Prefix View toggle, and group-based organization.

#### Global Section

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| ED-20 | Global — scrape_interval accepts valid duration | User types "30s" | Value accepted; YAML reflects `scrape_interval: 30s` |
| ED-21 | Global — evaluation_interval accepts valid duration | User types "1m" | Value accepted; YAML reflects `evaluation_interval: 1m` |
| ED-22 | Global — invalid duration shows inline error | User types "1x" | Inline error visible in the field |
| ED-23 | Global — changes reflected in YAML editor | User updates interval | YAML editor shows updated value |

#### Scrape Configs

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| ED-24 | Scrape configs — all jobs listed | File has scrape jobs | Each job appears as a row in the list |
| ED-25 | Add scrape job — opens modal | User clicks add button | Job editor modal opens with empty fields |
| ED-26 | Add scrape job — saved | User fills form and confirms | New job appears in list; YAML editor updated |
| ED-27 | Edit scrape job — modal pre-filled | User opens an existing job | Modal fields populated with job's current values |
| ED-28 | Edit scrape job — cancel discards | User modifies fields then cancels | Original job values unchanged |
| ED-29 | Delete scrape job | User removes a job | Job removed from list; YAML editor updated |
| ED-30 | Add scrape job — empty job_name rejected | User submits modal with blank job_name | Inline error shown; job not added to list |

#### Prefix View

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| PV-01 | Prefix View — starts inactive | App loads with scrape_configs section open | Button has `aria-pressed="false"` |
| PV-02 | Prefix View — activate | User clicks button | `aria-pressed="true"`; view reorganized by name prefix |
| PV-03 | Prefix View — deactivate | User clicks button again | `aria-pressed="false"`; view returns to group organization |
| PV-04 | Prefix View active — button style | Toggle is on | Button renders with filled / default variant |
| PV-05 | Prefix View inactive — button style | Toggle is off | Button renders with outline variant |
| PV-06 | Prefix View — does not modify YAML | User toggles Prefix View | YAML editor content unchanged |

#### Grouping

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| GR-01 | Groups shown as separators | YAML has `# ===== GroupName =====` comments | Group name rendered as a section header in the job list |
| GR-02 | Jobs appear under their group | Grouped YAML loaded | Each job listed under its correct group |
| GR-03 | Ungrouped jobs in default section | Jobs with no group comment | Jobs appear in a default / ungrouped section |
| GR-04 | Group name extracted from comment | Comment is `# ===== My Group =====` | "My Group" appears as the group label |
| GR-05 | Group structure preserved on edit | User edits a job within a group | Group assignment unchanged; group header still present in YAML |
| GR-06 | Multiple groups all rendered | YAML has several `# ===== ... =====` headers | Each group header renders as a separate separator in the job list |

---

### Cross-Panel Scenarios

Scenarios that require two or more panels to interact correctly. These are the highest-value tests for catching regressions in the store-sync layer.

| ID | Scenario | Description | Expected Behavior |
|----|----------|-------------|-------------------|
| CP-01 | YAML edit → section editor updates | User types in YAML editor | After debounce, section editor form reflects parsed values |
| CP-02 | Section editor edit → YAML editor updates | User changes a form field | YAML editor shows the updated serialized content |
| CP-03 | File switch → YAML editor loads new content | User clicks a different file | YAML editor immediately shows new file's content |
| CP-04 | File A edits do not appear in file B | User edits A, fast-switches to B | File B shows only its own content; no bleed from A |
| CP-05 | Validate — toolbar badge and Monaco gutter sync | Invalid config validated | Destructive badge shown in toolbar AND gutter markers shown in Monaco |
| CP-06 | Validation state does not persist across file switch | File A has errors; user switches to valid file B | No error badge shown for file B |
| CP-07 | Format + save — diff shows canonical YAML | User formats then saves | Diff dialog shows the canonical (formatted) YAML as the "after" side |
| CP-08 | Group headers survive format → save round-trip | YAML has groups; user formats then saves | Group comment headers present in saved file |
| CP-09 | Revert all hunks — YAML editor reflects reverted content | User reverts all changes and closes dialog | YAML editor shows original (pre-edit) content |
| CP-10 | Restore from history — YAML editor updated | User confirms a restore | Monaco editor content replaced with the snapshot's YAML |
| CP-11 | Theme change — Monaco theme updates | User switches to Light | Monaco editor switches to `vs` theme; syntax colors change |
| CP-12 | Prefix View toggle — YAML unchanged | User toggles Prefix View on/off | YAML editor content is identical before and after toggle |
| CP-13 | Unsaved guard fires from file explorer actions | User edits YAML then triggers rename | Guard dialog appears before the rename dialog |
| CP-14 | Add job via section editor → reflected in YAML | User adds a scrape job through the form | YAML editor shows the new job's serialized content |
| CP-15 | Delete job via section editor → reflected in YAML | User removes a scrape job | YAML editor no longer shows the deleted job |
| CP-16 | Config stats update after section editor change | User adds a job through the form | Toolbar stats widget reflects the new job count |
| CP-17 | Panel collapse preserves editor state | User collapses file explorer and expands it | Active file, YAML content, and editor state unchanged |
| CP-18 | File load does not set dirty flag | User selects a file | Save button remains disabled immediately after load |
| CP-19 | Invalid YAML in Monaco — section editor graceful | User types syntactically broken YAML | Section editor shows a graceful fallback; no JS crash |
| CP-20 | Multiple edits — diff reflects cumulative change | User makes several edits and opens save dialog | Diff shows all changes from the last saved state, not just the last edit |
| CP-21 | History restore — dirty flag reflects restored state | User confirms a restore; restored content differs from disk | Save button becomes enabled; dirty detection works correctly after restore |
| CP-22 | Validation error count consistent across panels | Config has N validation errors and is validated | Toolbar badge count matches the number of inline errors shown in the section editor |

---

## 8. Testing Philosophy

Tests are **end-user driven**: every scenario describes a user action in the browser and the observable result. There are no unit or integration tests — the browser UI is the source of truth.

Tests are implemented with [Playwright](https://playwright.dev/) and run against the full stack: browser → Next.js → local API routes → filesystem. State consistency across panels is a first-class concern; many bugs in this app manifest as content leaking between files or UI state falling out of sync with the store.
