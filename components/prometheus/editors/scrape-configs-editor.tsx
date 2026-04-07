"use client"

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { JobEditorModal } from '../job-editor-modal'

export function ScrapeConfigsEditor() {
  const {
    scrapeConfigs,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    collapsedJobs,
    toggleCollapse,
    collapseAll,
    expandAll,
    deleteScrapeConfig,
    duplicateScrapeConfig,
    sortTargetsInJobs,
    normalizeFormatting,
    groupJobsByPrefix,
  } = usePrometheusStore()

  const [editingJob, setEditingJob] = useState<ScrapeConfig | null>(null)
  const [isAddingJob, setIsAddingJob] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showGroupView, setShowGroupView] = useState(false)
  const allCollapsed = scrapeConfigs.length > 0 && collapsedJobs.size === scrapeConfigs.length

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return scrapeConfigs
    const query = searchQuery.toLowerCase()
    return scrapeConfigs.filter(
      (job) =>
        job.job_name.toLowerCase().includes(query) ||
        job.static_configs.some((sc) =>
          sc.targets.some((t) => t.toLowerCase().includes(query))
        )
    )
  }, [scrapeConfigs, searchQuery])

  const groupedJobs = useMemo(() => {
    if (!showGroupView) return null
    return groupJobsByPrefix()
  }, [showGroupView, groupJobsByPrefix])

  const handleDelete = (id: string) => {
    deleteScrapeConfig(id)
    setDeleteConfirm(null)
  }

  const getTargetCount = (job: ScrapeConfig) => {
    return job.static_configs.reduce((sum, sc) => sum + sc.targets.length, 0)
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
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddingJob(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Sort by Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('ip')}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Sort by IP
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
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Server className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No matching jobs found' : 'No scrape configs defined'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <JobTableRow
                    key={job.id}
                    job={job}
                    isCollapsed={collapsedJobs.has(job.id)}
                    onToggle={() => toggleCollapse(job.id)}
                    onEdit={() => setEditingJob(job)}
                    onDuplicate={() => duplicateScrapeConfig(job.id)}
                    onDelete={() => setDeleteConfirm(job.id)}
                  />
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
  const targetCount = job.static_configs.reduce(
    (sum, sc) => sum + sc.targets.length,
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
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!isCollapsed && (
        <div className="mt-2 ml-9 space-y-1">
          {job.static_configs.map((sc, i) =>
            sc.targets.map((target, j) => (
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
  const targetCount = job.static_configs.reduce(
    (sum, sc) => sum + sc.targets.length,
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
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {!isCollapsed && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-0">
            <div className="px-12 py-3 space-y-1">
              {job.static_configs.map((sc, i) =>
                sc.targets.map((target, j) => (
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
