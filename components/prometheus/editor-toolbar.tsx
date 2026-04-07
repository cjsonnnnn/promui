"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { ConfigStats } from "./config-stats"
import { VersionHistory } from "./version-history"
import { SaveChangesDialog } from "./save-changes-dialog"
import { Save, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function EditorToolbar() {
  const {
    activeFileId,
    files,
    validationErrors,
    validateConfigAsync,
    saveActiveFile,
    exportYaml,
    originalYaml,
    isValidating,
    isSaving,
    flushEditorYamlToStore,
    clearResumeAfterSave,
    saveDiffRequestNonce,
  } = usePrometheusStore()

  const dirtyProbe = usePrometheusStore((s) => ({
    yt: s.yamlTouchCounter,
    sc: s.scrapeConfigs,
    cfg: s.config,
    oy: s.originalYaml,
    af: s.activeFileId,
  }))

  const [showSaveDiff, setShowSaveDiff] = useState(false)
  const [saveError, setSaveError] = useState("")
  const lastNonce = useRef(0)

  const resolvedFile =
    activeFileId && files.some((f) => f.id === activeFileId)
      ? files.find((f) => f.id === activeFileId)
      : undefined

  const activeLabel = resolvedFile?.filename ?? "No file selected"

  const hasUnsaved = useMemo(
    () => usePrometheusStore.getState().hasUnsavedYamlChanges(),
    [dirtyProbe]
  )

  const canSave =
    Boolean(resolvedFile) &&
    validationErrors.length === 0 &&
    !isSaving &&
    hasUnsaved

  useEffect(() => {
    if (saveDiffRequestNonce > 0 && saveDiffRequestNonce !== lastNonce.current) {
      lastNonce.current = saveDiffRequestNonce
      flushEditorYamlToStore?.()
      setSaveError("")
      setShowSaveDiff(true)
    }
  }, [saveDiffRequestNonce, flushEditorYamlToStore])

  const handleValidate = async () => {
    const errs = await validateConfigAsync()
    if (errs.length === 0) {
      toast.success("YAML is valid")
    } else {
      toast.error(`${errs.length} validation issue(s)`)
    }
  }

  const handleSaveConfirm = async () => {
    setSaveError("")
    const result = await saveActiveFile()
    if (!result.success) {
      setSaveError(result.error || "Save failed")
      toast.error(result.error || "Save failed")
      return
    }
    toast.success("File saved")
    setShowSaveDiff(false)
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
        <div className="mr-auto flex min-w-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">Active file</span>
          <Badge variant="secondary" className="max-w-[200px] truncate font-mono text-xs">
            {activeLabel}
          </Badge>
          {validationErrors.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              {validationErrors.length} issues
            </Badge>
          )}
        </div>
        <ConfigStats />
        <VersionHistory />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidate}
                disabled={!resolvedFile || isValidating}
              >
                {isValidating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Validate YAML
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Validate YAML syntax and scrape config rules</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                size="sm"
                disabled={!canSave}
                onClick={() => {
                  flushEditorYamlToStore?.()
                  setSaveError("")
                  setShowSaveDiff(true)
                }}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save file
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Save changes to disk (opens diff preview)</TooltipContent>
        </Tooltip>
      </div>

      <SaveChangesDialog
        open={showSaveDiff}
        onOpenChange={(open) => {
          setShowSaveDiff(open)
          if (!open) setSaveError("")
        }}
        onClose={() => clearResumeAfterSave()}
        beforeYaml={originalYaml}
        afterYaml={exportYaml()}
        saveError={saveError}
        onConfirm={handleSaveConfirm}
      />
    </>
  )
}
