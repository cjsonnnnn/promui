# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js, webpack)
npm run build     # Production build
npm run lint      # Run ESLint
```

The dev script uses `--webpack` explicitly. Turbopack (Next.js 16's default) panics on this CPU due to missing BMI2 instruction support, which causes React to never hydrate — the UI renders visually from SSR but all interactions are broken.

Playwright browser tests live in `tests/e2e/`. Run them with `npx playwright test` (requires the dev server running or Playwright's `webServer` config will start it). TypeScript strict mode is on, but `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build won't fail on type errors.

The Playwright config enforces `workers: 1` (serial execution) and registers `tests/global-setup.ts` which deletes all `.yml` files from `configs/` before each run. Both are load-bearing: parallel workers can kill a shared dev server mid-run, and accumulated config files from prior runs slow API calls past timeouts.

Test helpers live in `tests/e2e/utils/helpers.ts`. When writing tests that require a dirty editor (e.g., UC unsaved-changes scenarios), use `setEditorValue(page, yaml)` with a **semantically different** YAML value — not a comment-only change. `canonicalYamlFingerprint` in `lib/yaml-canonical.ts` calls `YAML.parse()` which strips comments, so comment-only edits are invisible to dirty detection.

**Test coverage specification**: `tests/e2e/README.md` is the authoritative source of truth for all E2E test scenarios. It defines 177 scenarios organized by UI panel:

- **File Explorer** — FM (file management), UC (unsaved-changes guard)
- **Toolbar** — VAL (validation), SD (save/diff flow), VH (version history), TH (theme selector)
- **YAML Editor** — ED (editor behaviors), YF (YAML formatting)
- **Config Tree** — CN (config tree navigation)
- **Section Editor** — ED-20+ (field editing), PV (prefix view), GR (group management)
- **Cross-Panel** — CP (multi-panel interactions)

Each scenario has a stable ID (e.g., `FM-01`, `VAL-02`) that maps to a `test()` call in the corresponding spec file. Before implementing a new test, verify whether a scenario ID already exists in the README.

## Architecture

**promui** is a Next.js 16 (App Router) web UI for editing Prometheus YAML configuration files. It runs a local file server and reads/writes `.yml`/`.yaml` files from a `./configs/` directory (overridable via `CONFIG_DIR` env var). Version snapshots are stored in `./.config-history/` as JSON.

### State management

All application state lives in a single Zustand store at `lib/prometheus-store.ts` (~1500 lines). This is the central hub: it holds parsed config data, UI state (selections, collapse state, search), undo/redo stacks, and loading flags. Every editor component reads from and writes to this store via `usePrometheusStore()`.

Key store concepts:
- `scrapeConfigs` — the in-memory list of scrape jobs (separate from `config.scrape_configs` to enable grouping)
- `originalYaml` — baseline YAML string used for dirty detection
- `yamlTouchCounter` / `flushEditorYamlToStore` — mechanism to sync Monaco editor content back into the store before saves
- `peekUnsavedYaml()` — checks whether Monaco has edits not yet flushed to store; compares `canonicalYamlFingerprint` values, so comment-only changes do **not** count as dirty
- `hydrateFromYaml()` / `exportYaml()` — the canonical parse/serialize path

### API routes (`app/api/`)

Nine RESTful routes handle all file I/O server-side. Helpers in `lib/api-route.ts` and `lib/parse-api-response.ts` standardize request/response handling. File system operations go through `lib/config-fs.ts` (safe path building, filename sanitization) and `lib/history-fs.ts` (version snapshots).

### Layout

`app/page.tsx` renders a four-panel resizable layout (`react-resizable-panels`): file explorer → config tree → section editor → YAML preview. Each panel can collapse. The section editor area is a tab switcher across eight `editors/` components.

### YAML grouping

