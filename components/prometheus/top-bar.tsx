"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RefreshCw, Settings } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TopBar() {
  const [busy, setBusy] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorDetail, setErrorDetail] = useState("")

  const handleReloadPrometheus = async () => {
    setBusy(true)
    try {
      const response = await fetch("/api/prometheus/reload", {
        method: "POST",
        cache: "no-store",
      })
      const raw = await response.text()
      let data: { error?: string; ok?: boolean } = {}
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string; ok?: boolean }
        } catch {
          data = { error: raw.slice(0, 200) }
        }
      }
      if (!response.ok) {
        const msg =
          data.error ||
          `Reload failed (${response.status}). Is Prometheus running on port 9090?`
        setErrorDetail(msg)
        setErrorOpen(true)
        toast.error("Prometheus reload failed", { description: msg })
        return
      }
      toast.success("Reload request sent to Prometheus")
    } catch (e) {
      const msg =
        (e as Error).message === "Failed to fetch"
          ? "Network error: could not reach this app’s API. If testing reload from the server, ensure the dev server is running."
          : (e as Error).message || "Request failed"
      setErrorDetail(msg)
      setErrorOpen(true)
      toast.error("Reload request failed", { description: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
              <Settings className="h-4 w-4 text-background" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Prometheus Config</h1>
              <p className="text-xs text-muted-foreground">Configuration Manager</p>
            </div>
          </div>
        </div>

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
          <TooltipContent>POST http://127.0.0.1:9090/-/reload</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prometheus reload</DialogTitle>
            <DialogDescription className="text-destructive">{errorDetail}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
