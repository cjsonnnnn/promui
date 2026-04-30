"use client"

import { useEffect, useState } from "react"
import { diffLines } from "diff"
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
import { Loader2, RotateCcw } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Hunk = {
  id: string
  removedLines: string[]
  addedLines: string[]
  /** 0-indexed start line in afterYaml (inclusive) */
  afterLineStart: number
  /** 0-indexed end line in afterYaml (exclusive) */
  afterLineEnd: number
  /** 0-indexed start line in beforeYaml (inclusive) */
  beforeLineStart: number
  /** 0-indexed end line in beforeYaml (exclusive) */
  beforeLineEnd: number
  label: string
}

// ─── Diff utilities ───────────────────────────────────────────────────────────

const CONTEXT_LINES = 3

function computeHunks(before: string, after: string): Hunk[] {
  const changes = diffLines(before, after)
  const hunks: Hunk[] = []
  let beforeLine = 0
  let afterLine = 0

  type Pending = {
    removedLines: string[]
    addedLines: string[]
    afterLineStart: number
    beforeLineStart: number
  }
  let pending: Pending | null = null

  const flush = () => {
    if (!pending) return
    const a = pending.addedLines.length
    const r = pending.removedLines.length
    const parts: string[] = []
    if (a > 0) parts.push(`+${a}`)
    if (r > 0) parts.push(`-${r}`)
    hunks.push({
      id: `hunk-${pending.afterLineStart}-${pending.beforeLineStart}`,
      removedLines: pending.removedLines,
      addedLines: pending.addedLines,
      afterLineStart: pending.afterLineStart,
      afterLineEnd: afterLine,
      beforeLineStart: pending.beforeLineStart,
      beforeLineEnd: beforeLine,
      label: `${parts.join(" / ")} line${a + r === 1 ? "" : "s"}`,
    })
    pending = null
  }

  for (const change of changes) {
    const raw = change.value.split("\n")
    const count = change.value.endsWith("\n") ? raw.length - 1 : raw.length
    const lines = change.value.endsWith("\n") ? raw.slice(0, -1) : raw

    if (change.added || change.removed) {
      if (!pending) {
        pending = {
          removedLines: [],
          addedLines: [],
          afterLineStart: afterLine,
          beforeLineStart: beforeLine,
        }
      }
      if (change.removed) {
        pending.removedLines.push(...lines)
        beforeLine += count
      } else {
        pending.addedLines.push(...lines)
        afterLine += count
      }
    } else {
      flush()
      beforeLine += count
      afterLine += count
    }
  }
  flush()
  return hunks
}

function revertHunk(afterYaml: string, hunk: Hunk): string {
  const lines = afterYaml.split("\n")
  return [
    ...lines.slice(0, hunk.afterLineStart),
    ...hunk.removedLines,
    ...lines.slice(hunk.afterLineEnd),
  ].join("\n")
}

// ─── Inline diff renderer ─────────────────────────────────────────────────────

type DiffSection = {
  hunk: Hunk
  /** context lines before the hunk (from afterLines — unchanged, same in both) */
  contextBefore: { line: string; num: number }[]
  /** context lines after the hunk */
  contextAfter: { line: string; num: number }[]
  /** number of hidden unchanged lines before this section's context */
  gapBefore: number
}

function buildSections(hunks: Hunk[], afterLines: string[]): DiffSection[] {
  return hunks.map((hunk, i) => {
    const prev = i > 0 ? hunks[i - 1] : null
    const next = i < hunks.length - 1 ? hunks[i + 1] : null

    const ctxStart = Math.max(
      prev ? prev.afterLineEnd : 0,
      hunk.afterLineStart - CONTEXT_LINES
    )
    const ctxEnd = Math.min(
      next ? next.afterLineStart : afterLines.length,
      hunk.afterLineEnd + CONTEXT_LINES
    )

    const contextBefore: { line: string; num: number }[] = []
    for (let l = ctxStart; l < hunk.afterLineStart; l++) {
      contextBefore.push({ line: afterLines[l] ?? "", num: l + 1 })
    }

    const contextAfter: { line: string; num: number }[] = []
    for (let l = hunk.afterLineEnd; l < ctxEnd; l++) {
      contextAfter.push({ line: afterLines[l] ?? "", num: l + 1 })
    }

    const prevCtxEnd = prev
      ? Math.min(hunk.afterLineStart, prev.afterLineEnd + CONTEXT_LINES)
      : 0
    const gapBefore = Math.max(0, ctxStart - prevCtxEnd)

    return { hunk, contextBefore, contextAfter, gapBefore }
  })
}

function LineRow({
  kind,
  num,
  content,
}: {
  kind: "context" | "removed" | "added"
  num: number
  content: string
}) {
  if (kind === "context") {
    return (
      <div className="flex min-h-[1.375rem] items-stretch text-muted-foreground/70">
        <span className="w-10 shrink-0 select-none border-r border-border/30 pr-2 text-right text-[10px] leading-[1.375rem] text-muted-foreground/40">
          {num}
        </span>
        <span className="w-4 shrink-0 select-none text-center text-[10px] leading-[1.375rem]" />
        <span className="flex-1 break-all whitespace-pre-wrap pl-2 pr-1 text-xs leading-[1.375rem]">
          {content}
        </span>
      </div>
    )
  }

  if (kind === "removed") {
    return (
      <div className="flex min-h-[1.375rem] items-stretch bg-destructive/10 text-destructive">
        <span className="w-10 shrink-0 select-none border-r border-destructive/20 pr-2 text-right text-[10px] leading-[1.375rem] text-destructive/50">
          {num}
        </span>
        <span className="w-4 shrink-0 select-none text-center text-[10px] leading-[1.375rem]">
          −
        </span>
        <span className="flex-1 break-all whitespace-pre-wrap pl-2 pr-1 text-xs leading-[1.375rem]">
          {content}
        </span>
      </div>
    )
  }

  // added
  return (
    <div className="flex min-h-[1.375rem] items-stretch bg-success/10 text-success">
      <span className="w-10 shrink-0 select-none border-r border-success/20 pr-2 text-right text-[10px] leading-[1.375rem] text-success/50">
        {num}
      </span>
      <span className="w-4 shrink-0 select-none text-center text-[10px] leading-[1.375rem]">
        +
      </span>
      <span className="flex-1 break-all whitespace-pre-wrap pl-2 pr-1 text-xs leading-[1.375rem]">
        {content}
      </span>
    </div>
  )
}

