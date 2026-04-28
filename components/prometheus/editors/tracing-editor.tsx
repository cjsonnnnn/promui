"use client"

import { Activity } from "lucide-react"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { cn } from "@/lib/utils"

/**
 * Full tracing UI was causing runtime errors (e.g. invalid Select values in Radix).
 * Structured editing for tracing is not implemented in this build.
 */
export function TracingEditor() {
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const files = usePrometheusStore((s) => s.files)
  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )

  return (
    <div className={cn(
      "flex h-full flex-col items-center justify-center gap-4 p-8 text-center",
      !hasResolvedFile && "pointer-events-none opacity-50"
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
        <Activity className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold">Tracing</h2>
        <p className="text-sm text-muted-foreground">
          Tracing configuration is not implemented in this UI yet. Edit the{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">tracing</code> block directly in the
          YAML editor on the right, then save the file.
        </p>
      </div>
    </div>
  )
}
