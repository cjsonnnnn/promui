"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Activity } from 'lucide-react'

export function TracingEditor() {
  const { config, updateTracing } = usePrometheusStore()
  const tracing = config.tracing || {}

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Tracing Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure OpenTelemetry tracing for Prometheus
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endpoint Settings</CardTitle>
            <CardDescription>
              Configure the tracing collector endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Endpoint</label>
              <Input
                value={tracing.endpoint || ''}
                onChange={(e) =>
                  updateTracing({
                    ...tracing,
                    endpoint: e.target.value || undefined,
                  })
                }
                placeholder="localhost:4317"
              />
              <p className="text-xs text-muted-foreground">
                OTLP collector endpoint address
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Client Type</label>
              <Select
                value={tracing.client_type || 'grpc'}
                onValueChange={(value) =>
                  updateTracing({
                    ...tracing,
                    client_type: value as 'grpc' | 'http',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grpc">gRPC</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeout</label>
              <Input
                value={tracing.timeout || ''}
                onChange={(e) =>
                  updateTracing({
                    ...tracing,
                    timeout: e.target.value || undefined,
                  })
                }
                placeholder="10s"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sampling &amp; Compression</CardTitle>
            <CardDescription>
              Configure sampling rate and compression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sampling Fraction</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={tracing.sampling_fraction ?? ''}
                onChange={(e) =>
                  updateTracing({
                    ...tracing,
                    sampling_fraction: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Fraction of traces to sample (0.0 to 1.0)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compression</label>
              <Select
                value={tracing.compression || ''}
                onValueChange={(value) =>
                  updateTracing({
                    ...tracing,
                    compression: (value as 'gzip' | '') || undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="gzip">gzip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <label className="text-sm font-medium">Insecure</label>
                <p className="text-xs text-muted-foreground">
                  Disable TLS verification
                </p>
              </div>
              <Switch
                checked={tracing.insecure || false}
                onCheckedChange={(checked) =>
                  updateTracing({
                    ...tracing,
                    insecure: checked || undefined,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">About Tracing Configuration</p>
            <p className="mt-2">
              Prometheus can export traces to an OpenTelemetry collector, which helps
              debug and understand internal operations. This is useful for
              understanding scrape latencies, rule evaluation times, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
