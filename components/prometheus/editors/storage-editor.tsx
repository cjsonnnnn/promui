"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StorageEditor() {
  const config = usePrometheusStore((s) => s.config)
  const updateStorage = usePrometheusStore((s) => s.updateStorage)
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const files = usePrometheusStore((s) => s.files)
  const storage = config.storage || {}

  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const isDisabled = !hasResolvedFile

  return (
    <div className={cn("space-y-6 p-6", isDisabled && "pointer-events-none opacity-50")}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Storage Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure TSDB and exemplar storage settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">TSDB Settings</CardTitle>
            <CardDescription>
              Time-series database configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Out of Order Time Window</label>
              <Input
                value={storage.tsdb?.out_of_order_time_window || ''}
                onChange={(e) =>
                  updateStorage({
                    ...storage,
                    tsdb: {
                      ...storage.tsdb,
                      out_of_order_time_window: e.target.value || undefined,
                    },
                  })
                }
                placeholder={isDisabled ? "Select a file first..." : "0s"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                How far back to accept out-of-order samples (e.g., 30m)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exemplar Settings</CardTitle>
            <CardDescription>
              Configure exemplar storage limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Exemplars</label>
              <Input
                type="number"
                value={storage.exemplars?.max_exemplars || ''}
                onChange={(e) =>
                  updateStorage({
                    ...storage,
                    exemplars: {
                      ...storage.exemplars,
                      max_exemplars: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    },
                  })
                }
                placeholder={isDisabled ? "Select a file first..." : "100000"}
                disabled={isDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of exemplars to store in circular buffer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">About Storage Configuration</p>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>
                <strong>Out of Order Time Window:</strong> Allows ingesting samples
                that are slightly older than the most recent sample. Useful for
                high-latency or unreliable networks.
              </li>
              <li>
                <strong>Max Exemplars:</strong> Exemplars are sampled traces
                associated with metrics. Setting this to 0 disables exemplar storage.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
