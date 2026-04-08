"use client"

import { create } from 'zustand'
import {
  ScrapeConfig,
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

export type ScrapeSortMode = 'name_asc' | 'name_desc' | 'ip_asc' | 'ip_desc' | null

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
  collapsedJobs: Set<string>
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
  ensureInitialHistorySnapshot: (filename: string, yaml: string) => Promise<void>
  saveYamlToDisk: (filename: string, yaml: string) => Promise<{ success: boolean; error?: string }>
  fileExists: (filename: string) => Promise<boolean>
  refreshConfigInfo: () => Promise<void>
  renameFile: (id: string, nextName: string) => Promise<{ success: boolean; error?: string }>
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
  
  // UI actions
  setSearchQuery: (query: string) => void
  setSortBy: (sort: ScrapeSortMode) => void
  toggleCollapse: (id: string) => void
  toggleSectionCollapse: (section: string) => void
  collapseAll: () => void
  expandAll: () => void
  setActiveSection: (section: ConfigSection | null) => void
  
  // Operations
  sortTargetsInJobs: () => void
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
  return {
    ...defaultConfig,
    ...base,
    global:
      base.global && typeof base.global === 'object' && !Array.isArray(base.global)
        ? (base.global as GlobalConfig)
        : {},
    scrape_configs: Array.isArray(base.scrape_configs) ? base.scrape_configs : [],
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
  }
}

function mergeMetaGroups(config: PrometheusConfig, jobs: ScrapeConfig[]): PrometheusConfig {
  const names = new Set<string>([...(config.meta?.groups || [])])
  jobs.forEach((j) => {
    const g = (j.scrape_group || '').trim()
    if (g) names.add(g)
  })
  return {
    ...config,
    meta: { groups: Array.from(names).sort() },
  }
}