function InlineDiffView({
  beforeYaml,
  afterYaml,
  hunks,
  onRevertHunk,
}: {
  beforeYaml: string
  afterYaml: string
  hunks: Hunk[]
  onRevertHunk?: (hunk: Hunk) => void
}) {
  const afterLines = afterYaml.split("\n")

  if (hunks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {afterYaml === beforeYaml ? "No changes" : "All changes reverted"}
      </div>
    )
  }

  const sections = buildSections(hunks, afterLines)
  const last = sections[sections.length - 1]
  const trailingGap = last
    ? afterLines.length - (last.hunk.afterLineEnd + CONTEXT_LINES)
    : 0

  return (
    <div className="h-full overflow-y-auto bg-background font-mono">
      {sections.map((sec) => (
        <div key={sec.hunk.id}>
          {sec.gapBefore > 0 && (
            <div className="flex items-center gap-2 border-y border-border/20 bg-muted/20 px-3 py-0.5 text-[10px] text-muted-foreground/50">
              <span>···</span>
              <span>
                {sec.gapBefore} unchanged line
                {sec.gapBefore === 1 ? "" : "s"}
              </span>
              <span>···</span>
            </div>
          )}

          {sec.contextBefore.map((r) => (
            <LineRow
              key={`cb-${sec.hunk.id}-${r.num}`}
              kind="context"
              num={r.num}
              content={r.line}
            />
          ))}

          {/* Changed block — revert button appears on hover */}
          <div className="group relative">
            {sec.hunk.removedLines.map((line, li) => (
              <LineRow
                key={`rm-${sec.hunk.id}-${li}`}
                kind="removed"
                num={sec.hunk.beforeLineStart + li + 1}
                content={line}
              />
            ))}
            {sec.hunk.addedLines.map((line, li) => (
              <LineRow
                key={`add-${sec.hunk.id}-${li}`}
                kind="added"
                num={sec.hunk.afterLineStart + li + 1}
                content={line}
              />
            ))}

            {onRevertHunk && (
              <button
                type="button"
                title={`Revert: ${sec.hunk.label}`}
                onClick={() => onRevertHunk(sec.hunk)}
                className="absolute right-2 top-0.5 flex cursor-pointer items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground opacity-0 transition-opacity hover:border-primary/50 hover:bg-accent hover:text-foreground group-hover:opacity-100"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                revert
              </button>
            )}
          </div>

          {sec.contextAfter.map((r) => (
            <LineRow
              key={`ca-${sec.hunk.id}-${r.num}`}
              kind="context"
              num={r.num}
              content={r.line}
            />
          ))}
        </div>
      ))}

      {trailingGap > 0 && (
        <div className="flex items-center gap-2 border-t border-border/20 bg-muted/20 px-3 py-0.5 text-[10px] text-muted-foreground/50">
          <span>···</span>
          <span>
            {trailingGap} unchanged line{trailingGap === 1 ? "" : "s"}
          </span>
          <span>···</span>
        </div>
      )}
    </div>
  )
}

// ─── Dialog component ─────────────────────────────────────────────────────────

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called whenever the dialog closes (cancel, overlay, escape, or after confirm). */
  onClose?: () => void
  beforeYaml: string
  afterYaml: string
  onConfirm: () => Promise<void>
  /**
   * When provided, per-hunk revert buttons are shown.
   * Called with the updated afterYaml after each revert so the caller can sync state.
   */
  onAfterYamlChange?: (yaml: string) => void
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
  onAfterYamlChange,
  saveError = "",
  title = "Save changes",
  description = "Red lines were removed, green lines were added. Hover a change block to revert it individually.",
  confirmLabel = "Confirm save",
  useGlobalSavingState = true,
}: Props) {
  const isSaving = usePrometheusStore((s) => s.isSaving)
  const busy = useGlobalSavingState && isSaving

  const [localAfterYaml, setLocalAfterYaml] = useState(afterYaml)

  // Reset when the dialog (re-)opens with fresh content
  useEffect(() => {
    if (open) setLocalAfterYaml(afterYaml)
  }, [open, afterYaml])

  const hunks = computeHunks(beforeYaml, localAfterYaml)

  const handleRevertHunk = (hunk: Hunk) => {
    const updated = revertHunk(localAfterYaml, hunk)
    setLocalAfterYaml(updated)
    onAfterYamlChange?.(updated)
  }

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

        <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
          <InlineDiffView
            beforeYaml={beforeYaml}
            afterYaml={localAfterYaml}
            hunks={hunks}
            onRevertHunk={onAfterYamlChange ? handleRevertHunk : undefined}
          />
        </div>

        {saveError ? (
          <p className="shrink-0 text-xs text-destructive">{saveError}</p>
        ) : null}

        <DialogFooter className="shrink-0 gap-2 sm:gap-0">
          <Button
            variant="outline"
            data-testid="save-cancel-btn"
            onClick={() => handleOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button data-testid="save-confirm-btn" onClick={() => void onConfirm()} disabled={busy}>
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
