"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Globe } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function GlobalEditor() {
  const { config, updateGlobal, activeFileId, files } = usePrometheusStore()
  const global = config.global || {}
  
  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const isDisabled = !hasResolvedFile

  const [newLabelKey, setNewLabelKey] = useState('')
  const [newLabelValue, setNewLabelValue] = useState('')

  const handleChange = (field: string, value: string) => {
    updateGlobal({
      ...global,
      [field]: value || undefined,
    })
  }

  const handleAddExternalLabel = () => {
    if (newLabelKey && newLabelValue) {
      updateGlobal({
        ...global,
        external_labels: {
          ...global.external_labels,
          [newLabelKey]: newLabelValue,
        },
      })
      setNewLabelKey('')
      setNewLabelValue('')
    }
  }

  const handleRemoveExternalLabel = (key: string) => {
    const newLabels = { ...global.external_labels }
    delete newLabels[key]
    updateGlobal({
      ...global,
      external_labels: Object.keys(newLabels).length > 0 ? newLabels : undefined,
    })
  }

  return (
    <div className={cn("space-y-6 p-6", isDisabled && "pointer-events-none opacity-50")}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Global Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Default settings applied to all scrape configs
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scrape Settings</CardTitle>
            <CardDescription>
              Default intervals for scraping targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scrape Interval</label>
              <Input
                value={global.scrape_interval || ''}
                onChange={(e) => handleChange('scrape_interval', e.target.value)}
                placeholder={isDisabled ? "Select a file first..." : "15s"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                How often to scrape targets (e.g., 15s, 1m)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scrape Timeout</label>
              <Input
                value={global.scrape_timeout || ''}
                onChange={(e) => handleChange('scrape_timeout', e.target.value)}
                placeholder={isDisabled ? "Select a file first..." : "10s"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Timeout for each scrape request
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Evaluation Interval</label>
              <Input
                value={global.evaluation_interval || ''}
                onChange={(e) => handleChange('evaluation_interval', e.target.value)}
                placeholder={isDisabled ? "Select a file first..." : "15s"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                How often to evaluate recording and alerting rules
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Query Logging</CardTitle>
            <CardDescription>
              Configure query logging for debugging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Query Log File</label>
              <Input
                value={global.query_log_file || ''}
                onChange={(e) => handleChange('query_log_file', e.target.value)}
                placeholder={isDisabled ? "Select a file first..." : "/var/log/prometheus/query.log"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Path to write PromQL query logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">External Labels</CardTitle>
          <CardDescription>
            Labels added to all time series and alerts before sending to external systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {global.external_labels &&
            Object.entries(global.external_labels).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Input value={key} disabled className="flex-1" />
                <Input value={value} disabled className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveExternalLabel(key)}
                  disabled={isDisabled}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

          <div className="flex items-center gap-2">
            <Input
              value={newLabelKey}
              onChange={(e) => setNewLabelKey(e.target.value)}
              placeholder={isDisabled ? "..." : "Label name"}
              className="flex-1"
              disabled={isDisabled}
            />
            <Input
              value={newLabelValue}
              onChange={(e) => setNewLabelValue(e.target.value)}
              placeholder={isDisabled ? "..." : "Label value"}
              className="flex-1"
              disabled={isDisabled}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddExternalLabel}
              disabled={isDisabled || !newLabelKey || !newLabelValue}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
