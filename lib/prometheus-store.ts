"use client"

import { create } from 'zustand'
import {
  ScrapeConfig,
  StaticConfig,
  ValidationError,
  PrometheusConfig,
  ConfigFile,
  ConfigHistoryEntry,
  ConfigSection,
  ConfigStats,
  GlobalConfig,
  AlertingConfig,
  RemoteWriteConfig,
  RemoteReadConfig,
  StorageConfig,
  TracingConfig,
} from './prometheus-types'
import YAML from 'yaml'
import { parseApiResponse } from '@/lib/parse-api-response'
import { canonicalYamlFingerprint } from '@/lib/yaml-canonical'
import {
  extractJobGroupsFromRaw,
  stringifyScrapeConfigsGrouped,
} from '@/lib/scrape-yaml-groups'
import {
  SCRAPE_GROUP_UNGROUPED,
  canonicalScrapeGroup,
} from '@/lib/scrape-group-utils'

export type ScrapeSortMode = 'name_asc' | 'name_desc' | null
export type TargetsSortMode = 'asc' | 'desc' | null

type HistorySnapshot = {
  config: PrometheusConfig
  scrapeConfigs: ScrapeConfig[]
}

interface PrometheusStore {
  files: ConfigFile[]
  activeFileId: string | null
  directoryPath: string
  config: PrometheusConfig
  scrapeConfigs: ScrapeConfig[]
  searchQuery: string
  sortBy: ScrapeSortMode
  targetsSort: TargetsSortMode
  groupKeyOrder: 'stable' | 'asc' | 'desc'
  collapsedJobs: Set<string>
  selectedJobs: Set<string>
  collapsedSections: Set<string>
  activeSection: ConfigSection | null
  activeScrapeConfigId: string | null
  validationErrors: ValidationError[]
  historyVersions: ConfigHistoryEntry[]
  originalYaml: string
  configDirectoryDisplay: string
  isLoadingFiles: boolean
  isLoadingFile: boolean
  isSaving: boolean
  isValidating: boolean
  /** Set by YamlPreview so Save can flush Monaco → store before diff */
  flushEditorYamlToStore: (() => void) | null
  setFlushEditorYamlToStore: (fn: (() => void) | null) => void
  /** Bumped when Monaco YAML edits (debounced) so Save/dirty UI updates. */
  yamlTouchCounter: number
  touchYamlFromEditor: () => void
  /** Canonical compare only; safe during React render (does not flush Monaco). */
  peekUnsavedYaml: () => boolean
  hasUnsavedYamlChanges: () => boolean
  discardUnsavedChanges: () => void
  /** After successful save from Save dialog, run once (e.g. switch file). */
  resumeAfterSave: (() => void) | null
  requestOpenSaveDialog: () => void
  clearResumeAfterSave: () => void
  saveDiffRequestNonce: number
  addScrapeGroup: (name: string) => void
  renameScrapeGroup: (from: string, to: string) => void
  deleteScrapeGroup: (name: string) => void
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  setDirectoryPath: (path: string) => void
  addFile: (file: Omit<ConfigFile, 'id'>) => void
  refreshFiles: () => Promise<void>
  createNewFile: (filename: string) => Promise<{ success: boolean; error?: string; conflict?: boolean }>
  uploadYamlFile: (
    filename: string,
    yaml: string
  ) => Promise<{ success: boolean; error?: string; conflict?: boolean }>
  /** Call after `setActiveFile` so the snapshot matches canonical `exportYaml()`. */
  ensureInitialHistorySnapshot: (filename: string) => Promise<void>
  saveYamlToDisk: (filename: string, yaml: string) => Promise<{ success: boolean; error?: string }>
  fileExists: (filename: string) => Promise<boolean>
  refreshConfigInfo: () => Promise<void>
  renameFile: (id: string, nextName: string) => Promise<{ success: boolean; error?: string }>
  duplicateFile: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  setActiveFile: (id: string) => Promise<void>
  deleteFile: (id: string) => Promise<{ success: boolean; error?: string }>
  saveActiveFile: () => Promise<{ success: boolean; error?: string }>
  updateFileContent: (id: string, content: PrometheusConfig) => void
  setConfig: (config: PrometheusConfig) => void
  updateGlobal: (global: GlobalConfig) => void
  updateAlerting: (alerting: AlertingConfig) => void
  addRemoteWrite: (config: RemoteWriteConfig) => void
  updateRemoteWrite: (index: number, config: RemoteWriteConfig) => void
  deleteRemoteWrite: (index: number) => void
  addRemoteRead: (config: RemoteReadConfig) => void
  updateRemoteRead: (index: number, config: RemoteReadConfig) => void
  deleteRemoteRead: (index: number) => void
  updateStorage: (storage: StorageConfig) => void
  updateTracing: (tracing: TracingConfig) => void
  setRuleFiles: (files: string[]) => void
  addRuleFile: (path: string) => void
  deleteRuleFile: (index: number) => void
  
  // Scrape config actions
  setScrapeConfigs: (jobs: ScrapeConfig[]) => void
  addScrapeConfig: (job: Omit<ScrapeConfig, 'id'>) => void
  updateScrapeConfig: (id: string, job: Partial<ScrapeConfig>) => void
  deleteScrapeConfig: (id: string) => void
  duplicateScrapeConfig: (id: string) => void
  setActiveScrapeConfig: (id: string | null) => void
  batchDeleteScrapeConfigs: (ids: string[]) => void
  batchMoveToGroup: (ids: string[], groupName: string) => void
  batchUngroup: (ids: string[]) => void
  