Scrape jobs are organized into named groups using `# ===== GroupName =====` comment headers in the raw YAML. The parsing logic lives in `lib/scrape-yaml-groups.ts` (`extractJobGroupsFromRaw`) and serialization in `lib/scrape-group-utils.ts` (`stringifyScrapeConfigsGrouped`). The canonical group name normalization is in `canonicalScrapeGroup()`.

### Component conventions

- All Prometheus-domain components live under `components/prometheus/`
- UI primitives (shadcn/ui wrappers) live under `components/ui/` — avoid modifying these
- The `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) is used everywhere for classnames
- Theme is managed by `next-themes` (see Theme system below); OKLch CSS variables are defined in `app/globals.css`
- Path alias `@/` maps to the repo root

### Validation

Validation runs on every store mutation via `validateConfig()`. It checks Prometheus-specific rules: duration format (`\d+(ms|s|m|h|d|w|y)`), `host:port` target format, duplicate job names, and required fields. Errors surface in `validationErrors` state and are displayed inline in the editors.

### Key UI behaviors

**Prefix View** (`components/prometheus/editors/scrape-configs-editor.tsx`): Toggles between group-based and job-name-prefix-based views of scrape jobs. The button uses `variant="default"` (filled) when active and `variant="outline"` when inactive, with `aria-pressed` reflecting the state.

**YAML formatting** (`components/prometheus/yaml-preview.tsx`): The YAML preview panel has a Format button (wand icon) and a Ctrl+S shortcut that only fires when the Monaco editor is focused. Formatting works by calling `hydrateFromYaml(currentValue)` then `exportYaml()` — this routes through the app's canonical serializer (`stringifyScrapeConfigsGrouped`) so group header comments are preserved. If the current YAML is syntactically invalid, a toast error is shown and the editor is unchanged. Ctrl+S outside the editor has no effect.

**Diff revert** (`components/prometheus/save-changes-dialog.tsx`): The save dialog shows an inline diff view (custom renderer, no Monaco) where each changed block — context lines above/below, removed lines in red with `−`, added lines in green with `+` — has a small inline `↺ revert` button that appears on hover at the top-right of that block. Clicking it replaces that block in `afterYaml` with the original lines, recomputes the diff, and calls `onAfterYamlChange` so `EditorToolbar` can sync the reverted YAML to the store via `hydrateFromYaml`. Revert controls appear only when `onAfterYamlChange` is provided; the history-restore dialog omits it so that dialog is read-only. Hidden unchanged regions are collapsed with `··· N unchanged lines ···` separators.

**Theme system** (`components/prometheus/theme-selector.tsx`, `app/globals.css`, `lib/themes.ts`): Six themes are defined in `lib/themes.ts`: Dark, Light, Darker, Soft (warm gray), Ocean (blue-tinted), High Contrast. Each has CSS variable overrides in `globals.css` (classes `.dark`, `.darker`, `.soft`, `.ocean`, `.high-contrast`; `:root` is the light base) and a Monaco theme mapping. The `@custom-variant dark` covers all dark-family classes. `ThemeSelector` in the TopBar opens a Popover with color-swatch cards for each theme plus a System option. `lib/use-monaco-theme.ts` maps the resolved theme to `"vs"`, `"vs-dark"`, or `"hc-black"`. Default theme is dark; preference persists in localStorage via next-themes.

**App icon** (`public/icon.svg`): A Prometheus flame icon — orange rounded-square background with a white outer flame and orange inner flame. Used as the browser favicon and in the TopBar header.

## Deployment

Promui is designed to be deployed as a Docker container alongside Prometheus.

### Docker Build

The `Dockerfile` uses a multi-stage build and Next.js standalone output to create a minimal Alpine-based Node.js image.

1.  Set `output: 'standalone'` in `next.config.mjs` (already configured).
2.  The Docker container sets `CONFIG_DIR=/app/configs`.
3.  Volume mount `./configs` and `./.config-history` to the container to persist configurations.

A `docker-compose.yml` is provided for easy deployment:

```bash
docker-compose up -d
```
