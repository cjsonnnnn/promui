"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Server,
  FileText,
  Bell,
  Upload,
  Download,
  Database,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfigSection } from '@/lib/prometheus-types'

interface TreeItem {
  section: ConfigSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

export function ConfigTree() {
  const {
    config,
    scrapeConfigs,
    activeSection,
    setActiveSection,
    collapsedSections,
    toggleSectionCollapse,
  } = usePrometheusStore()

  const treeItems: TreeItem[] = [
    {
      section: 'global',
      label: 'Global',
      icon: Globe,
    },
    {
      section: 'scrape_configs',
      label: 'Scrape Configs',
      icon: Server,
      count: scrapeConfigs.length,
    },
    {
      section: 'rule_files',
      label: 'Rule Files',
      icon: FileText,
      count: config.rule_files?.length || 0,
    },
    {
      section: 'alerting',
      label: 'Alerting',
      icon: Bell,
      count: config.alerting?.alertmanagers?.length || 0,
    },
    {
      section: 'remote_write',
      label: 'Remote Write',
      icon: Upload,
      count: config.remote_write?.length || 0,
    },
    {
      section: 'remote_read',
      label: 'Remote Read',
      icon: Download,
      count: config.remote_read?.length || 0,
    },
    {
      section: 'storage',
      label: 'Storage',
      icon: Database,
    },
    {
      section: 'tracing',
      label: 'Tracing',
      icon: Activity,
    },
  ]

  const hasContent = (section: ConfigSection): boolean => {
    switch (section) {
      case 'global':
        return !!config.global
      case 'scrape_configs':
        return scrapeConfigs.length > 0
      case 'rule_files':
        return (config.rule_files?.length || 0) > 0
      case 'alerting':
        return !!config.alerting
      case 'remote_write':
        return (config.remote_write?.length || 0) > 0
      case 'remote_read':
        return (config.remote_read?.length || 0) > 0
      case 'storage':
        return !!config.storage
      case 'tracing':
        return !!config.tracing
      default:
        return false
    }
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-sm font-medium">Configuration</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {treeItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.section
            const hasData = hasContent(item.section)
            const isCollapsed = collapsedSections.has(item.section)

            return (
              <div key={item.section}>
                <button
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted',
                    !hasData && 'opacity-50'
                  )}
                  onClick={() => setActiveSection(item.section)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSectionCollapse(item.section)
                    }}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {item.count}
                    </Badge>
                  )}
                </button>

                {/* Expanded section children for scrape_configs */}
                {item.section === 'scrape_configs' &&
                  !isCollapsed &&
                  scrapeConfigs.length > 0 && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {scrapeConfigs.slice(0, 10).map((job) => (
                        <button
                          key={job.id}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Server className="h-3 w-3" />
                          <span className="truncate">{job.job_name}</span>
                          <Badge
                            variant="outline"
                            className="ml-auto h-4 px-1 text-xs"
                          >
                            {job.static_configs.reduce(
                              (sum, sc) => sum + sc.targets.length,
                              0
                            )}
                          </Badge>
                        </button>
                      ))}
                      {scrapeConfigs.length > 10 && (
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          +{scrapeConfigs.length - 10} more...
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