  // UI actions
  setSearchQuery: (query: string) => void
  setSortBy: (sort: ScrapeSortMode) => void
  toggleSortBy: () => void
  setTargetsSort: (sort: TargetsSortMode) => void
  toggleTargetsSort: () => void
  setGroupKeyOrder: (order: 'stable' | 'asc' | 'desc') => void
  toggleCollapse: (id: string) => void
  toggleSectionCollapse: (section: string) => void
  collapseAll: () => void
  expandAll: () => void
  setActiveSection: (section: ConfigSection | null) => void
  toggleJobSelection: (id: string) => void
  selectAllJobs: () => void
  deselectAllJobs: () => void
  selectJobsInGroup: (groupName: string) => void
  
  // Operations
  sortTargetsInJobs: (direction?: 'asc' | 'desc') => void
  normalizeFormatting: () => void
  importYaml: (yaml: string, filename?: string) => { success: boolean; errors: ValidationError[] }
  exportYaml: () => string
  validateConfig: () => ValidationError[]
  validateConfigAsync: () => Promise<ValidationError[]>
  groupJobsByPrefix: () => Map<string, ScrapeConfig[]>
  getStats: () => ConfigStats
  
  undo: () => void
  redo: () => void
  loadHistoryForFile: (filename: string) => Promise<void>
  restoreHistoryEntry: (versionId: string) => void
  isHistoryEntryActiveInEditor: (versionId: string) => boolean
  hydrateFromYaml: (yaml: string) => { success: boolean; error?: string }
}

const generateId = () => Math.random().toString(36).substring(2, 11)

const extractIp = (target: string): string => {
  const match = target.match(/^(\d+\.\d+\.\d+\.\d+)/)
  return match ? match[1] : target
}

const compareIps = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)
  for (let i = 0; i < 4; i++) {
    if ((aParts[i] || 0) !== (bParts[i] || 0)) {
      return (aParts[i] || 0) - (bParts[i] || 0)
    }
  }
  return 0
}

const defaultConfig: PrometheusConfig = {
  global: {
    scrape_interval: '15s',
    evaluation_interval: '15s',
  },
  scrape_configs: [],
  rule_files: [],
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const ensureValidConfigShape = (input: unknown): PrometheusConfig => {
  const base = (input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}) as Partial<PrometheusConfig>
  const merged = { ...defaultConfig, ...base }
  const rawGlobal = base.global
  const global: GlobalConfig =
    rawGlobal && typeof rawGlobal === 'object' && !Array.isArray(rawGlobal)
      ? (rawGlobal as GlobalConfig)
      : merged.global ?? defaultConfig.global!
  return {
    ...merged,
    global,
    scrape_configs: Array.isArray(base.scrape_configs) ? base.scrape_configs : [],
  }
}

function normalizeStaticConfig(raw: unknown): StaticConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { targets: [] }
  }
  const o = raw as Record<string, unknown>
  const targets = Array.isArray(o.targets) ? o.targets.map((t) => String(t)) : []
  let labels: Record<string, string> | undefined
  if (o.labels && typeof o.labels === 'object' && !Array.isArray(o.labels)) {
    labels = {}
    for (const [k, v] of Object.entries(o.labels as Record<string, unknown>)) {
      labels[k] = v == null ? '' : String(v)
    }
  }
  return { targets, labels }
}

/** Ensures scrape jobs never crash the UI (missing job_name / static_configs / targets). */
function normalizeScrapeJobFromYaml(raw: unknown, id: string): ScrapeConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      id,
      job_name: '',
      static_configs: [],
    }
  }
  const base = raw as Record<string, unknown>
  const job_name = typeof base.job_name === 'string' ? base.job_name : ''
  const static_configs = Array.isArray(base.static_configs)
    ? base.static_configs.map(normalizeStaticConfig)
    : []
  const { job_name: _j, static_configs: _s, ...rest } = base
  return {
    ...(rest as Omit<ScrapeConfig, 'id' | 'job_name' | 'static_configs'>),
    id,
    job_name,
    static_configs,
  }
}

function editorResetPatch() {
  return {
    activeFileId: null as string | null,
    config: clone(defaultConfig),
    scrapeConfigs: [] as ScrapeConfig[],
    validationErrors: [] as ValidationError[],
    originalYaml: '',
    historyVersions: [] as ConfigHistoryEntry[],
    undoStack: [] as HistorySnapshot[],
    redoStack: [] as HistorySnapshot[],
    yamlTouchCounter: 0,
    resumeAfterSave: null as (() => void) | null,
    selectedJobs: new Set<string>(),
  }
}

function mergeMetaGroups(config: PrometheusConfig, jobs: ScrapeConfig[]): PrometheusConfig {
  const prevDedup: string[] = []
  const seenPrev = new Set<string>()
  for (const g of config.meta?.groups || []) {
    const c = canonicalScrapeGroup(g)
    if (!seenPrev.has(c)) {
      prevDedup.push(c)
      seenPrev.add(c)
    }
  }

  const ordered: string[] = []
  const seen = new Set<string>()
  for (const g of prevDedup) {
    if (!seen.has(g)) {
      ordered.push(g)
      seen.add(g)
    }
  }
  for (const j of jobs) {
    const g = canonicalScrapeGroup(j.scrape_group)
    if (!seen.has(g)) {
      ordered.push(g)
      seen.add(g)
    }
  }

  return {
    ...config,
    meta: { groups: ordered },
  }
}

const fromConfig = (config: PrometheusConfig, rawYaml?: string): ScrapeConfig[] => {
  const arr = (config.scrape_configs || []).map((sc) =>
    normalizeScrapeJobFromYaml(sc, generateId())
  )
  if (rawYaml) {
    const groups = extractJobGroupsFromRaw(rawYaml)
    arr.forEach((j, i) => {
      const g = groups[i]
      if (g !== undefined && String(g).trim() !== '') {
        j.scrape_group = String(g).trim()
      }
    })
  }
  arr.forEach((j) => {
    j.scrape_group = canonicalScrapeGroup(j.scrape_group)
  })
  return arr
}

