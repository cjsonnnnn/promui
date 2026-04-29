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

## Architecture

**promui** is a Next.js 16 (App Router) web UI for editing Prometheus YAML configuration files. It runs a local file server and reads/writes `.yml`/`.yaml` files from a `./configs/` directory (overridable via `CONFIG_DIR` env var). Version snapshots are stored in `./.config-history/` as JSON.

### State management

All application state lives in a single Zustand store at `lib/prometheus-store.ts` (~1500 lines). This is the central hub: it holds parsed config data, UI state (selections, collapse state, search), undo/redo stacks, and loading flags. Every editor component reads from and writes to this store via `usePrometheusStore()`.

Key store concepts:
- `scrapeConfigs` — the in-memory list of scrape jobs (separate from `config.scrape_configs` to enable grouping)
- `originalYaml` — baseline YAML string used for dirty detection
- `yamlTouchCounter` / `flushEditorYamlToStore` — mechanism to sync Monaco editor content back into the store before saves
- `peekUnsavedYaml()` — checks whether Monaco has edits not yet flushed to store
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
- Dark mode is forced at the root HTML element; all color values use OKLch CSS variables defined in `app/globals.css`
- Path alias `@/` maps to the repo root

### Validation

Validation runs on every store mutation via `validateConfig()`. It checks Prometheus-specific rules: duration format (`\d+(ms|s|m|h|d|w|y)`), `host:port` target format, duplicate job names, and required fields. Errors surface in `validationErrors` state and are displayed inline in the editors.

### Key UI behaviors

**Prefix View** (`components/prometheus/editors/scrape-configs-editor.tsx`): Toggles between group-based and job-name-prefix-based views of scrape jobs. The button uses `variant="default"` (filled) when active and `variant="outline"` when inactive, with `aria-pressed` reflecting the state.

**YAML formatting** (`components/prometheus/yaml-preview.tsx`): The YAML preview panel has a Format button (wand icon) and a Ctrl+S shortcut that only fires when the Monaco editor is focused. Formatting works by calling `hydrateFromYaml(currentValue)` then `exportYaml()` — this routes through the app's canonical serializer (`stringifyScrapeConfigsGrouped`) so group header comments are preserved. If the current YAML is syntactically invalid, a toast error is shown and the editor is unchanged. Ctrl+S outside the editor has no effect.

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
