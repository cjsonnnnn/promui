"use client"

import { useEffect, useMemo, useState } from "react"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { canonicalYamlFingerprint } from "@/lib/yaml-canonical"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { SaveChangesDialog } from "./save-changes-dialog"

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
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const files = usePrometheusStore((s) => s.files)
  const historyVersions = usePrometheusStore((s) => s.historyVersions)
  const yamlEditGeneration = usePrometheusStore((s) => s.yamlTouchCounter)

  const loadHistoryForFile = usePrometheusStore((s) => s.loadHistoryForFile)
  const restoreHistoryEntry = usePrometheusStore((s) => s.restoreHistoryEntry)

  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const resolvedFilename = hasResolvedFile
    ? files.find((f) => f.id === activeFileId)?.filename
    : null

  const [isOpen, setIsOpen] = useState(false)
  const [restoreDiffOpen, setRestoreDiffOpen] = useState(false)
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null)
  const [beforeRestoreYaml, setBeforeRestoreYaml] = useState("")
  const [afterRestoreYaml, setAfterRestoreYaml] = useState("")

  // Load history when active file changes (so badge shows immediately)
  useEffect(() => {
    if (hasResolvedFile && activeFileId) {
      void loadHistoryForFile(activeFileId)
    }
  }, [hasResolvedFile, activeFileId, loadHistoryForFile])

  // When the dialog opens, flush the Monaco editor into the store once so
  // the "Currently active" badge reflects unsaved edits, then refresh.
  useEffect(() => {
    if (!isOpen || !hasResolvedFile || !activeFileId) return
    usePrometheusStore.getState().flushEditorYamlToStore?.()
    void loadHistoryForFile(activeFileId)
  }, [isOpen, hasResolvedFile, activeFileId, loadHistoryForFile])

  const sorted = useMemo(
    () =>
      [...historyVersions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [historyVersions]
  )

  // Compute "currently active" once per render, not per history-entry.
  // Recomputes when the dialog is open and yamlTouchCounter / history change.
  const activeVersionId = useMemo<string | null>(() => {
    if (!isOpen || sorted.length === 0) return null
    const currentFp = canonicalYamlFingerprint(
      usePrometheusStore.getState().exportYaml()
    )
    for (const v of sorted) {
      if (canonicalYamlFingerprint(v.yaml) === currentFp) return v.id
    }
    return null
  }, [isOpen, sorted, yamlEditGeneration, activeFileId])

  const beginRestoreDiff = (versionId: string) => {
    const entry = historyVersions.find((v) => v.id === versionId)
    if (!entry) return
    usePrometheusStore.getState().flushEditorYamlToStore?.()
    setBeforeRestoreYaml(usePrometheusStore.getState().exportYaml())
    setAfterRestoreYaml(entry.yaml)
    setRestoreTargetId(versionId)
    setRestoreDiffOpen(true)
  }

  const applyRestore = async () => {
    if (!restoreTargetId) return
    restoreHistoryEntry(restoreTargetId)
    setRestoreDiffOpen(false)
    setRestoreTargetId(null)
    setIsOpen(false)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="outline"
              size="sm"
              data-testid="version-history-btn"
              onClick={() => setIsOpen(true)}
              disabled={!hasResolvedFile}
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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version history
            </DialogTitle>
            <DialogDescription>
              Snapshots stored locally in <code className="text-xs">.config-history/</code> for{" "}
              <strong>{resolvedFilename || "—"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[min(480px,55vh)] pr-4 flex-1">
            {!hasResolvedFile ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Select a config file first.</p>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No snapshots yet</p>
                <p className="text-sm text-muted-foreground">Saving the file creates a new snapshot</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map((version, index) => {
                  const isActive = activeVersionId === version.id
                  return (
                    <div
                      key={version.id}
                      className={cn(
                        "group rounded-lg border border-border p-3 transition-colors hover:bg-muted/50",
                        index === 0 && "border-success/50 bg-success/5",
                        isActive && "ring-2 ring-chart-2/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground truncate">
                              {version.id}
                            </span>
                            {index === 0 && (
                              <Badge variant="outline" className="text-success border-success/50 shrink-0">
                                Latest
                              </Badge>
                            )}
                            {isActive ? (
                              <Badge variant="secondary" className="shrink-0">
                                Currently active
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatTs(version.timestamp)}
                          </div>
                        </div>
                        {!isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={() => beginRestoreDiff(version.id)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <SaveChangesDialog
        open={restoreDiffOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRestoreDiffOpen(false)
            setRestoreTargetId(null)
          }
        }}
        title="Apply version from history"
        description="Current working YAML (left) and the selected snapshot (right). Apply checks out that snapshot as the saved baseline (no unsaved state until you edit)."
        beforeYaml={beforeRestoreYaml}
        afterYaml={afterRestoreYaml}
        confirmLabel="Apply version"
        useGlobalSavingState={false}
        onConfirm={applyRestore}
      />
    </>
  )
}
