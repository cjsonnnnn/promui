# Promui

A web UI for editing Prometheus YAML configuration files. Provides a visual editor for all Prometheus config sections with real-time validation, version history, and a live YAML preview.

## Features

- **Multi-file management** — load, save, rename, duplicate, and delete `.yml`/`.yaml` config files
- **Section editors** — dedicated UI for global settings, scrape configs, alerting, remote write/read, storage, and tracing
- **Job grouping** — organize scrape jobs into named groups with batch move, delete, and selection
- **Real-time validation** — Prometheus-aware validation (durations, targets, duplicate job names) with inline error reporting
- **YAML preview** — Monaco-based editor with live sync; edits flow both ways between the visual UI and raw YAML
- **Version history** — automatic snapshots on save with full rollback support
- **Undo/redo** — full undo stack across all config mutations

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

By default, config files are read from and written to the `./configs/` directory. Override this with the `CONFIG_DIR` environment variable:

```bash
CONFIG_DIR=/etc/prometheus npm run dev
```

Version history snapshots are stored in `./.config-history/`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router) + React 19 + TypeScript
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + Tailwind CSS v4
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for YAML editing
- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) for the split-panel layout
