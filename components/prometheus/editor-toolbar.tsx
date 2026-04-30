"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { cn } from "@/lib/utils"
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
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const files = usePrometheusStore((s) => s.files)
  const validationErrors = usePrometheusStore((s) => s.validationErrors)
  const originalYaml = usePrometheusStore((s) => s.originalYaml)
  const isValidating = usePrometheusStore((s) => s.isValidating)
  const isSaving = usePrometheusStore((s) => s.isSaving)
  const saveDiffRequestNonce = usePrometheusStore((s) => s.saveDiffRequestNonce)

  const validateConfigAsync = usePrometheusStore((s) => s.validateConfigAsync)
  const saveActiveFile = usePrometheusStore((s) => s.saveActiveFile)
  const flushEditorYamlToStore = usePrometheusStore((s) => s.flushEditorYamlToStore)
  const clearResumeAfterSave = usePrometheusStore((s) => s.clearResumeAfterSave)

  const yamlTouchCounter = usePrometheusStore((s) => s.yamlTouchCounter)
  const scrapeConfigs = usePrometheusStore((s) => s.scrapeConfigs)
  const config = usePrometheusStore((s) => s.config)

  const [showSaveDiff, setShowSaveDiff] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [diffYamls, setDiffYamls] = useState<{ before: string; after: string }>({
    before: "",
    after: "",
  })
  const lastNonce = useRef(0)

  const resolvedFile =
    activeFileId && files.some((f) => f.id === activeFileId)
      ? files.find((f) => f.id === activeFileId)
      : undefined

  const activeLabel = resolvedFile?.filename ?? "No file selected"

  const [hasUnsaved, setHasUnsaved] = useState(() =>
    usePrometheusStore.getState().peekUnsavedYaml()
  )

  // Never call `hasUnsavedYamlChanges()` (flush → zustand set) during render — it triggers React error boundaries.
  // useEffect (not useLayoutEffect) — peekUnsavedYaml does YAML.parse twice, so we don't want it blocking paint.
  useEffect(() => {
    setHasUnsaved(usePrometheusStore.getState().peekUnsavedYaml())
  }, [yamlTouchCounter, originalYaml, activeFileId, scrapeConfigs, config])

  const openSaveDialog = () => {
    flushEditorYamlToStore?.()
    const s = usePrometheusStore.getState()
    setDiffYamls({ before: s.originalYaml, after: s.exportYaml() })
    setSaveError("")
    setShowSaveDiff(true)
  }

  const canSave =
    Boolean(resolvedFile) &&
    validationErrors.length === 0 &&
    !isSaving &&
    hasUnsaved

  useEffect(() => {
    if (saveDiffRequestNonce > 0 && saveDiffRequestNonce !== lastNonce.current) {
      lastNonce.current = saveDiffRequestNonce
      openSaveDialog()
    }
    // openSaveDialog intentionally omitted — re-creating it each render would
    // make this effect fire every render. We only want to react to the nonce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveDiffRequestNonce])

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
        <span className={cn(!resolvedFile && "pointer-events-none opacity-50")}>
          <ConfigStats />
        </span>
        <VersionHistory />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                data-testid="validate-yaml-btn"
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
                data-testid="save-file-btn"
                disabled={!canSave}
                onClick={openSaveDialog}
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
        beforeYaml={diffYamls.before}
        afterYaml={diffYamls.after}
        saveError={saveError}
        onConfirm={handleSaveConfirm}
        onAfterYamlChange={(newYaml) => {
          setDiffYamls((d) => ({ ...d, after: newYaml }))
          usePrometheusStore.getState().hydrateFromYaml(newYaml)
        }}
      />
    </>
  )
}
