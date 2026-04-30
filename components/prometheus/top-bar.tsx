"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { parseApiResponse } from "@/lib/parse-api-response"
import { ThemeSelector } from "./theme-selector"

export function TopBar() {
  const [busy, setBusy] = useState(false)

  const handleReloadPrometheus = async () => {
    setBusy(true)
    try {
      const response = await fetch("/api/prometheus/reload", {
        method: "POST",
        cache: "no-store",
      })
      const data = await parseApiResponse(response)
      if (data.success) {
        toast.success("Reload request sent to Prometheus")
        return
      }
      toast.warning("Prometheus reload skipped — server not reachable", {
        description: data.error,
      })
    } catch (e) {
      toast.error("Reload request failed", {
        description: (e as Error).message || "Request failed",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" className="h-8 w-8 rounded-lg" alt="" aria-hidden="true" />
          <div>
            <h1 className="text-sm font-semibold">Prometheus Config</h1>
            <p className="text-xs text-muted-foreground">Configuration Manager</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeSelector />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleReloadPrometheus()}
                disabled={busy}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${busy ? "animate-spin" : ""}`} />
                Reload Prometheus
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>POST $PROMETHEUS_URL/-/reload (default port 9090)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
