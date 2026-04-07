import YAML from 'yaml'
import type { ScrapeConfig } from '@/lib/prometheus-types'

const GROUP_LINE = /^#\s*=+\s*(.+?)\s*=+\s*$/

/** Strip UI-only fields from a job before writing Prometheus YAML. */
export function stripJobForPrometheus(
  job: ScrapeConfig
): Omit<ScrapeConfig, 'id' | 'scrape_group'> {
  const { id: _id, scrape_group: _g, ...rest } = job
  return rest
}

/**
 * Read `# ========= group =========` markers before each `- job_name:` under scrape_configs.
 * Returns parallel array: group name (possibly "") per job in document order.
 */
export function extractJobGroupsFromRaw(raw: string): string[] {
  const lines = raw.split(/\r?\n/)
  let inScrape = false
  let currentGroup = ''
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()

    if (!inScrape) {
      if (/^scrape_configs\s*:/.test(trimmed)) {
        inScrape = true
      }
      continue
    }

    // Stop at next top-level key (no leading whitespace)
    if (trimmed && !/^\s/.test(line) && !trimmed.startsWith('#')) {
      if (/^[a-zA-Z_][\w_]*\s*:/.test(trimmed)) {
        break
      }
    }

    const gm = line.match(GROUP_LINE)
    if (gm) {
      currentGroup = gm[1].trim()
      continue
    }

    if (/^\s*-\s+job_name\s*:/.test(line)) {
      result.push(currentGroup)
    }
  }

  return result
}

/** YAML lines (no `scrape_configs:` header) for grouped jobs, two-space-indented list items. */
export function stringifyScrapeConfigsGrouped(
  jobs: ScrapeConfig[],
  metaGroups?: string[]
): string {
  if (jobs.length === 0) return ''

  const byGroup = new Map<string, ScrapeConfig[]>()
  for (const j of jobs) {
    const g = (j.scrape_group || '').trim()
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g)!.push(j)
  }

  const namedPresent = new Set(
    jobs.map((j) => (j.scrape_group || '').trim()).filter(Boolean)
  )
  const metaOrder = (metaGroups || []).filter((g) => namedPresent.has(g))
  const extraNamed = [...namedPresent].filter((g) => !metaOrder.includes(g)).sort()
  const groupOrder = [...metaOrder, ...extraNamed]
  const ungrouped = byGroup.get('') || []

  const pushJobs = (list: ScrapeConfig[], withHeader: string | null) => {
    const lines: string[] = []
    if (withHeader) lines.push(`# ========= ${withHeader} =========`)
    for (const job of list) {
      const stripped = stripJobForPrometheus(job)
      const chunk = YAML.stringify([stripped], { indent: 2 })
      lines.push(
        chunk
          .split('\n')
          .map((ln) => (ln ? `  ${ln}` : ln))
          .join('\n')
      )
    }
    return lines
  }

  const out: string[] = []
  for (const g of groupOrder) {
    const list = byGroup.get(g) || []
    if (list.length === 0) continue
    out.push(...pushJobs(list, g))
  }
  if (ungrouped.length > 0) {
    out.push(...pushJobs(ungrouped, null))
  }

  return out.join('\n')
}
