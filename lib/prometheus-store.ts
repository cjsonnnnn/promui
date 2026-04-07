"use client"

import { create } from 'zustand'
import {
  ScrapeConfig,
  ValidationError,
  PrometheusConfig,
  ConfigFile,
  ConfigVersion,
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
  sortBy: 'name' | 'ip' | null
  collapsedJobs: Set<string>
  collapsedSections: Set<string>
  activeSection: ConfigSection | null
  activeScrapeConfigId: string | null
  validationErrors: ValidationError[]
  versions: ConfigVersion[]
  originalYaml: string
  isLoadingFiles: boolean
  isLoadingFile: boolean
  isSaving: boolean
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  setDirectoryPath: (path: string) => void
  addFile: (file: Omit<ConfigFile, 'id'>) => void
  refreshFiles: () => Promise<void>
  createNewFile: (filename: string) => Promise<{ success: boolean; error?: string }>
  uploadYamlFile: (filename: string, yaml: string) => Promise<{ success: boolean; error?: string }>
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
  setSortBy: (sort: 'name' | 'ip' | null) => void
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
  groupJobsByPrefix: () => Map<string, ScrapeConfig[]>
  getStats: () => ConfigStats
  
  undo: () => void
  redo: () => void
  saveVersion: (comment: string) => void
  restoreVersion: (versionId: string) => void
  getVersionDiff: (versionId1: string, versionId2: string) => string
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

const getChangedSections = (oldConfig: PrometheusConfig, newConfig: PrometheusConfig): string[] => {
  const sections: string[] = []
  if (JSON.stringify(oldConfig.global) !== JSON.stringify(newConfig.global)) sections.push('global')
  if (JSON.stringify(oldConfig.scrape_configs) !== JSON.stringify(newConfig.scrape_configs)) sections.push('scrape_configs')
  if (JSON.stringify(oldConfig.alerting) !== JSON.stringify(newConfig.alerting)) sections.push('alerting')
  if (JSON.stringify(oldConfig.remote_write) !== JSON.stringify(newConfig.remote_write)) sections.push('remote_write')
  if (JSON.stringify(oldConfig.remote_read) !== JSON.stringify(newConfig.remote_read)) sections.push('remote_read')
  if (JSON.stringify(oldConfig.storage) !== JSON.stringify(newConfig.storage)) sections.push('storage')
  if (JSON.stringify(oldConfig.tracing) !== JSON.stringify(newConfig.tracing)) sections.push('tracing')
  if (JSON.stringify(oldConfig.rule_files) !== JSON.stringify(newConfig.rule_files)) sections.push('rule_files')
  return sections
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

const fromConfig = (config: PrometheusConfig): ScrapeConfig[] =>
  (config.scrape_configs || []).map((sc) => ({ ...sc, id: generateId() }))

const stripId = (scrapeConfigs: ScrapeConfig[]): Omit<ScrapeConfig, 'id'>[] =>
  scrapeConfigs.map(({ id, ...rest }) => rest)

const nowIso = () => new Date().toISOString()

export const usePrometheusStore = create<PrometheusStore>()((set, get) => ({
      files: [],
      activeFileId: null,
      directoryPath: 'CONFIG_DIR (default ./configs)',
      config: defaultConfig,
      scrapeConfigs: [],
      searchQuery: '',
      sortBy: null,
      collapsedJobs: new Set<string>(),
      collapsedSections: new Set<string>(),
      activeSection: 'scrape_configs',
      activeScrapeConfigId: null,
      validationErrors: [],
      versions: [],
      originalYaml: '',
      isLoadingFiles: false,
      isLoadingFile: false,
      isSaving: false,
      undoStack: [],
      redoStack: [],
      setDirectoryPath: (path) => set({ directoryPath: path }),

      addFile: (file) => {
        const newFile: ConfigFile = { ...file, id: generateId() }
        set((state) => ({ files: [...state.files, newFile] }))
      },

      refreshFiles: async () => {
        set({ isLoadingFiles: true })
        try {
          const response = await fetch('/api/config/list')
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'Failed to load files')
          const files: ConfigFile[] = (data.files || []).map((file: { filename: string; path: string; size: number; lastModified: string }) => ({
            id: file.filename,
            filename: file.filename,
            path: file.path,
            content: defaultConfig,
            lastModified: new Date(file.lastModified),
            size: file.size,
          }))
          set({ files })
        } finally {
          set({ isLoadingFiles: false })
        }
      },

      createNewFile: async (filename) => {
        const safeName = filename.trim().endsWith('.yml') || filename.trim().endsWith('.yaml')
          ? filename.trim()
          : `${filename.trim()}.yml`
        if (!safeName) return { success: false, error: 'Filename is required' }
        const yaml = YAML.stringify(defaultConfig, { indent: 2 })
        const response = await fetch('/api/config/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: safeName, content: yaml }),
        })
        const data = await response.json()
        if (!response.ok) return { success: false, error: data.error || 'Failed to create file' }
        await get().refreshFiles()
        await get().setActiveFile(safeName)
        return { success: true }
      },

      uploadYamlFile: async (filename, yaml) => {
        try {
          YAML.parse(yaml)
        } catch (error) {
          return { success: false, error: `Invalid YAML: ${(error as Error).message}` }
        }
        const response = await fetch('/api/config/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: filename, content: yaml }),
        })
        const data = await response.json()
        if (!response.ok) return { success: false, error: data.error || 'Failed to upload YAML' }
        await get().refreshFiles()
        await get().setActiveFile(filename)
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
        const data = await response.json()
        if (!response.ok) return { success: false, error: data.error || 'Failed to rename file' }
        await get().refreshFiles()
        await get().setActiveFile(nextName)
        return { success: true }
      },

      setActiveFile: async (id) => {
        set({ isLoadingFile: true })
        try {
          const response = await fetch(`/api/config/load?file=${encodeURIComponent(id)}`)
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || 'Failed to load file')
          const parsed = YAML.parse(data.content) as PrometheusConfig
          const config: PrometheusConfig = {
            ...defaultConfig,
            ...parsed,
            scrape_configs: parsed.scrape_configs || [],
          }
          const scrapeConfigs = fromConfig(config)
          set({
            activeFileId: id,
            config,
            scrapeConfigs,
            originalYaml: data.content,
            undoStack: [],
            redoStack: [],
          })
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
        const data = await response.json()
        if (!response.ok) return { success: false, error: data.error || 'Failed to delete file' }
        await get().refreshFiles()
        if (get().activeFileId === id) {
          set({
            activeFileId: null,
            config: clone(defaultConfig),
            scrapeConfigs: [],
            validationErrors: [],
            originalYaml: '',
            undoStack: [],
            redoStack: [],
          })
        }
        return { success: true }
      },

      saveActiveFile: async () => {
        const { activeFileId } = get()
        if (!activeFileId) return { success: false, error: 'No active file selected' }
        set({ isSaving: true })
        try {
          const content = get().exportYaml()
          const response = await fetch('/api/config/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: activeFileId, content }),
          })
          const data = await response.json()
          if (!response.ok) return { success: false, error: data.error || 'Save failed' }
          set({ originalYaml: content })
          get().saveVersion(`Saved ${activeFileId} at ${nowIso()}`)
          await get().refreshFiles()
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
          if (sort === 'name') {
            sortedJobs.sort((a, b) => a.job_name.localeCompare(b.job_name))
          } else if (sort === 'ip') {
            sortedJobs.sort((a, b) => {
              const aTarget = a.static_configs[0]?.targets[0] || ''
              const bTarget = b.static_configs[0]?.targets[0] || ''
              return compareIps(extractIp(aTarget), extractIp(bTarget))
            })
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
          const parsed = YAML.parse(yamlString) as PrometheusConfig
          
          const scrapeConfigs: ScrapeConfig[] = (parsed?.scrape_configs || []).map((config) => ({
            id: generateId(),
            job_name: config.job_name || '',
            static_configs: config.static_configs || [{ targets: [] }],
            scrape_interval: config.scrape_interval,
            scrape_timeout: config.scrape_timeout,
            metrics_path: config.metrics_path,
            scheme: config.scheme,
            honor_labels: config.honor_labels,
            honor_timestamps: config.honor_timestamps,
            params: config.params,
            basic_auth: config.basic_auth,
            bearer_token: config.bearer_token,
            bearer_token_file: config.bearer_token_file,
            tls_config: config.tls_config,
            relabel_configs: config.relabel_configs,
            metric_relabel_configs: config.metric_relabel_configs,
            sample_limit: config.sample_limit,
            label_limit: config.label_limit,
          }))

          const config: PrometheusConfig = {
            global: parsed.global || defaultConfig.global,
            scrape_configs: parsed.scrape_configs,
            rule_files: parsed.rule_files || [],
            alerting: parsed.alerting,
            remote_write: parsed.remote_write,
            remote_read: parsed.remote_read,
            storage: parsed.storage,
            tracing: parsed.tracing,
          }

          // Add as a file
          const newFile: ConfigFile = {
            id: generateId(),
            filename,
            path: `${get().directoryPath}/${filename}`,
            content: config,
            lastModified: new Date(),
            size: yamlString.length,
          }

          set((state) => ({
            config,
            scrapeConfigs,
            files: [...state.files.filter(f => f.filename !== filename), newFile],
            activeFileId: newFile.id,
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
        const exportConfig: PrometheusConfig = {
          ...config,
          scrape_configs: stripId(scrapeConfigs),
        }

        // Remove undefined/empty values for cleaner output
        const cleanConfig = JSON.parse(JSON.stringify(exportConfig, (_, v) => 
          v === undefined || (Array.isArray(v) && v.length === 0) ? undefined : v
        ))

        return YAML.stringify(cleanConfig, { indent: 2 })
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
          if (count > 1) {
            errors.push({
              type: 'duplicate_job',
              message: `Duplicate job name: ${name}`,
              jobName: name,
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
              if (target && !targetRegex.test(target)) {
                errors.push({
                  type: 'invalid_target',
                  message: `Invalid target format: ${target} in job ${job.job_name}`,
                  target,
                  jobName: job.job_name,
                  section: 'scrape_configs',
                })
              }
              const port = Number(target.split(':').at(-1) || '')
              if (!Number.isInteger(port) || port < 1 || port > 65535) {
                errors.push({
                  type: 'invalid_format',
                  message: `Invalid port format: ${target} in job ${job.job_name}`,
                  target,
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

      saveVersion: (comment) => {
        const { config, scrapeConfigs, versions, activeFileId } = get()
        const lastVersion = versions[versions.length - 1]
        
        const fullConfig: PrometheusConfig = {
          ...config,
          scrape_configs: scrapeConfigs.map(({ id, ...rest }) => rest),
        }

        const changedSections = lastVersion 
          ? getChangedSections(YAML.parse(lastVersion.snapshot), fullConfig)
          : ['initial']

        const newVersion: ConfigVersion = {
          id: generateId(),
          fileId: activeFileId || 'default',
          timestamp: new Date(),
          content: fullConfig,
          changedSections,
          comment,
          snapshot: YAML.stringify(fullConfig),
        }

        set({ versions: [...versions, newVersion] })
      },

      restoreVersion: (versionId) => {
        const { versions } = get()
        const version = versions.find((v) => v.id === versionId)
        if (version) {
          const scrapeConfigs = (version.content.scrape_configs || []).map((sc) => ({
            ...sc,
            id: generateId(),
          }))
          set({
            config: version.content,
            scrapeConfigs,
          })
        }
      },

      getVersionDiff: (versionId1, versionId2) => {
        const { versions } = get()
        const v1 = versions.find((v) => v.id === versionId1)
        const v2 = versions.find((v) => v.id === versionId2)
        if (!v1 || !v2) return ''
        
        // Simple diff - in production you'd use a proper diff library
        return `--- ${v1.comment} (${v1.timestamp})\n+++ ${v2.comment} (${v2.timestamp})\n\nChanged sections: ${v2.changedSections.join(', ')}`
      },
}))