export const usePrometheusStore = create<PrometheusStore>()((set, get) => ({
      files: [],
      activeFileId: null,
      directoryPath: './configs',
      configDirectoryDisplay: './configs',
      config: defaultConfig,
      scrapeConfigs: [],
      searchQuery: '',
      sortBy: null,
      targetsSort: null,
      groupKeyOrder: 'stable' as 'stable' | 'asc' | 'desc',
      collapsedJobs: new Set<string>(),
      selectedJobs: new Set<string>(),
      collapsedSections: new Set<string>(),
      activeSection: 'scrape_configs',
      activeScrapeConfigId: null,
      validationErrors: [],
      historyVersions: [],
      originalYaml: '',
      isLoadingFiles: false,
      isLoadingFile: false,
      isSaving: false,
      isValidating: false,
      flushEditorYamlToStore: null,
      setFlushEditorYamlToStore: (fn) => set({ flushEditorYamlToStore: fn }),
      yamlTouchCounter: 0,
      touchYamlFromEditor: () => set((s) => ({ yamlTouchCounter: s.yamlTouchCounter + 1 })),
      peekUnsavedYaml: () => {
        const cur = canonicalYamlFingerprint(get().exportYaml())
        const sav = canonicalYamlFingerprint(get().originalYaml)
        return cur !== sav
      },
      hasUnsavedYamlChanges: () => {
        get().flushEditorYamlToStore?.()
        return get().peekUnsavedYaml()
      },
      discardUnsavedChanges: () => {
        const { originalYaml } = get()
        get().hydrateFromYaml(originalYaml)
        set((s) => ({ yamlTouchCounter: s.yamlTouchCounter + 1 }))
      },
      resumeAfterSave: null,
      saveDiffRequestNonce: 0,
      requestOpenSaveDialog: () =>
        set((s) => ({ saveDiffRequestNonce: s.saveDiffRequestNonce + 1 })),
      clearResumeAfterSave: () => set({ resumeAfterSave: null }),
      addScrapeGroup: (name) => {
        const t = canonicalScrapeGroup(name.trim())
        if (!t || t === SCRAPE_GROUP_UNGROUPED) return
        set((state) => {
          const cur = [...(state.config.meta?.groups || [])].map(canonicalScrapeGroup)
          if (cur.includes(t)) return state
          const nextMeta = [...cur, t]
          return {
            config: mergeMetaGroups(
              { ...state.config, meta: { groups: nextMeta } },
              state.scrapeConfigs
            ),
          }
        })
      },
      renameScrapeGroup: (from, to) => {
        const f = canonicalScrapeGroup(from)
        const t = canonicalScrapeGroup(to)
        if (!f || !t || f === t) return
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((j) =>
            canonicalScrapeGroup(j.scrape_group) === f ? { ...j, scrape_group: t } : j
          )
          const metaList = (state.config.meta?.groups || []).map((g) =>
            canonicalScrapeGroup(g) === f ? t : g
          )
          const dedup: string[] = []
          const seen = new Set<string>()
          for (const g of metaList) {
            const c = canonicalScrapeGroup(g)
            if (!seen.has(c)) {
              dedup.push(c)
              seen.add(c)
            }
          }
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(
              { ...state.config, meta: { groups: dedup } },
              nextScrape
            ),
          }
        })
      },
      deleteScrapeGroup: (name) => {
        const n = canonicalScrapeGroup(name)
        if (!n || n === SCRAPE_GROUP_UNGROUPED) return
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((j) =>
            canonicalScrapeGroup(j.scrape_group) === n
              ? { ...j, scrape_group: SCRAPE_GROUP_UNGROUPED }
              : j
          )
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(
              {
                ...state.config,
                meta: {
                  groups: (state.config.meta?.groups || []).filter(
                    (g) => canonicalScrapeGroup(g) !== n
                  ),
                },
              },
              nextScrape
            ),
          }
        })
      },
      undoStack: [],
      redoStack: [],
      setDirectoryPath: (path) => set({ directoryPath: path }),

      addFile: (file) => {
        const newFile: ConfigFile = { ...file, id: generateId() }
        set((state) => ({ files: [...state.files, newFile] }))
      },

      refreshConfigInfo: async () => {
        try {
          const response = await fetch('/api/config/info')
          const j = await parseApiResponse<{ displayPath?: string }>(response)
          const path = j.success && j.data?.displayPath ? String(j.data.displayPath) : null
          if (path) {
            set({
              configDirectoryDisplay: path,
              directoryPath: path,
            })
          }
        } catch {
          /* keep defaults */
        }
      },

      fileExists: async (filename) => {
        try {
          const response = await fetch(`/api/config/exists?file=${encodeURIComponent(filename)}`)
          const j = await parseApiResponse<{ exists: boolean }>(response)
          if (!j.success || j.data === undefined) return false
          return Boolean(j.data.exists)
        } catch {
          return false
        }
      },

      saveYamlToDisk: async (filename, yaml) => {
        const response = await fetch('/api/config/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: filename, content: yaml }),
        })
        const j = await parseApiResponse(response)
        if (!j.success) return { success: false, error: j.error || 'Failed to save file' }
        await get().refreshFiles()
        return { success: true }
      },

      ensureInitialHistorySnapshot: async (filename) => {
        try {
          if (get().activeFileId !== filename) return
          const existingRes = await fetch(`/api/config/history?file=${encodeURIComponent(filename)}`)
          const existing = await parseApiResponse<{ versions?: ConfigHistoryEntry[] }>(existingRes)
          if (existing.success && Array.isArray(existing.data?.versions) && existing.data.versions.length > 0) {
            // Still update store with existing versions so badge shows immediately
            set({ historyVersions: existing.data.versions })
            return
          }
          const yaml = get().exportYaml()
          await fetch('/api/config/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: filename, yaml }),
          })
          // Reload history so badge shows the new snapshot immediately
          await get().loadHistoryForFile(filename)
        } catch {
          /* best effort only; editor can still load */
        }
      },

      loadHistoryForFile: async (filename) => {
        try {
          const response = await fetch(`/api/config/history?file=${encodeURIComponent(filename)}`)
          const j = await parseApiResponse<{ versions?: ConfigHistoryEntry[] }>(response)
          if (!j.success || !j.data?.versions) {
            set({ historyVersions: [] })
            return
          }
          set({ historyVersions: j.data.versions })
        } catch {
          set({ historyVersions: [] })
        }
      },

      refreshFiles: async () => {
        set({ isLoadingFiles: true })
        try {
          const response = await fetch('/api/config/list')
          const j = await parseApiResponse<{
            files: Array<{ filename: string; path: string; size: number; lastModified: string }>
          }>(response)
          if (!j.success || !j.data?.files) {
            set({ files: [], ...editorResetPatch(), flushEditorYamlToStore: null })
            return
          }
          const files: ConfigFile[] = j.data.files.map((file) => ({
            id: file.filename,
            filename: file.filename,
            path: file.path,
            content: defaultConfig,
            lastModified: new Date(file.lastModified),
            size: file.size,
          }))
          const { activeFileId } = get()
          if (files.length === 0) {
            set({ files, ...editorResetPatch(), flushEditorYamlToStore: null })
            return
          }
          const stillThere = Boolean(activeFileId && files.some((f) => f.id === activeFileId))
          if (activeFileId && !stillThere) {
            set({ files, ...editorResetPatch(), flushEditorYamlToStore: null })
          } else {
            set({ files })
          }
        } catch {
          set({ files: [], ...editorResetPatch(), flushEditorYamlToStore: null })
        } finally {
          set({ isLoadingFiles: false })
        }
      },

      createNewFile: async (filename) => {
        const t = filename.trim()
        if (!t) return { success: false, error: 'Filename is required' }
        if (!/\.(yml|yaml)$/i.test(t)) {
          return { success: false, error: 'Filename must end with .yml or .yaml' }
        }
        if (await get().fileExists(t)) {
          return { success: false, conflict: true, error: 'File already exists' }
        }
        const yaml = YAML.stringify(defaultConfig, { indent: 2 })
        const saved = await get().saveYamlToDisk(t, yaml)
        if (!saved.success) return { success: false, error: saved.error }
        await get().refreshFiles()
        await get().setActiveFile(t)
        await get().ensureInitialHistorySnapshot(t)
        return { success: true }
      },

      uploadYamlFile: async (filename, yaml) => {
        const t = filename.trim()
        if (!t) return { success: false, error: 'Filename is required' }
        if (!/\.(yml|yaml)$/i.test(t)) {
          return { success: false, error: 'Filename must end with .yml or .yaml' }
        }
        try {
          YAML.parse(yaml)
        } catch (error) {
          return { success: false, error: `Invalid YAML: ${(error as Error).message}` }
        }
        if (await get().fileExists(t)) {
          return { success: false, conflict: true, error: 'File already exists' }
        }
        const saved = await get().saveYamlToDisk(t, yaml)
        if (!saved.success) return { success: false, error: saved.error }
        await get().refreshFiles()
        await get().setActiveFile(t)
        await get().ensureInitialHistorySnapshot(t)
        return { success: true }
      },

      renameFile: async (id, nextName) => {
        const file = get().files.find((f) => f.id === id)
        if (!file) return { success: false, error: 'File not found' }
        const response = await fetch('/api/config/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: file.filename, to: nextName }),
        })
        const j = await parseApiResponse(response)
        if (!j.success) return { success: false, error: j.error || 'Failed to rename file' }
        await get().refreshFiles()
        await get().setActiveFile(nextName.trim())
        return { success: true }
      },

      duplicateFile: async (id, newName) => {
        const file = get().files.find((f) => f.id === id)
        if (!file) return { success: false, error: 'File not found' }
        const t = newName.trim()
        if (!t) return { success: false, error: 'Filename is required' }
        if (!/\.(yml|yaml)$/i.test(t)) {
          return { success: false, error: 'Filename must end with .yml or .yaml' }
        }
        if (await get().fileExists(t)) {
          return { success: false, error: 'File already exists' }
        }
        // Load current file content
        const response = await fetch(`/api/config/load?file=${encodeURIComponent(file.filename)}`)
        const j = await parseApiResponse<{ content?: string }>(response)
        if (!j.success || typeof j.data?.content !== 'string') {
          return { success: false, error: j.error || 'Failed to load source file' }
        }
        // Save as new file (without history)
        const saved = await get().saveYamlToDisk(t, j.data.content)
        if (!saved.success) return { success: false, error: saved.error }
        await get().refreshFiles()
        await get().setActiveFile(t)
        // Initialize new history timeline (do not copy history)
        await get().ensureInitialHistorySnapshot(t)
        return { success: true }
      },

      setActiveFile: async (id) => {
        const list = get().files
        if (!id || !list.some((f) => f.id === id)) {
          set({ ...editorResetPatch(), flushEditorYamlToStore: null })
          return
        }
        set({ isLoadingFile: true })
        try {
          const response = await fetch(`/api/config/load?file=${encodeURIComponent(id)}`)
          const j = await parseApiResponse<{ content?: string }>(response)
          if (!j.success || typeof j.data?.content !== 'string') {
            set({
              activeFileId: id,
              config: clone(defaultConfig),
              scrapeConfigs: [],
              originalYaml: '',
              historyVersions: [],
              undoStack: [],
              redoStack: [],
              yamlTouchCounter: get().yamlTouchCounter + 1,
              selectedJobs: new Set<string>(),
              validationErrors: [
                {
                  type: 'invalid_yaml',
                  message: j.error || 'Failed to load file',
                },
              ],
            })
            await get().loadHistoryForFile(id)
            return
          }
          const content = j.data.content
          let parsed: PrometheusConfig
          try {
            parsed = ensureValidConfigShape(YAML.parse(content))
          } catch (error) {
            set({
              activeFileId: id,
              config: clone(defaultConfig),
              scrapeConfigs: [],
              originalYaml: content,
              historyVersions: [],
              undoStack: [],
              redoStack: [],
              yamlTouchCounter: get().yamlTouchCounter + 1,
              selectedJobs: new Set<string>(),
              validationErrors: [
                {
                  type: 'invalid_yaml',
                  message: `Invalid YAML: ${(error as Error).message}`,
                },
              ],
            })
            await get().loadHistoryForFile(id)
            return
          }
          delete (parsed as { meta?: unknown }).meta
          const configBase = ensureValidConfigShape(parsed)
          const scrapeConfigs = fromConfig(configBase, content)
          const config = mergeMetaGroups({ ...configBase, meta: undefined }, scrapeConfigs)
          set({
            activeFileId: id,
            config,
            scrapeConfigs,
            undoStack: [],
            redoStack: [],
            yamlTouchCounter: get().yamlTouchCounter + 1,
            selectedJobs: new Set<string>(),
          })
          // Baseline must match canonical `exportYaml()` or the editor/UI looks "dirty" with no edits.
          set({ originalYaml: get().exportYaml() })
          await get().loadHistoryForFile(id)
          get().validateConfig()
        } finally {
          set({ isLoadingFile: false })
        }
      },

      deleteFile: async (id) => {
        const file = get().files.find((f) => f.id === id)
        if (!file) return { success: false, error: 'File not found' }
        const response = await fetch('/api/config/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: file.filename }),
        })
        const j = await parseApiResponse(response)
        if (!j.success) return { success: false, error: j.error || 'Failed to delete file' }
        await get().refreshFiles()
        return { success: true }
      },

      saveActiveFile: async () => {
        const { activeFileId } = get()
        if (!activeFileId || !get().files.some((f) => f.id === activeFileId)) {
          return { success: false, error: 'No active file selected' }
        }
        set({ isSaving: true })
        try {
          const content = get().exportYaml()
          const response = await fetch('/api/config/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: activeFileId, content }),
          })
          const sj = await parseApiResponse(response)
          if (!sj.success) return { success: false, error: sj.error || 'Save failed' }
          set({ originalYaml: content })
          const histRes = await fetch('/api/config/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: activeFileId, yaml: content }),
          })
          const hj = await parseApiResponse(histRes)
          if (!hj.success) {
            return { success: false, error: hj.error || 'Saved file but failed to record history' }
          }
          await get().loadHistoryForFile(activeFileId)
          await get().refreshFiles()
          const resume = get().resumeAfterSave
          set({ resumeAfterSave: null })
          resume?.()
          set((s) => ({ yamlTouchCounter: s.yamlTouchCounter + 1 }))
          return { success: true }
        } finally {
          set({ isSaving: false })
        }
      },

      updateFileContent: (id, content) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, content, lastModified: new Date() } : f
          ),
        }))
      },

      // Config actions
      setConfig: (config) => {
        const scrapeConfigs = fromConfig(config)
        set({
          config: mergeMetaGroups({ ...config, meta: undefined }, scrapeConfigs),
          scrapeConfigs,
        })
      },

      updateGlobal: (global) => {
        set((state) => ({
          config: { ...state.config, global },
        }))
      },

      updateAlerting: (alerting) => {
        set((state) => ({
          config: { ...state.config, alerting },
        }))
      },

      addRemoteWrite: (remoteWrite) => {
        set((state) => ({
          config: {
            ...state.config,
            remote_write: [...(state.config.remote_write || []), remoteWrite],
          },
        }))
      },

      updateRemoteWrite: (index, remoteWrite) => {
        set((state) => {
          const newRemoteWrites = [...(state.config.remote_write || [])]
          newRemoteWrites[index] = remoteWrite
          return {
            config: { ...state.config, remote_write: newRemoteWrites },
          }
        })
      },

      deleteRemoteWrite: (index) => {
        set((state) => ({
          config: {
            ...state.config,
            remote_write: (state.config.remote_write || []).filter((_, i) => i !== index),
          },
        }))
      },

      addRemoteRead: (remoteRead) => {
        set((state) => ({
          config: {
            ...state.config,
            remote_read: [...(state.config.remote_read || []), remoteRead],
          },
        }))
      },

      updateRemoteRead: (index, remoteRead) => {
        set((state) => {
          const newRemoteReads = [...(state.config.remote_read || [])]
          newRemoteReads[index] = remoteRead
          return {
            config: { ...state.config, remote_read: newRemoteReads },
          }
        })
      },

      deleteRemoteRead: (index) => {
        set((state) => ({
          config: {
            ...state.config,
            remote_read: (state.config.remote_read || []).filter((_, i) => i !== index),
          },
        }))
      },

      updateStorage: (storage) => {
        set((state) => ({
          config: { ...state.config, storage },
        }))
      },

      updateTracing: (tracing) => {
        set((state) => ({
          config: { ...state.config, tracing },
        }))
      },

      setRuleFiles: (files) => {
        set((state) => ({
          config: { ...state.config, rule_files: files },
        }))
      },

      addRuleFile: (path) => {
        set((state) => ({
          config: {
            ...state.config,
            rule_files: [...(state.config.rule_files || []), path],
          },
        }))
      },

      deleteRuleFile: (index) => {
        set((state) => ({
          config: {
            ...state.config,
            rule_files: (state.config.rule_files || []).filter((_, i) => i !== index),
          },
        }))
      },

      // Scrape config actions
      setScrapeConfigs: (jobs) =>
        set((state) => {
          const next = jobs.map((j) => ({
            ...j,
            scrape_group: canonicalScrapeGroup(j.scrape_group),
          }))
          return {
            scrapeConfigs: next,
            config: mergeMetaGroups(state.config, next),
          }
        }),

      addScrapeConfig: (job) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        const base: Omit<ScrapeConfig, 'id'> = {
          ...job,
          scrape_group: canonicalScrapeGroup(job.scrape_group),
        }
        const newJob: ScrapeConfig = { ...base, id: generateId() }
        set((state) => {
          const nextScrape = [...state.scrapeConfigs, newJob]
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      updateScrapeConfig: (id, updates) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        const patch: Partial<ScrapeConfig> = { ...updates }
        if ('scrape_group' in patch) {
          patch.scrape_group = canonicalScrapeGroup(patch.scrape_group as string | undefined)
        }
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((job) =>
            job.id === id ? { ...job, ...patch } : job
          )
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      deleteScrapeConfig: (id) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.filter((job) => job.id !== id)
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            activeScrapeConfigId: state.activeScrapeConfigId === id ? null : state.activeScrapeConfigId,
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      duplicateScrapeConfig: (id) => {
        const { scrapeConfigs } = get()
        const job = scrapeConfigs.find((j) => j.id === id)
        if (job) {
          const newJob: ScrapeConfig = {
            ...job,
            id: generateId(),
            job_name: `${job.job_name || 'job'}-copy`,
            scrape_group: canonicalScrapeGroup(job.scrape_group),
          }
          const snapshot = { config: clone(get().config), scrapeConfigs: clone(scrapeConfigs) }
          set((state) => {
            const nextScrape = [...scrapeConfigs, newJob]
            return {
              scrapeConfigs: nextScrape,
              config: mergeMetaGroups(state.config, nextScrape),
              undoStack: [...state.undoStack, snapshot],
              redoStack: [],
            }
          })
        }
      },

      setActiveScrapeConfig: (id) => set({ activeScrapeConfigId: id }),

      batchDeleteScrapeConfigs: (ids) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.filter((job) => !ids.includes(job.id))
          const nextSelected = new Set(state.selectedJobs)
          ids.forEach((id) => nextSelected.delete(id))
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            selectedJobs: nextSelected,
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      batchMoveToGroup: (ids, groupName) => {
        const target = canonicalScrapeGroup(groupName)
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((job) =>
            ids.includes(job.id) ? { ...job, scrape_group: target } : job
          )
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
            selectedJobs: new Set<string>(),
          }
        })
      },

      batchUngroup: (ids) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((job) =>
            ids.includes(job.id) ? { ...job, scrape_group: SCRAPE_GROUP_UNGROUPED } : job
          )
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      // UI actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const sortedJobs = [...state.scrapeConfigs]
          switch (sort) {
            case 'name_asc':
              sortedJobs.sort((a, b) => (a.job_name || '').localeCompare(b.job_name || ''))
              break
            case 'name_desc':
              sortedJobs.sort((a, b) => (b.job_name || '').localeCompare(a.job_name || ''))
              break
            default:
              break
          }
          return {
            scrapeConfigs: sortedJobs,
            config: mergeMetaGroups(state.config, sortedJobs),
            sortBy: sort,
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      toggleSortBy: () => {
        const current = get().sortBy
        let next: ScrapeSortMode
        if (current === null || current === 'name_desc') {
          next = 'name_asc'
        } else {
          next = 'name_desc'
        }
        get().setSortBy(next)
      },

      setTargetsSort: (sort) => {
        set({ targetsSort: sort })
      },

      toggleTargetsSort: () => {
        const current = get().targetsSort
        let next: TargetsSortMode
        if (current === null || current === 'desc') {
          next = 'asc'
        } else {
          next = 'desc'
        }
        set({ targetsSort: next })
        get().sortTargetsInJobs(next)
      },

      setGroupKeyOrder: (order) => {
        set({ groupKeyOrder: order })
      },

      toggleCollapse: (id) => {
        set((state) => {
          const newCollapsed = new Set(state.collapsedJobs)
          if (newCollapsed.has(id)) {
            newCollapsed.delete(id)
          } else {
            newCollapsed.add(id)
          }
          return { collapsedJobs: newCollapsed }
        })
      },

      toggleSectionCollapse: (section) => {
        set((state) => {
          const newCollapsed = new Set(state.collapsedSections)
          if (newCollapsed.has(section)) {
            newCollapsed.delete(section)
          } else {
            newCollapsed.add(section)
          }
          return { collapsedSections: newCollapsed }
        })
      },

      collapseAll: () => {
        set((state) => ({
          collapsedJobs: new Set(state.scrapeConfigs.map((j) => j.id)),
        }))
      },

      expandAll: () => {
        set({ collapsedJobs: new Set() })
      },

      setActiveSection: (section) => set({ activeSection: section }),

      toggleJobSelection: (id) => {
        set((state) => {
          const next = new Set(state.selectedJobs)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return { selectedJobs: next }
        })
      },

      selectAllJobs: () => {
        set((state) => {
          const allIds = state.scrapeConfigs.map((j) => j.id)
          return { selectedJobs: new Set(allIds) }
        })
      },

      deselectAllJobs: () => {
        set({ selectedJobs: new Set<string>() })
      },

      selectJobsInGroup: (groupName) => {
        const target = canonicalScrapeGroup(groupName)
        set((state) => {
          const groupIds = state.scrapeConfigs
            .filter((j) => canonicalScrapeGroup(j.scrape_group) === target)
            .map((j) => j.id)
          const allSelected = groupIds.every((id) => state.selectedJobs.has(id))
          const next = new Set(state.selectedJobs)
          if (allSelected) {
            // Deselect all jobs in this group
            groupIds.forEach((id) => next.delete(id))
          } else {
            // Select all jobs in this group
            groupIds.forEach((id) => next.add(id))
          }
          return { selectedJobs: next }
        })
      },

      // Operations
      sortTargetsInJobs: (direction = 'asc') => {
        const dir = direction === 'desc' ? -1 : 1
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((job) => ({
            ...job,
            static_configs: (job.static_configs || []).map((config) => ({
              ...config,
              targets: [...(config.targets || [])].sort((a, b) => {
                const c = compareIps(extractIp(a), extractIp(b))
                return c * dir
              }),
            })),
          }))
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      normalizeFormatting: () => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const nextScrape = state.scrapeConfigs.map((job) => ({
            ...job,
            job_name: (job.job_name || '').trim().toLowerCase().replace(/\s+/g, '-'),
            scrape_interval: job.scrape_interval?.trim() || undefined,
            scrape_timeout: job.scrape_timeout?.trim() || undefined,
            metrics_path: job.metrics_path?.trim() || undefined,
            static_configs: (job.static_configs || []).map((config) => ({
              ...config,
              targets: (config.targets || []).map((t) => t.trim()),
            })),
          }))
          return {
            scrapeConfigs: nextScrape,
            config: mergeMetaGroups(state.config, nextScrape),
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
      },

      importYaml: (yamlString, filename = 'prometheus.yml') => {
        try {
          const parsed = ensureValidConfigShape(YAML.parse(yamlString))
          delete (parsed as { meta?: unknown }).meta
          const configBase = ensureValidConfigShape(parsed)
          const scrapeConfigs = fromConfig(configBase, yamlString)
          const config = mergeMetaGroups({ ...configBase, meta: undefined }, scrapeConfigs)

          const newFile: ConfigFile = {
            id: filename,
            filename,
            path: `${get().directoryPath}/${filename}`,
            content: config,
            lastModified: new Date(),
            size: yamlString.length,
          }

          set((state) => ({
            config,
            scrapeConfigs,
            files: [...state.files.filter((f) => f.filename !== filename), newFile],
            activeFileId: filename,
            yamlTouchCounter: state.yamlTouchCounter + 1,
          }))

          const errors = get().validateConfig()
          return { success: true, errors }
        } catch (e) {
          return {
            success: false,
            errors: [{ type: 'invalid_yaml', message: `YAML parse error: ${(e as Error).message}` }],
          }
        }
      },

      exportYaml: () => {
        const { config, scrapeConfigs } = get()
        const exportRest: PrometheusConfig = { ...config }
        delete exportRest.meta
        delete exportRest.scrape_configs
        const cleanRest = JSON.parse(
          JSON.stringify(exportRest, (_, v) =>
            v === undefined || (Array.isArray(v) && v.length === 0) ? undefined : v
          )
        ) as Record<string, unknown>
        const head =
          Object.keys(cleanRest).length > 0
            ? YAML.stringify(cleanRest, { indent: 2 }).trimEnd()
            : ''
        const scrapeInner = stringifyScrapeConfigsGrouped(
          scrapeConfigs,
          config.meta?.groups
        )
        const scrapeBlock =
          scrapeInner.length > 0 ? `scrape_configs:\n${scrapeInner}` : 'scrape_configs: []'
        if (!head) return `${scrapeBlock}\n`
        return `${head}\n\n${scrapeBlock}\n`
      },

      hydrateFromYaml: (yaml) => {
        try {
          const parsed = ensureValidConfigShape(YAML.parse(yaml))
          if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            set({
              validationErrors: [
                { type: 'invalid_yaml', message: 'YAML root must be a mapping (object)' },
              ],
            })
            return { success: false, error: 'Invalid root' }
          }
          delete (parsed as { meta?: unknown }).meta
          const configBase = ensureValidConfigShape(parsed)
          const scrapeConfigs = fromConfig(configBase, yaml)
          const config = mergeMetaGroups({ ...configBase, meta: undefined }, scrapeConfigs)
          set({ config, scrapeConfigs })
          set((s) => ({ yamlTouchCounter: s.yamlTouchCounter + 1 }))
          get().validateConfig()
          return { success: true }
        } catch (error) {
          set({
            validationErrors: [
              {
                type: 'invalid_yaml',
                message: `Invalid YAML: ${(error as Error).message}`,
              },
            ],
          })
          return { success: false, error: (error as Error).message }
        }
      },

      restoreHistoryEntry: (versionId) => {
        const { historyVersions } = get()
        const entry = historyVersions.find((v) => v.id === versionId)
        if (!entry) return
        const result = get().hydrateFromYaml(entry.yaml)
        if (result.success) {
          set({ undoStack: [], redoStack: [], selectedJobs: new Set<string>() })
          get().validateConfig()
          set({ originalYaml: get().exportYaml() })
          set((s) => ({ yamlTouchCounter: s.yamlTouchCounter + 1 }))
        }
      },

      isHistoryEntryActiveInEditor: (versionId) => {
        const entry = get().historyVersions.find((v) => v.id === versionId)
        if (!entry) return false
        get().flushEditorYamlToStore?.()
        return (
          canonicalYamlFingerprint(entry.yaml) ===
          canonicalYamlFingerprint(get().exportYaml())
        )
      },

      validateConfigAsync: async () => {
        set({ isValidating: true })
        try {
          await new Promise((r) => setTimeout(r, 150))
          return get().validateConfig()
        } finally {
          set({ isValidating: false })
        }
      },

      validateConfig: () => {
        const { scrapeConfigs, config } = get()
        const errors: ValidationError[] = []
        try {
          YAML.parse(get().exportYaml())
        } catch (error) {
          errors.push({
            type: 'invalid_yaml',
            message: `Invalid YAML structure: ${(error as Error).message}`,
          })
        }

        // Prometheus duration regex: number followed by time unit (ms, s, m, h, d, w, y)
        const durationRegex = /^\d+(ms|s|m|h|d|w|y)$/
        const validateDuration = (value: string | undefined, field: string, section: string, jobName?: string): void => {
          if (!value) return
          if (!durationRegex.test(value)) {
            errors.push({
              type: 'invalid_format',
              message: `Invalid duration format "${value}" for ${field}. Expected format: 15s, 1m, 1h, etc.`,
              field,
              jobName,
              section,
            })
          }
        }

        // Validate global durations
        if (config.global?.scrape_interval) {
          validateDuration(config.global.scrape_interval, 'scrape_interval', 'global')
        }
        if (config.global?.scrape_timeout) {
          validateDuration(config.global.scrape_timeout, 'scrape_timeout', 'global')
        }
        if (config.global?.evaluation_interval) {
          validateDuration(config.global.evaluation_interval, 'evaluation_interval', 'global')
        }

        // Check for duplicate job names
        const jobNames = new Map<string, number>()
        scrapeConfigs.forEach((job) => {
          const key = job.job_name || ''
          const count = jobNames.get(key) || 0
          jobNames.set(key, count + 1)
        })
        jobNames.forEach((count, name) => {
          if (!name || count <= 1) return
          errors.push({
            type: 'duplicate_job',
            message: `Duplicate job name: ${name}`,
            jobName: name,
            section: 'scrape_configs',
          })
        })

        scrapeConfigs.forEach((job) => {
          if (!job.job_name?.trim()) {
            errors.push({
              type: 'missing_job_name',
              message: 'A scrape job is missing job_name',
              section: 'scrape_configs',
            })
          }
          // Validate job-level durations
          validateDuration(job.scrape_interval, 'scrape_interval', 'scrape_configs', job.job_name)
          validateDuration(job.scrape_timeout, 'scrape_timeout', 'scrape_configs', job.job_name)
          const statics = job.static_configs || []
          const totalTargets = statics.reduce((n, sc) => n + (sc.targets?.length || 0), 0)
          if (totalTargets === 0) {
            errors.push({
              type: 'empty_targets',
              message: `Job "${job.job_name || '(unnamed)'}" has no targets`,
              jobName: job.job_name,
              section: 'scrape_configs',
            })
          }
        })

        // Check for duplicate targets across all jobs
        const allTargets = new Map<string, string[]>()
        scrapeConfigs.forEach((job) => {
          for (const staticConfig of job.static_configs || []) {
            for (const target of staticConfig.targets || []) {
              const existing = allTargets.get(target) || []
              existing.push(job.job_name || '')
              allTargets.set(target, existing)
            }
          }
        })
        allTargets.forEach((jobs, target) => {
          if (jobs.length > 1) {
            errors.push({
              type: 'duplicate_target',
              message: `Duplicate target ${target} in jobs: ${jobs.join(', ')}`,
              target,
              section: 'scrape_configs',
            })
          }
        })

        // Validate target format
        const targetRegex = /^[\w.-]+:\d+$/
        scrapeConfigs.forEach((job) => {
          for (const staticConfig of job.static_configs || []) {
            for (const target of staticConfig.targets || []) {
              const t = target?.trim() || ''
              if (!t) continue
              if (!targetRegex.test(t)) {
                errors.push({
                  type: 'invalid_target',
                  message: `Invalid target format: ${t} in job ${job.job_name}`,
                  target: t,
                  jobName: job.job_name,
                  section: 'scrape_configs',
                })
                continue
              }
              const port = Number(t.split(':').at(-1) || '')
              if (!Number.isInteger(port) || port < 1 || port > 65535) {
                errors.push({
                  type: 'invalid_format',
                  message: `Invalid port format: ${t} in job ${job.job_name}`,
                  target: t,
                  jobName: job.job_name,
                  section: 'scrape_configs',
                })
              }
            }
          }
        })

        // Validate remote_write URLs
        config.remote_write?.forEach((rw, i) => {
          if (!rw.url) {
            errors.push({
              type: 'missing_required',
              message: `Remote write #${i + 1} is missing required URL`,
              section: 'remote_write',
              field: 'url',
            })
          }
        })

        // Validate remote_read URLs
        config.remote_read?.forEach((rr, i) => {
          if (!rr.url) {
            errors.push({
              type: 'missing_required',
              message: `Remote read #${i + 1} is missing required URL`,
              section: 'remote_read',
              field: 'url',
            })
          }
        })

        set({ validationErrors: errors })
        return errors
      },

      groupJobsByPrefix: () => {
        const { scrapeConfigs } = get()
        const groups = new Map<string, ScrapeConfig[]>()

        scrapeConfigs.forEach((job) => {
          const match = (job.job_name || '').match(/^([a-zA-Z0-9]+)-/)
          const prefix = match ? match[1] : 'other'
          const existing = groups.get(prefix) || []
          existing.push(job)
          groups.set(prefix, existing)
        })

        return groups
      },

      getStats: (): ConfigStats => {
        const { scrapeConfigs, config } = get()
        
        let totalTargets = 0
        const largeJobs: string[] = []
        
        scrapeConfigs.forEach((job) => {
          let jobTargets = 0
          for (const sc of job.static_configs || []) {
            jobTargets += sc.targets?.length || 0
          }
          totalTargets += jobTargets
          if (jobTargets >= 50) {
            largeJobs.push(job.job_name || '')
          }
        })

        return {
          totalJobs: scrapeConfigs.length,
          totalTargets,
          totalRuleFiles: config.rule_files?.length || 0,
          totalRemoteWrites: config.remote_write?.length || 0,
          totalRemoteReads: config.remote_read?.length || 0,
          totalAlertmanagers: config.alerting?.alertmanagers?.length || 0,
          largeJobs,
        }
      },

      undo: () => {
        const { undoStack, redoStack, config, scrapeConfigs } = get()
        const previous = undoStack[undoStack.length - 1]
        if (!previous) return
        const present: HistorySnapshot = { config: clone(config), scrapeConfigs: clone(scrapeConfigs) }
        set({
          config: previous.config,
          scrapeConfigs: previous.scrapeConfigs,
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, present],
        })
      },

      redo: () => {
        const { undoStack, redoStack, config, scrapeConfigs } = get()
        const next = redoStack[redoStack.length - 1]
        if (!next) return
        const present: HistorySnapshot = { config: clone(config), scrapeConfigs: clone(scrapeConfigs) }
        set({
          config: next.config,
          scrapeConfigs: next.scrapeConfigs,
          redoStack: redoStack.slice(0, -1),
          undoStack: [...undoStack, present],
        })
      },
}))
