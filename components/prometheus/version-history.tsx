"use client"

import { useEffect, useState } from "react"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { History, RotateCcw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

export function VersionHistory() {
  const { activeFileId, historyVersions, loadHistoryForFile, restoreHistoryEntry } =
    usePrometheusStore()

  const [isOpen, setIsOpen] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && activeFileId) {
      void loadHistoryForFile(activeFileId)
    }
  }, [isOpen, activeFileId, loadHistoryForFile])

  const handleRestore = (id: string) => {
    restoreHistoryEntry(id)
    setRestoreConfirm(null)
    setIsOpen(false)
  }

  const sorted = [...historyVersions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(true)}
              disabled={!activeFileId}
            >
              <History className="mr-2 h-4 w-4" />
              History
              {historyVersions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {historyVersions.length}
                </Badge>
              )}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Version snapshots for this file (after each save)</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version history
            </DialogTitle>
            <DialogDescription>
              Snapshots stored locally in <code className="text-xs">.config-history/</code> for{" "}
              <strong>{activeFileId || "—"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {!activeFileId ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Select a config file first.</p>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No snapshots yet</p>
                <p className="text-sm text-muted-foreground">Saving the file creates a new snapshot</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map((version, index) => (
                  <div
                    key={version.id}
                    className={cn(
                      "group rounded-lg border border-border p-3 transition-colors hover:bg-muted/50",
                      index === 0 && "border-success/50 bg-success/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {version.id}
                          </span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-success border-success/50 shrink-0">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatTs(version.timestamp)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => setRestoreConfirm(version.id)}
                        disabled={index === 0}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restoreConfirm} onOpenChange={() => setRestoreConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore snapshot</DialogTitle>
            <DialogDescription>
              Replace the editor and YAML with this snapshot. Unsaved changes in the editor will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreConfirm(null)}>
              Cancel
            </Button>
            <Button onClick={() => restoreConfirm && handleRestore(restoreConfirm)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
