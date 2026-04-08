"use client"

import { useState, useMemo, useCallback } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { ScrapeConfig } from '@/lib/prometheus-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  ChevronUp,
  X,
  AlignJustify,
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
    sortBy,
    toggleSortBy,
    targetsSort,
    toggleTargetsSort,
    groupKeyOrder,
    setGroupKeyOrder,
    collapsedJobs,
    toggleCollapse,
    collapseAll,
    expandAll,
    deleteScrapeConfig,
    duplicateScrapeConfig,
    normalizeFormatting,
    config,
    renameScrapeGroup,
    deleteScrapeGroup,
    selectedJobs,
    toggleJobSelection,
    selectAllJobs,
    deselectAllJobs,
    selectJobsInGroup,
    batchDeleteScrapeConfigs,
    batchMoveToGroup,
    batchUngroup,
    activeFileId,
    files,
  } = usePrometheusStore()
  
  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const isDisabled = !hasResolvedFile

  const [editingJob, setEditingJob] = useState<ScrapeConfig | null>(null)
  const [isAddingJob, setIsAddingJob] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)
  const [showGroupView, setShowGroupView] = useState(false)
  const [scrapeGroupFilter, setScrapeGroupFilter] = useState<string>('all')
  const [groupManageOpen, setGroupManageOpen] = useState(false)
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({})
  const [collapsedBundleSections, setCollapsedBundleSections] = useState<Set<string>>(
    () => new Set()
  )
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const allJobsCollapsed = scrapeConfigs.length > 0 && collapsedJobs.size === scrapeConfigs.length
  const allBundlesCollapsed = useMemo(() => {
    const totalBundles = showGroupView
      ? new Set(scrapeConfigs.map(j => {
          const match = (j.job_name || '').match(/^([a-zA-Z0-9]+)-/)
          return match ? match[1] : 'other'
        })).size
      : new Set(scrapeConfigs.map(j => canonicalScrapeGroup(j.scrape_group))).size
    return totalBundles > 0 && collapsedBundleSections.size === totalBundles
  }, [scrapeConfigs, collapsedBundleSections, showGroupView])

  // Memoized group selection handler for prefix view
  const handlePrefixSelection = useCallback((jobs: ScrapeConfig[]) => {
    const ids = jobs.map(j => j.id)
    const allSelected = jobs.every(j => selectedJobs.has(j.id))
    if (allSelected) {
      // Deselect all
      ids.forEach(id => {
        if (selectedJobs.has(id)) toggleJobSelection(id)
      })
    } else {
      // Select all
      ids.forEach(id => {
        if (!selectedJobs.has(id)) toggleJobSelection(id)
      })
    }
  }, [selectedJobs, toggleJobSelection])

  const hasSelection = selectedJobs.size > 0

  const toggleBundleSection = useCallback((id: string) => {
    setCollapsedBundleSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAllBundles = useCallback(() => {
    if (allBundlesCollapsed) {
      setCollapsedBundleSections(new Set())
    } else {
      const ids = showGroupView
        ? Array.from(new Set(scrapeConfigs.map(j => {
            const match = (j.job_name || '').match(/^([a-zA-Z0-9]+)-/)
            return prefixSectionId(match ? match[1] : 'other')
          })))
        : Array.from(new Set(scrapeConfigs.map(j => groupSectionId(canonicalScrapeGroup(j.scrape_group)))))
      setCollapsedBundleSections(new Set(ids))
    }
  }, [allBundlesCollapsed, scrapeConfigs, showGroupView])

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

  // Group jobs by their explicit scrape_group value (NOT by prefix)
  // This ensures UI grouping always matches YAML output grouping
  const groupedJobs = useMemo(() => {
    if (!showGroupView) return null
    const groups = new Map<string, ScrapeConfig[]>()
    jobsAfterGroupFilter.forEach((job) => {
      // Use explicit job.scrape_group as source of truth
      const groupKey = canonicalScrapeGroup(job.scrape_group)
      const existing = groups.get(groupKey) || []
      existing.push(job)
      groups.set(groupKey, existing)
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

  const handleDelete = (id: string) => {
    deleteScrapeConfig(id)
    setDeleteConfirm(null)
  }

  const handleBatchDelete = () => {
    batchDeleteScrapeConfigs(Array.from(selectedJobs))
    setBatchDeleteConfirm(false)
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(showGroupView && "bg-accent")}
                  onClick={() => setShowGroupView(!showGroupView)}
                  disabled={isDisabled}
                >
                  <FolderTree className="mr-2 h-4 w-4" />
                  Prefix View
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Group jobs by name prefix</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setIsAddingJob(true)}
                  disabled={isDisabled}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </span>
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
            placeholder={isDisabled ? "Select a file first..." : "Search jobs or targets..."}
            className="pl-9"
            disabled={isDisabled}
          />
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDisabled}>
              <Layers className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Sort Menu - All sorting options in one place */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isDisabled}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="z-50 min-w-[200px]" 
                sideOffset={4} 
                alignOffset={-5}
                avoidCollisions={true}
                collisionPadding={8}
              >
                <DropdownMenuItem onClick={() => toggleSortBy()}>
                  {sortBy === 'name_asc' ? (
                    <><ArrowUp className="mr-2 h-4 w-4" /> Job Name (A–Z)</>
                  ) : sortBy === 'name_desc' ? (
                    <><ArrowDown className="mr-2 h-4 w-4" /> Job Name (Z–A)</>
                  ) : (
                    <><ArrowUpDown className="mr-2 h-4 w-4" /> Job Name</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTargetsSort()}>
                  {targetsSort === 'asc' ? (
                    <><ArrowUp className="mr-2 h-4 w-4" /> Targets (A–Z)</>
                  ) : targetsSort === 'desc' ? (
                    <><ArrowDown className="mr-2 h-4 w-4" /> Targets (Z–A)</>
                  ) : (
                    <><ArrowUpDown className="mr-2 h-4 w-4" /> Targets</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupKeyOrder(groupKeyOrder === 'asc' ? 'desc' : groupKeyOrder === 'desc' ? 'stable' : 'asc')}>
                  {groupKeyOrder === 'asc' ? (
                    <><ArrowUp className="mr-2 h-4 w-4" /> Group Name (A–Z)</>
                  ) : groupKeyOrder === 'desc' ? (
                    <><ArrowDown className="mr-2 h-4 w-4" /> Group Name (Z–A)</>
                  ) : groupKeyOrder === 'stable' ? (
                    <><AlignJustify className="mr-2 h-4 w-4" /> File Order</>
                  ) : (
                    <><ArrowUpDown className="mr-2 h-4 w-4" /> Group Order</>
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Collapse/Expand Toggle */}
            <DropdownMenuItem onClick={() => allJobsCollapsed ? expandAll() : collapseAll()} disabled={isDisabled}>
              {allJobsCollapsed ? (
                <><ChevronDown className="mr-2 h-4 w-4" /> Expand All Jobs</>
              ) : (
                <><ChevronUp className="mr-2 h-4 w-4" /> Collapse All Jobs</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleAllBundles} disabled={isDisabled}>
              {allBundlesCollapsed ? (
                <><ChevronDown className="mr-2 h-4 w-4" /> Expand All Groups</>
              ) : (
                <><ChevronUp className="mr-2 h-4 w-4" /> Collapse All Groups</>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={normalizeFormatting} disabled={isDisabled}>
              <AlignJustify className="mr-2 h-4 w-4" />
              Normalize Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Groups Management */}
        <Button variant="outline" size="sm" onClick={() => setGroupManageOpen(true)} disabled={isDisabled}>
          <Layers className="mr-2 h-4 w-4" />
          Groups
        </Button>

        {/* Filter */}
        <Select 
          value={scrapeGroupFilter} 
          onValueChange={setScrapeGroupFilter}
          disabled={isDisabled}
        >
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jobs</SelectItem>
            <SelectItem value={SCRAPE_GROUP_UNGROUPED}>Ungrouped</SelectItem>
            {metaGroups
              .filter((g) => canonicalScrapeGroup(g) !== SCRAPE_GROUP_UNGROUPED)
              .map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Batch Actions Bar */}
      {hasSelection && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-accent/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedJobs.size} selected
            </span>
            <Button variant="ghost" size="sm" onClick={deselectAllJobs}>
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Layers className="mr-2 h-4 w-4" />
                  Move to Group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {metaGroups
                  .filter((g) => canonicalScrapeGroup(g) !== SCRAPE_GROUP_UNGROUPED)
                  .map((g) => (
                    <DropdownMenuItem key={g} onClick={() => batchMoveToGroup(Array.from(selectedJobs), g)}>
                      {g}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCreateGroupOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create new group...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => batchUngroup(Array.from(selectedJobs))}>
                  Ungroup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="destructive" size="sm" onClick={() => setBatchDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className={cn("flex-1", isDisabled && "pointer-events-none opacity-50")}>
        {showGroupView && groupedJobs ? (
          <div className="p-4 space-y-4">
            {prefixEntries.map(([prefix, jobs]) => {
              const sid = prefixSectionId(prefix)
              const bundleCollapsed = collapsedBundleSections.has(sid)
              const allInPrefixSelected = jobs.every(j => selectedJobs.has(j.id))
              const someInPrefixSelected = jobs.some(j => selectedJobs.has(j.id)) && !allInPrefixSelected
              return (
                <div key={prefix} className="rounded-lg border border-border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-muted px-4 py-2 text-left"
                    onClick={() => toggleBundleSection(sid)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allInPrefixSelected ? true : someInPrefixSelected ? 'indeterminate' : false}
                        onCheckedChange={() => handlePrefixSelection(jobs)}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-1 border-2 border-border data-[state=checked]:border-primary data-[state=indeterminate]:border-primary"
                      />
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
                          isSelected={selectedJobs.has(job.id)}
                          onToggle={() => toggleCollapse(job.id)}
                          onEdit={() => setEditingJob(job)}
                          onDuplicate={() => duplicateScrapeConfig(job.id)}
                          onDelete={() => setDeleteConfirm(job.id)}
                          onSelect={() => toggleJobSelection(job.id)}
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
              const allInGroupSelected = section.jobs.every(j => selectedJobs.has(j.id))
              const someInGroupSelected = section.jobs.some(j => selectedJobs.has(j.id)) && !allInGroupSelected
              return (
                <div key={section.key} className="rounded-lg border border-border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-muted px-4 py-2 text-left"
                    onClick={() => toggleBundleSection(sid)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allInGroupSelected ? true : someInGroupSelected ? 'indeterminate' : false}
                        onCheckedChange={() => selectJobsInGroup(section.key)}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-1 border-2 border-border data-[state=checked]:border-primary data-[state=indeterminate]:border-primary"
                      />
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
                          isSelected={selectedJobs.has(job.id)}
                          onToggle={() => toggleCollapse(job.id)}
                          onEdit={() => setEditingJob(job)}
                          onDuplicate={() => duplicateScrapeConfig(job.id)}
                          onDelete={() => setDeleteConfirm(job.id)}
                          onSelect={() => toggleJobSelection(job.id)}
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

      {/* Create New Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Enter a name for the new group. Selected jobs will be moved to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newGroupName.trim()) {
                  batchMoveToGroup(Array.from(selectedJobs), newGroupName.trim())
                  setNewGroupName('')
                  setCreateGroupOpen(false)
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateGroupOpen(false)
              setNewGroupName('')
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newGroupName.trim()) {
                  batchMoveToGroup(Array.from(selectedJobs), newGroupName.trim())
                  setNewGroupName('')
                  setCreateGroupOpen(false)
                }
              }}
              disabled={!newGroupName.trim()}
            >
              Create & Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation */}
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

      {/* Batch Delete Confirmation */}
      <Dialog open={batchDeleteConfirm} onOpenChange={() => setBatchDeleteConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Jobs</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedJobs.size} selected job(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              Delete {selectedJobs.size} jobs
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
  isSelected: boolean
  onToggle: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSelect: () => void
}

function JobRow({
  job,
  isCollapsed,
  isSelected,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onSelect,
}: JobRowProps) {
  const targetCount = (job.static_configs || []).reduce(
    (sum, sc) => sum + (sc.targets?.length || 0),
    0
  )

  return (
    <div className={cn("px-4 py-3 transition-colors", isSelected && "bg-accent/20")}>
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="mr-1 border-2 border-border data-[state=checked]:border-primary"
        />
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
        <div className="mt-2 ml-14 space-y-1">
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
