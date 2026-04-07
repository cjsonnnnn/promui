// Labels for various Prometheus configs
export interface Label {
  key: string
  value: string
}

export interface StaticConfig {
  targets: string[]
  labels?: Record<string, string>
}

/** UI-only; never written as a Prometheus field (ordering via comments in YAML). */
export type ScrapeGroupName = string

// Full ScrapeConfig with all Prometheus options
export interface ScrapeConfig {
  id: string
  job_name: string
  /** Optional scrape group (app UI only; reflected as `# ========= name =========` in YAML). */
  scrape_group?: ScrapeGroupName
  static_configs: StaticConfig[]
  scrape_interval?: string
  scrape_timeout?: string
  metrics_path?: string
  scheme?: 'http' | 'https'
  honor_labels?: boolean
  honor_timestamps?: boolean
  params?: Record<string, string[]>
  basic_auth?: {
    username: string
    password?: string
    password_file?: string
  }
  bearer_token?: string
  bearer_token_file?: string
  tls_config?: TLSConfig
  relabel_configs?: RelabelConfig[]
  metric_relabel_configs?: RelabelConfig[]
  sample_limit?: number
  label_limit?: number
}

export interface TLSConfig {
  ca_file?: string
  cert_file?: string
  key_file?: string
  server_name?: string
  insecure_skip_verify?: boolean
}

export interface RelabelConfig {
  source_labels?: string[]
  separator?: string
  target_label?: string
  regex?: string
  modulus?: number
  replacement?: string
  action?: 'replace' | 'keep' | 'drop' | 'hashmod' | 'labelmap' | 'labeldrop' | 'labelkeep'
}

// Global config
export interface GlobalConfig {
  scrape_interval?: string
  scrape_timeout?: string
  evaluation_interval?: string
  external_labels?: Record<string, string>
  query_log_file?: string
}

// Alerting config
export interface AlertmanagerConfig {
  static_configs?: StaticConfig[]
  relabel_configs?: RelabelConfig[]
  scheme?: 'http' | 'https'
  path_prefix?: string
  timeout?: string
  api_version?: 'v1' | 'v2'
  tls_config?: TLSConfig
  basic_auth?: {
    username: string
    password?: string
    password_file?: string
  }
}

export interface AlertingConfig {
  alert_relabel_configs?: RelabelConfig[]
  alertmanagers?: AlertmanagerConfig[]
}

// Remote write/read
export interface RemoteWriteConfig {
  url: string
  name?: string
  remote_timeout?: string
  headers?: Record<string, string>
  write_relabel_configs?: RelabelConfig[]
  basic_auth?: {
    username: string
    password?: string
    password_file?: string
  }
  bearer_token?: string
  bearer_token_file?: string
  tls_config?: TLSConfig
  queue_config?: {
    capacity?: number
    max_shards?: number
    min_shards?: number
    max_samples_per_send?: number
    batch_send_deadline?: string
    min_backoff?: string
    max_backoff?: string
    retry_on_http_429?: boolean
  }
}

export interface RemoteReadConfig {
  url: string
  name?: string
  remote_timeout?: string
  read_recent?: boolean
  required_matchers?: Record<string, string>
  basic_auth?: {
    username: string
    password?: string
    password_file?: string
  }
  bearer_token?: string
  bearer_token_file?: string
  tls_config?: TLSConfig
}

// Storage config
export interface StorageConfig {
  tsdb?: {
    out_of_order_time_window?: string
  }
  exemplars?: {
    max_exemplars?: number
  }
}

// Tracing config
export interface TracingConfig {
  endpoint?: string
  client_type?: 'grpc' | 'http'
  sampling_fraction?: number
  insecure?: boolean
  headers?: Record<string, string>
  compression?: 'gzip' | ''
  timeout?: string
  tls_config?: TLSConfig
}

// Rule file reference
export interface RuleFile {
  path: string
}

/** App-only metadata; stripped before persisting YAML to disk. */
export interface PrometheusConfigMeta {
  /** Ordered group names for scrape job organization (UI). */
  groups?: string[]
}

// Full Prometheus config
export interface PrometheusConfig {
  global?: GlobalConfig
  /** Not written to prometheus.yml; kept in memory for group UI only. */
  meta?: PrometheusConfigMeta
  scrape_configs?: Omit<ScrapeConfig, 'id'>[]
  rule_files?: string[]
  alerting?: AlertingConfig
  remote_write?: RemoteWriteConfig[]
  remote_read?: RemoteReadConfig[]
  storage?: StorageConfig
  tracing?: TracingConfig
}

// Validation
export interface ValidationError {
  type:
    | 'duplicate_job'
    | 'duplicate_target'
    | 'invalid_yaml'
    | 'invalid_target'
    | 'missing_required'
    | 'invalid_format'
    | 'missing_job_name'
    | 'empty_targets'
  message: string
  jobName?: string
  target?: string
  section?: string
  field?: string
}

// Config file metadata
export interface ConfigFile {
  id: string
  filename: string
  path: string
  content: PrometheusConfig
  lastModified: Date
  size: number
}

// Version history (persisted under .config-history/{filename}.json)
export interface ConfigHistoryEntry {
  id: string
  timestamp: string
  yaml: string
}

// Legacy in-memory shape (kept for typing where needed)
export interface ConfigVersion {
  id: string
  fileId: string
  timestamp: Date
  content: PrometheusConfig
  changedSections: string[]
  comment: string
  snapshot: string
}

// Tree node for navigation
export interface ConfigTreeNode {
  id: string
  label: string
  section: ConfigSection
  children?: ConfigTreeNode[]
  hasContent: boolean
  itemCount?: number
}

// Config sections
export type ConfigSection = 
  | 'global'
  | 'scrape_configs'
  | 'rule_files'
  | 'alerting'
  | 'remote_write'
  | 'remote_read'
  | 'storage'
  | 'tracing'

// Statistics
export interface ConfigStats {
  totalJobs: number
  totalTargets: number
  totalRuleFiles: number
  totalRemoteWrites: number
  totalRemoteReads: number
  totalAlertmanagers: number
  largeJobs: string[] // Jobs with 50+ targets
}
