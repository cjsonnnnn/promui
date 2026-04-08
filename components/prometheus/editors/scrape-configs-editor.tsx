"use client"

import { useState, useMemo, Fragment } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const allCollapsed = scrapeConfigs.length > 0 && collapsedJobs.size === scrapeConfigs.length

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
    if (scrapeGroupFilter === '__ungrouped__') {
      return filteredJobs.filter((j) => !(j.scrape_group || '').trim())
    }
    return filteredJobs.filter((j) => (j.scrape_group || '').trim() === scrapeGroupFilter)
  }, [filteredJobs, scrapeGroupFilter])

  const tableGroupSections = useMemo(() => {
    const m = new Map<string, ScrapeConfig[]>()
    for (const job of jobsAfterGroupFilter) {
      const key = (job.scrape_group || '').trim() || '__ungrouped__'
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(job)
    }
    const named = [...metaGroups.filter((g) => m.has(g)), ...[...m.keys()].filter((k) => k !== '__ungrouped__' && !metaGroups.includes(k)).sort()]
    const ordered: string[] = [...named]
    if (m.has('__ungrouped__') && !ordered.includes('__ungrouped__')) {
      ordered.push('__ungrouped__')
    }
    return ordered
      .filter((k) => m.has(k))
      .map((key) => ({
        key,
        label: key === '__ungrouped__' ? 'Ungrouped' : key,
        jobs: m.get(key)!,
      }))
  }, [jobsAfterGroupFilter, metaGroups])

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
            <SelectItem value="__ungrouped__">Ungrouped only</SelectItem>
            {metaGroups.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
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
            <DropdownMenuItem onClick={sortTargetsInJobs}>
              Sort Targets in Jobs
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
          {allCollapsed ? 'Expand All' : 'Collapse All'}
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {showGroupView && groupedJobs ? (
          <div className="p-4 space-y-4">
            {Array.from(groupedJobs.entries()).map(([prefix, jobs]) => (
              <div key={prefix} className="rounded-lg border border-border">
                <div className="flex items-center justify-between bg-muted px-4 py-2">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{prefix}-*</span>
                    <Badge variant="secondary">{jobs.length} jobs</Badge>
                  </div>
                </div>
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
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Job Name</TableHead>
                <TableHead>Targets</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Timeout</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsAfterGroupFilter.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Server className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery || scrapeGroupFilter !== 'all'
                          ? 'No matching jobs found'
                          : 'No scrape configs defined'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableGroupSections.map((section) => (
                  <Fragment key={section.key}>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={7} className="py-2 text-xs font-semibold text-muted-foreground">
                        {section.label}
                      </TableCell>
                    </TableRow>
                    {section.jobs.map((job) => (
                      <JobTableRow
                        key={job.id}
                        job={job}
                        isCollapsed={collapsedJobs.has(job.id)}
                        onToggle={() => toggleCollapse(job.id)}
                        onEdit={() => setEditingJob(job)}
                        onDuplicate={() => duplicateScrapeConfig(job.id)}
                        onDelete={() => setDeleteConfirm(job.id)}
                      />
                    ))}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
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
              Rename or remove groups. Removing a group unassigns its jobs (they appear as Ungrouped).
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

function JobTableRow({
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
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        <TableCell>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">{job.job_name}</TableCell>
        <TableCell>
          <Badge variant="outline">{targetCount}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {job.scrape_interval || '-'}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {job.scrape_timeout || '-'}
        </TableCell>
        <TableCell className="text-muted-foreground font-mono text-xs">
          {job.metrics_path || '/metrics'}
        </TableCell>
        <TableCell>
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
        </TableCell>
      </TableRow>

      {!isCollapsed && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-0">
            <div className="px-12 py-3 space-y-1">
              {(job.static_configs || []).map((sc, i) =>
                (sc.targets || []).map((target, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="font-mono text-muted-foreground">
                      {target}
                    </span>
                    {sc.labels && Object.keys(sc.labels).length > 0 && (
                      <div className="flex gap-1">
                        {Object.entries(sc.labels).map(([k, v]) => (
                          <Badge key={k} variant="secondary" className="text-xs">
                            {k}={v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
