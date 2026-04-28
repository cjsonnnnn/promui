# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js, webpack)
npm run build     # Production build
npm run lint      # Run ESLint
```

The dev script uses `--webpack` explicitly. Turbopack (Next.js 16's default) panics on this CPU due to missing BMI2 instruction support, which causes React to never hydrate — the UI renders visually from SSR but all interactions are broken.

No test suite is configured. TypeScript strict mode is on, but `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build won't fail on type errors.

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

## Unsaved Changes Feature

### Status: Fixed (2026-04-29)

**How dirty detection works:**
1. `originalYaml` — the save baseline, set when a file is loaded from disk
2. `peekUnsavedYaml()` — compares `canonicalYamlFingerprint(exportYaml())` vs `canonicalYamlFingerprint(originalYaml)`
3. `canonicalYamlFingerprint()` — parses YAML, strips empty arrays/objects/nulls, sorts keys, JSON.stringify — so formatting differences never produce false positives
4. `yamlTouchCounter` — bumped by Monaco user edits (debounced) and on file load, triggers the `hasUnsaved` effect in the toolbar

**Root causes of the bug (both fixed):**

1. **`originalYaml` was set from `exportYamlFromState()`** (re-serialized) instead of the raw file content. When both sides go through the serializer, this was fine — but the serializer strips empty arrays (`rule_files: []`, `scrape_configs: []`), creating a structural mismatch with files that contain those keys explicitly. **Fix:** `setActiveFile()` now sets `originalYaml = content` (raw disk bytes). `lib/prometheus-store.ts` ~line 790.

2. **`canonicalYamlFingerprint()` didn't strip empty arrays** before fingerprinting. A raw file with `rule_files: []` produced a different fingerprint than the serializer output (which omits `rule_files`). **Fix:** Replaced `sortKeysDeep()` with `normaliseDeep()` in `lib/yaml-canonical.ts`, which strips `undefined`, `null`, empty arrays `[]`, and empty objects `{}` — mirroring the `exportYamlFromState` JSON.stringify replacer behavior.

3. **Monaco blur event race condition**. Switching files unmounts the old editor and mounts a new one. During unmount, the old editor fires `onDidBlurEditorWidget`, which calls `hydrateFromYaml()` to flush the editor's contents to the store. Because this happened *during the commit phase* (after the store was updated with the new file's content but before `useEffect`s could update tracking refs), it flushed the **stale old file's content** into the store, overwriting the new file's configuration. **Fix:** Added `mountedForFileRef` (frozen at editor mount time) to track which file an editor instance belongs to, and updated `activeFileIdRef` *synchronously during render* instead of in a `useEffect`. The blur handler now checks `if (mountedForFileRef.current !== activeFileIdRef.current) return`, safely dropping stale blur events.

**Key invariant:** Both sides of `peekUnsavedYaml()` must go through the same normalization pipeline. `normaliseDeep()` ensures this regardless of whether `originalYaml` is raw file content or re-serialized output.

**Files changed:**
- `lib/prometheus-store.ts` — `setActiveFile()`: `originalYaml = content` instead of `exportYamlFromState(config, scrapeConfigs)`
- `lib/yaml-canonical.ts` — `canonicalYamlFingerprint()`: uses `normaliseDeep()` instead of `sortKeysDeep()`
- `components/prometheus/yaml-preview.tsx` — Synchronous `activeFileIdRef` update and `mountedForFileRef` stale blur guard

**Verified behaviors:**
- Load file → Save button disabled (no false positive on initial load)
- Edit field → Save button enables
- Switch file with unsaved changes → dialog appears
- Keep → stays on file, dirty preserved
- Discard → file switches, dirty clears
- Edit → revert to original → Save button disables
- Rapid file switching → no false positives
- Monaco YAML direct edit → dirty shows after ~200ms debounce
- Save → dirty clears immediately

