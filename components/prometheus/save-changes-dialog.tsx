"use client"

import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { Loader2 } from "lucide-react"

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  { ssr: false }
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called whenever the dialog closes (cancel, overlay, escape, or after confirm flow). */
  onClose?: () => void
  beforeYaml: string
  afterYaml: string
  onConfirm: () => Promise<void>
  saveError?: string
  title?: string
  description?: string
  confirmLabel?: string
  useGlobalSavingState?: boolean
}

export function SaveChangesDialog({
  open,
  onOpenChange,
  onClose,
  beforeYaml,
  afterYaml,
  onConfirm,
  saveError = "",
  title = "Save changes",
  description = "Compare previous YAML (left) with the YAML to be written (right). Green and red highlights show additions and removals.",
  confirmLabel = "Confirm save",
  useGlobalSavingState = true,
}: Props) {
  const isSaving = usePrometheusStore((s) => s.isSaving)
  const busy = useGlobalSavingState && isSaving

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose?.()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-[96vw] w-[96vw] h-[92vh] !flex !flex-col gap-2 p-4">
        <DialogHeader className="shrink-0 space-y-1">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-[72vh] h-[calc(92vh-140px)] min-h-0 flex-1 rounded-md border border-border overflow-hidden">
          <DiffEditor
            height="100%"
            language="yaml"
            original={beforeYaml}
            modified={afterYaml}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              fontSize: 12,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: "on",
            }}
          />
        </div>
        {saveError ? (
          <p className="text-xs text-destructive shrink-0">{saveError}</p>
        ) : null}
        <DialogFooter className="shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void onConfirm()} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
