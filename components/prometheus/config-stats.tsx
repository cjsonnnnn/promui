"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BarChart3, Server, Target, FileText, Upload, Download, Bell, AlertTriangle } from 'lucide-react'

export function ConfigStats() {
  const { getStats } = usePrometheusStore()
  const stats = getStats()

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Stats
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Overview of jobs, targets, and other counts for the active file</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Configuration Statistics</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatItem
              icon={Server}
              label="Jobs"
              value={stats.totalJobs}
            />
            <StatItem
              icon={Target}
              label="Targets"
              value={stats.totalTargets}
            />
            <StatItem
              icon={FileText}
              label="Rule Files"
              value={stats.totalRuleFiles}
            />
            <StatItem
              icon={Bell}
              label="Alertmanagers"
              value={stats.totalAlertmanagers}
            />
            <StatItem
              icon={Upload}
              label="Remote Writes"
              value={stats.totalRemoteWrites}
            />
            <StatItem
              icon={Download}
              label="Remote Reads"
              value={stats.totalRemoteReads}
            />
          </div>

          {stats.largeJobs.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Large Jobs (50+ targets)</span>
              </div>
              <div className="mt-2 space-y-1">
                {stats.largeJobs.map((job) => (
                  <Badge key={job} variant="outline" className="mr-1">
                    {job}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-lg font-semibold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
