"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

interface PrometheusStore {
  // Files
  files: ConfigFile[]
  activeFileId: string | null
  directoryPath: string
  
  // Current config state
  config: PrometheusConfig
  scrapeConfigs: ScrapeConfig[]
  
  // UI state
  searchQuery: string
  sortBy: 'name' | 'ip' | null
  collapsedJobs: Set<string>
  collapsedSections: Set<string>
  activeSection: ConfigSection | null
  activeScrapeConfigId: string | null
  
  // Validation
  validationErrors: ValidationError[]
  
  // Version history
  versions: ConfigVersion[]
  
  // File actions
  setDirectoryPath: (path: string) => void
  addFile: (file: Omit<ConfigFile, 'id'>) => void
  setActiveFile: (id: string) => void
  deleteFile: (id: string) => void
  updateFileContent: (id: string, content: PrometheusConfig) => void
  
  // Config actions
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
  
  // Version control
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

export const usePrometheusStore = create<PrometheusStore>()(
  persist(
    (set, get) => ({
      files: [],
      activeFileId: null,
      directoryPath: '/etc/prometheus',
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

      // File actions
      setDirectoryPath: (path) => set({ directoryPath: path }),

      addFile: (file) => {
        const newFile: ConfigFile = { ...file, id: generateId() }
        set((state) => ({ files: [...state.files, newFile] }))
      },

      setActiveFile: (id) => {
        const { files } = get()
        const file = files.find((f) => f.id === id)
        if (file) {
          const scrapeConfigs = (file.content.scrape_configs || []).map((sc) => ({
            ...sc,
            id: generateId(),
          }))
          set({
            activeFileId: id,
            config: file.content,
            scrapeConfigs,
          })
        }
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId,
        }))
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
        const scrapeConfigs = (config.scrape_configs || []).map((sc) => ({
          ...sc,
          id: generateId(),
        }))
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
        const newJob: ScrapeConfig = { ...job, id: generateId() }
        set((state) => ({ scrapeConfigs: [...state.scrapeConfigs, newJob] }))
      },

      updateScrapeConfig: (id, updates) => {
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          ),
        }))
      },

      deleteScrapeConfig: (id) => {
        set((state) => ({
          scrapeConfigs: state.scrapeConfigs.filter((job) => job.id !== id),
          activeScrapeConfigId: state.activeScrapeConfigId === id ? null : state.activeScrapeConfigId,
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
          set({ scrapeConfigs: [...scrapeConfigs, newJob] })
        }
      },

      setActiveScrapeConfig: (id) => set({ activeScrapeConfigId: id }),

      // UI actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sort) => {
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
          return { scrapeConfigs: sortedJobs, sortBy: sort }
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
        }))
      },

      normalizeFormatting: () => {
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
          scrape_configs: scrapeConfigs.map(({ id, ...rest }) => rest),
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

      // Version control
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
    }),
    {
      name: 'prometheus-config-storage',
      partialize: (state) => ({
        files: state.files,
        config: state.config,
        scrapeConfigs: state.scrapeConfigs,
        versions: state.versions,
        directoryPath: state.directoryPath,
      }),
    }
  )
)