const fromConfig = (config: PrometheusConfig, rawYaml?: string): ScrapeConfig[] => {
  const arr = (config.scrape_configs || []).map((sc) => ({
    ...sc,
    id: generateId(),
  })) as ScrapeConfig[]
  if (rawYaml) {
    const groups = extractJobGroupsFromRaw(rawYaml)
    arr.forEach((j, i) => {
      const g = groups[i]
      if (g) j.scrape_group = g
    })
  }
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
      collapsedJobs: new Set<string>(),
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
      hasUnsavedYamlChanges: () => {
        get().flushEditorYamlToStore?.()
        const cur = canonicalYamlFingerprint(get().exportYaml())
        const sav = canonicalYamlFingerprint(get().originalYaml)
        return cur !== sav
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
        const t = name.trim()
        if (!t) return
        set((state) => {
          const groups = new Set([...(state.config.meta?.groups || []), t])
          return {
            config: {
              ...state.config,
              meta: { groups: Array.from(groups).sort() },
            },
          }
        })
      },
      renameScrapeGroup: (from, to) => {
        const f = from.trim()
        const t = to.trim()
        if (!f || !t || f === t) return
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((j) =>
            (j.scrape_group || '').trim() === f ? { ...j, scrape_group: t } : j
          ),
          config: {
            ...state.config,
            meta: {
              groups: (state.config.meta?.groups || [])
                .map((g) => (g === f ? t : g))
                .filter((g, i, a) => a.indexOf(g) === i)
                .sort(),
            },
          },
        }))
      },
      deleteScrapeGroup: (name) => {
        const n = name.trim()
        if (!n) return
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((j) =>
            (j.scrape_group || '').trim() === n ? { ...j, scrape_group: undefined } : j
          ),
          config: {
            ...state.config,
            meta: {
              groups: (state.config.meta?.groups || []).filter((g) => g !== n),
            },
          },
        }))
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

      ensureInitialHistorySnapshot: async (filename, yaml) => {
        try {
          const existingRes = await fetch(`/api/config/history?file=${encodeURIComponent(filename)}`)
          const existing = await parseApiResponse<{ versions?: ConfigHistoryEntry[] }>(existingRes)
          if (existing.success && Array.isArray(existing.data?.versions) && existing.data.versions.length > 0) {
            return
          }
          await fetch('/api/config/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: filename, yaml }),
          })
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
        await get().ensureInitialHistorySnapshot(t, yaml)
        await get().refreshFiles()
        await get().setActiveFile(t)
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
        await get().ensureInitialHistorySnapshot(t, yaml)
        await get().refreshFiles()
        await get().setActiveFile(t)
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
              ...editorResetPatch(),
              files: get().files,
              validationErrors: [
                {
                  type: 'invalid_yaml',
                  message: j.error || 'Failed to load file',
                },
              ],
            })
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
            originalYaml: content,
            undoStack: [],
            redoStack: [],
            yamlTouchCounter: get().yamlTouchCounter + 1,
          })
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
        set({ config, scrapeConfigs })
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
      setScrapeConfigs: (jobs) => set({ scrapeConfigs: jobs }),

      addScrapeConfig: (job) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        const newJob: ScrapeConfig = { ...job, id: generateId() }
        set((state) => ({
          scrapeConfigs: [...state.scrapeConfigs, newJob],
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }))
      },

      updateScrapeConfig: (id, updates) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }))
      },

      deleteScrapeConfig: (id) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.filter((job) => job.id !== id),
          activeScrapeConfigId: state.activeScrapeConfigId === id ? null : state.activeScrapeConfigId,
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }))
      },

      duplicateScrapeConfig: (id) => {
        const { scrapeConfigs } = get()
        const job = scrapeConfigs.find((j) => j.id === id)
        if (job) {
          const newJob: ScrapeConfig = {
            ...job,
            id: generateId(),
            job_name: `${job.job_name}-copy`,
          }
          const snapshot = { config: clone(get().config), scrapeConfigs: clone(scrapeConfigs) }
          set((state) => ({
            scrapeConfigs: [...scrapeConfigs, newJob],
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }))
        }
      },

      setActiveScrapeConfig: (id) => set({ activeScrapeConfigId: id }),

      // UI actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => {
          const sortedJobs = [...state.scrapeConfigs]
          switch (sort) {
            case 'name_asc':
              sortedJobs.sort((a, b) => a.job_name.localeCompare(b.job_name))
              break
            case 'name_desc':
              sortedJobs.sort((a, b) => b.job_name.localeCompare(a.job_name))
              break
            case 'ip_asc':
              sortedJobs.sort((a, b) => {
                const aTarget = a.static_configs[0]?.targets[0] || ''
                const bTarget = b.static_configs[0]?.targets[0] || ''
                return compareIps(extractIp(aTarget), extractIp(bTarget))
              })
              break
            case 'ip_desc':
              sortedJobs.sort((a, b) => {
                const aTarget = a.static_configs[0]?.targets[0] || ''
                const bTarget = b.static_configs[0]?.targets[0] || ''
                return compareIps(extractIp(bTarget), extractIp(aTarget))
              })
              break
            default:
              break
          }
          return {
            scrapeConfigs: sortedJobs,
            sortBy: sort,
            undoStack: [...state.undoStack, snapshot],
            redoStack: [],
          }
        })
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

      // Operations
      sortTargetsInJobs: () => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((job) => ({
            ...job,
            static_configs: job.static_configs.map((config) => ({
              ...config,
              targets: [...config.targets].sort((a, b) =>
                compareIps(extractIp(a), extractIp(b))
              ),
            })),
          })),
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }))
      },

      normalizeFormatting: () => {
        const snapshot = { config: clone(get().config), scrapeConfigs: clone(get().scrapeConfigs) }
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((job) => ({
            ...job,
            job_name: job.job_name.trim().toLowerCase().replace(/\s+/g, '-'),
            scrape_interval: job.scrape_interval?.trim() || undefined,
            scrape_timeout: job.scrape_timeout?.trim() || undefined,
            metrics_path: job.metrics_path?.trim() || undefined,
            static_configs: job.static_configs.map((config) => ({
              ...config,
              targets: config.targets.map((t) => t.trim()),
            })),
          })),
          undoStack: [...state.undoStack, snapshot],
          redoStack: [],
        }))
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
          set({ undoStack: [], redoStack: [] })
          get().validateConfig()
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

        // Check for duplicate job names
        const jobNames = new Map<string, number>()
        scrapeConfigs.forEach((job) => {
          const count = jobNames.get(job.job_name) || 0
          jobNames.set(job.job_name, count + 1)
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
          const totalTargets = job.static_configs.reduce((n, sc) => n + sc.targets.length, 0)
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
          job.static_configs.forEach((staticConfig) => {
            staticConfig.targets.forEach((target) => {
              const existing = allTargets.get(target) || []
              existing.push(job.job_name)
              allTargets.set(target, existing)
            })
          })
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
          job.static_configs.forEach((staticConfig) => {
            staticConfig.targets.forEach((target) => {
              const t = target?.trim() || ''
              if (!t) return
              if (!targetRegex.test(t)) {
                errors.push({
                  type: 'invalid_target',
                  message: `Invalid target format: ${t} in job ${job.job_name}`,
                  target: t,
                  jobName: job.job_name,
                  section: 'scrape_configs',
                })
                return
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
            })
          })
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
          const match = job.job_name.match(/^([a-zA-Z0-9]+)-/)
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
          job.static_configs.forEach((sc) => {
            jobTargets += sc.targets.length
          })
          totalTargets += jobTargets
          if (jobTargets >= 50) {
            largeJobs.push(job.job_name)
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
