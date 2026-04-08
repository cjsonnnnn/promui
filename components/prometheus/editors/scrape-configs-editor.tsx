"use client"

import { useState, useMemo, useCallback } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { ScrapeConfig } from '@/lib/prometheus-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Server,
  Plus,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderTree,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { JobEditorModal } from '../job-editor-modal'
import {
  SCRAPE_GROUP_UNGROUPED,
  canonicalScrapeGroup,
} from '@/lib/scrape-group-utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function prefixSectionId(prefix: string) {
  return `p:${prefix}`
}

function groupSectionId(name: string) {
  return `g:${name}`
}

export function ScrapeConfigsEditor() {
  const {
    scrapeConfigs,
    searchQuery,
    setSearchQuery,
    setSortBy,
    collapsedJobs,
    toggleCollapse,
    collapseAll,
    expandAll,
    deleteScrapeConfig,
    duplicateScrapeConfig,
    sortTargetsInJobs,
    normalizeFormatting,
    config,
    renameScrapeGroup,
    deleteScrapeGroup,
  } = usePrometheusStore()

  const [editingJob, setEditingJob] = useState<ScrapeConfig | null>(null)
  const [isAddingJob, setIsAddingJob] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showGroupView, setShowGroupView] = useState(false)
  const [scrapeGroupFilter, setScrapeGroupFilter] = useState<string>('all')
  const [groupManageOpen, setGroupManageOpen] = useState(false)
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({})
  const [groupKeyOrder, setGroupKeyOrder] = useState<'stable' | 'asc' | 'desc'>('stable')
  const [collapsedBundleSections, setCollapsedBundleSections] = useState<Set<string>>(
    () => new Set()
  )
  const allCollapsed = scrapeConfigs.length > 0 && collapsedJobs.size === scrapeConfigs.length

  const toggleBundleSection = useCallback((id: string) => {
    setCollapsedBundleSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return scrapeConfigs
    const query = searchQuery.toLowerCase()
    return scrapeConfigs.filter(
      (job) =>
        (job.job_name || '').toLowerCase().includes(query) ||
        (job.static_configs || []).some((sc) =>
          (sc.targets || []).some((t) => t.toLowerCase().includes(query))
        )
    )
  }, [scrapeConfigs, searchQuery])

  const metaGroups = config.meta?.groups || []

  const jobsAfterGroupFilter = useMemo(() => {
    if (scrapeGroupFilter === 'all') return filteredJobs
    if (scrapeGroupFilter === SCRAPE_GROUP_UNGROUPED) {
      return filteredJobs.filter(
        (j) => canonicalScrapeGroup(j.scrape_group) === SCRAPE_GROUP_UNGROUPED
      )
    }
    return filteredJobs.filter(
      (j) => canonicalScrapeGroup(j.scrape_group) === scrapeGroupFilter
    )
  }, [filteredJobs, scrapeGroupFilter])

  const tableGroupSections = useMemo(() => {
    const m = new Map<string, ScrapeConfig[]>()
    for (const job of jobsAfterGroupFilter) {
      const key = canonicalScrapeGroup(job.scrape_group)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(job)
    }
    let keys: string[]
    if (groupKeyOrder === 'stable') {
      const ordered: string[] = []
      const seen = new Set<string>()
      for (const g of metaGroups) {
        const c = canonicalScrapeGroup(g)
        if (m.has(c) && !seen.has(c)) {
          ordered.push(c)
          seen.add(c)
        }
      }
      for (const k of m.keys()) {
        if (!seen.has(k)) {
          ordered.push(k)
          seen.add(k)
        }
      }
      keys = ordered
    } else {
      keys = [...m.keys()].sort((a, b) =>
        groupKeyOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      )
    }
    return keys.map((key) => ({
      key,
      label: key,
      jobs: m.get(key)!,
    }))
  }, [jobsAfterGroupFilter, metaGroups, groupKeyOrder])

  const groupedJobs = useMemo(() => {
    if (!showGroupView) return null
    const groups = new Map<string, ScrapeConfig[]>()
    jobsAfterGroupFilter.forEach((job) => {
      const match = (job.job_name || '').match(/^([a-zA-Z0-9]+)-/)
      const prefix = match ? match[1] : 'other'
      const existing = groups.get(prefix) || []
      existing.push(job)
      groups.set(prefix, existing)
    })
    return groups
  }, [showGroupView, jobsAfterGroupFilter])

  const prefixEntries = useMemo(() => {
    if (!groupedJobs) return [] as [string, ScrapeConfig[]][]
    let e = Array.from(groupedJobs.entries())
    if (groupKeyOrder === 'asc') {
      e = [...e].sort((a, b) => a[0].localeCompare(b[0]))
    } else if (groupKeyOrder === 'desc') {
      e = [...e].sort((a, b) => b[0].localeCompare(a[0]))
    }
    return e
  }, [groupedJobs, groupKeyOrder])

  const expandAllBundleSections = () => setCollapsedBundleSections(new Set())

  const collapseAllBundleSections = () => {
    const ids =
      showGroupView && groupedJobs
        ? Array.from(groupedJobs.keys()).map(prefixSectionId)
        : tableGroupSections.map((s) => groupSectionId(s.key))
    setCollapsedBundleSections(new Set(ids))
  }

  const handleDelete = (id: string) => {
    deleteScrapeConfig(id)
    setDeleteConfirm(null)
  }

  const getTargetCount = (job: ScrapeConfig) => {
    return (job.static_configs || []).reduce(
      (sum, sc) => sum + (sc.targets?.length || 0),
      0
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold">Scrape Configurations</h2>
            <p className="text-xs text-muted-foreground">
              {scrapeConfigs.length} jobs · {scrapeConfigs.reduce((sum, job) => sum + getTargetCount(job), 0)} targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showGroupView ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowGroupView(!showGroupView)}
          >
            <FolderTree className="mr-2 h-4 w-4" />
            Group by Prefix
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={() => setIsAddingJob(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a scrape job</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs or targets..."
            className="pl-9"
          />
        </div>

        <Select value={scrapeGroupFilter} onValueChange={setScrapeGroupFilter}>
          <SelectTrigger className="h-9 w-[160px] text-xs">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            <SelectItem value={SCRAPE_GROUP_UNGROUPED}>Ungrouped only</SelectItem>
            {metaGroups
              .filter((g) => canonicalScrapeGroup(g) !== SCRAPE_GROUP_UNGROUPED)
              .map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={groupKeyOrder}
          onValueChange={(v) => setGroupKeyOrder(v as 'stable' | 'asc' | 'desc')}
        >
          <SelectTrigger className="h-9 w-[200px] text-xs">
            <SelectValue placeholder="Group order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stable">Groups: file order</SelectItem>
            <SelectItem value="asc">Groups: A–Z</SelectItem>
            <SelectItem value="desc">Groups: Z–A</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setGroupManageOpen(true)}>
          <Layers className="mr-2 h-4 w-4" />
          Groups
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('name_asc')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Job Name ↑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('name_desc')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Job Name ↓
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('ip_asc')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Target IP ↑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('ip_desc')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Target IP ↓
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => sortTargetsInJobs('asc')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Sort Targets in Jobs ↑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sortTargetsInJobs('desc')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Sort Targets in Jobs ↓
            </DropdownMenuItem>
            <DropdownMenuItem onClick={normalizeFormatting}>
              Normalize Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (allCollapsed ? expandAll() : collapseAll())}
        >
          {allCollapsed ? 'Expand all jobs' : 'Collapse all jobs'}
        </Button>
        <Button variant="outline" size="sm" onClick={expandAllBundleSections}>
          Expand all groups
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAllBundleSections}>
          Collapse all groups
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {showGroupView && groupedJobs ? (
          <div className="p-4 space-y-4">
            {prefixEntries.map(([prefix, jobs]) => {
              const sid = prefixSectionId(prefix)
              const bundleCollapsed = collapsedBundleSections.has(sid)
              return (
                <div key={prefix} className="rounded-lg border border-border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-muted px-4 py-2 text-left"
                    onClick={() => toggleBundleSection(sid)}
                  >
                    <div className="flex items-center gap-2">
                      {bundleCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{prefix}-*</span>
                      <Badge variant="secondary">{jobs.length} jobs</Badge>
                    </div>
                  </button>
                  {!bundleCollapsed ? (
                    <div className="divide-y divide-border">
                      {jobs.map((job) => (
                        <JobRow
                          key={job.id}
                          job={job}
                          isCollapsed={collapsedJobs.has(job.id)}
                          onToggle={() => toggleCollapse(job.id)}
                          onEdit={() => setEditingJob(job)}
                          onDuplicate={() => duplicateScrapeConfig(job.id)}
                          onDelete={() => setDeleteConfirm(job.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : jobsAfterGroupFilter.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 p-6">
            <Server className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {searchQuery || scrapeGroupFilter !== 'all'
                ? 'No matching jobs found'
                : 'No scrape configs defined'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {tableGroupSections.map((section) => {
              const sid = groupSectionId(section.key)
              const bundleCollapsed = collapsedBundleSections.has(sid)
              return (
                <div key={section.key} className="rounded-lg border border-border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-muted px-4 py-2 text-left"
                    onClick={() => toggleBundleSection(sid)}
                  >
                    <div className="flex items-center gap-2">
                      {bundleCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{section.label}</span>
                      <Badge variant="secondary">{section.jobs.length} jobs</Badge>
                    </div>
                  </button>
                  {!bundleCollapsed ? (
                    <div className="divide-y divide-border">
                      {section.jobs.map((job) => (
                        <JobRow
                          key={job.id}
                          job={job}
                          isCollapsed={collapsedJobs.has(job.id)}
                          onToggle={() => toggleCollapse(job.id)}
                          onEdit={() => setEditingJob(job)}
                          onDuplicate={() => duplicateScrapeConfig(job.id)}
                          onDelete={() => setDeleteConfirm(job.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Job Editor Modal */}
      <JobEditorModal
        open={isAddingJob || !!editingJob}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingJob(false)
            setEditingJob(null)
          }
        }}
        job={editingJob}
      />

      <Dialog open={groupManageOpen} onOpenChange={setGroupManageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scrape groups</DialogTitle>
            <DialogDescription>
              Rename or remove groups. Removing a group moves its jobs to{" "}
              {SCRAPE_GROUP_UNGROUPED}. The {SCRAPE_GROUP_UNGROUPED} group cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[320px] overflow-y-auto">
            {metaGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No named groups yet. Add one from the job editor.</p>
            ) : (
              metaGroups.map((g) => (
                <div key={g} className="flex flex-col gap-2 rounded-md border border-border p-2">
                  <div className="font-mono text-sm">{g}</div>
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="h-8 flex-1 min-w-[120px]"
                      placeholder="Rename to…"
                      value={renameDrafts[g] ?? ''}
                      onChange={(e) =>
                        setRenameDrafts((d) => ({ ...d, [g]: e.target.value }))
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!(renameDrafts[g] || '').trim()}
                      onClick={() => {
                        const to = (renameDrafts[g] || '').trim()
                        if (!to) return
                        renameScrapeGroup(g, to)
                        setRenameDrafts((d) => {
                          const n = { ...d }
                          delete n[g]
                          return n
                        })
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      disabled={canonicalScrapeGroup(g) === SCRAPE_GROUP_UNGROUPED}
                      onClick={() => {
                        deleteScrapeGroup(g)
                        setRenameDrafts((d) => {
                          const n = { ...d }
                          delete n[g]
                          return n
                        })
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupManageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scrape Config</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scrape configuration? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface JobRowProps {
  job: ScrapeConfig
  isCollapsed: boolean
  onToggle: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function JobRow({
  job,
  isCollapsed,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: JobRowProps) {
  const targetCount = (job.static_configs || []).reduce(
    (sum, sc) => sum + (sc.targets?.length || 0),
    0
  )

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{job.job_name}</span>
            <Badge variant="outline">{targetCount} targets</Badge>
            {job.scrape_interval && (
              <Badge variant="secondary">{job.scrape_interval}</Badge>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
              title="Remove this scrape job"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!isCollapsed && (
        <div className="mt-2 ml-9 space-y-1">
          {(job.static_configs || []).map((sc, i) =>
            (sc.targets || []).map((target, j) => (
              <div
                key={`${i}-${j}`}
                className="text-sm text-muted-foreground font-mono"
              >
                {target}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

