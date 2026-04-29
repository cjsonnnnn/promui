"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import type * as monaco from "monaco-editor"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, AlertCircle, FileCode, Download, Loader2, PanelRightClose } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMonaco } from "@monaco-editor/react"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

interface YamlPreviewProps {
  onCollapse?: () => void
}

export function YamlPreview({ onCollapse }: YamlPreviewProps) {
  const monacoInstance = useMonaco()
  const validationErrors = usePrometheusStore((s) => s.validationErrors)
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const files = usePrometheusStore((s) => s.files)
  const isLoadingFile = usePrometheusStore((s) => s.isLoadingFile)
  const config = usePrometheusStore((s) => s.config)
  const scrapeConfigs = usePrometheusStore((s) => s.scrapeConfigs)

  const hydrateFromYaml = usePrometheusStore((s) => s.hydrateFromYaml)
  const setFlushEditorYamlToStore = usePrometheusStore(
    (s) => s.setFlushEditorYamlToStore
  )

  const exportYaml = useCallback(() => usePrometheusStore.getState().exportYaml(), [])

  const resolvedFile =
    activeFileId && files.some((f) => f.id === activeFileId)
      ? files.find((f) => f.id === activeFileId)
      : undefined
  const hasResolvedFile = Boolean(resolvedFile)

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const editorFocusedRef = useRef(false)
  const [editorReady, setEditorReady] = useState(false)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  // Per-file timer + identity. Pending timers must NEVER fire after switching
  // files — that's how prometheus.yml content was leaking into other files.
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeFileIdRef = useRef<string | null>(activeFileId)
  // Frozen at editor mount time — identifies which file THIS Monaco instance
  // was created for. Used by blur/onChange/flush callbacks to detect when they
  // belong to a stale editor (one that was mounted for a different file).
  const mountedForFileRef = useRef<string | null>(null)
  // setValue() triggers onChange; this flag tells onChange that the change
  // came from the store (not a user edit), so we don't re-hydrate or mark dirty.
  const programmaticChangeRef = useRef(false)
  const [copied, setCopied] = useState(false)
  const [lineCount, setLineCount] = useState(1)

  const cancelPendingTimers = useCallback(() => {
    if (applyTimerRef.current !== null) {
      clearTimeout(applyTimerRef.current)
      applyTimerRef.current = null
    }
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
  }, [])

  const scheduleApply = useCallback((value: string, fileId: string | null) => {
    if (applyTimerRef.current !== null) clearTimeout(applyTimerRef.current)
    applyTimerRef.current = setTimeout(() => {
      applyTimerRef.current = null
      // Drop stale apply if the user switched files while debouncing.
      if (activeFileIdRef.current !== fileId) return
      hydrateFromYaml(value)
    }, 400)
  }, [hydrateFromYaml])

  const scheduleTouch = useCallback((fileId: string | null) => {
    if (touchTimerRef.current !== null) clearTimeout(touchTimerRef.current)
    touchTimerRef.current = setTimeout(() => {
      touchTimerRef.current = null
      if (activeFileIdRef.current !== fileId) return
      usePrometheusStore.getState().touchYamlFromEditor()
    }, 200)
  }, [])

  // Update activeFileIdRef SYNCHRONOUSLY during render so it's current before
  // React's commit phase. This is critical: when the key changes on the Editor,
  // the old editor unmounts during commit and fires onDidBlurEditorWidget.
  // If activeFileIdRef still holds the old value at that point, the guard
  // (mountedForFileRef !== activeFileIdRef) won't catch the stale blur, and
  // the old editor's content overwrites the freshly-loaded config.
  // useEffect runs AFTER commit, so updating there is too late.
  activeFileIdRef.current = activeFileId

  // Cancel pending timers when the active file changes.
  useEffect(() => {
    cancelPendingTimers()
  }, [activeFileId, cancelPendingTimers])

  useEffect(() => {
    setFlushEditorYamlToStore(() => {
      const ed = editorRef.current
      if (!ed) return
      // Don't flush stale editor content into the store after a file switch.
      // mountedForFileRef captures which file THIS editor was created for;
      // if it doesn't match the current active file, flushing would overwrite
      // the freshly-loaded config with content from the old file.
      if (mountedForFileRef.current !== activeFileIdRef.current) return
      // A flush represents intent to apply the editor's current value RIGHT NOW
      // for the file currently open. Cancel any pending debounce since this
      // supersedes it.
      cancelPendingTimers()
      usePrometheusStore.getState().hydrateFromYaml(ed.getValue())
    })
    return () => setFlushEditorYamlToStore(null)
  }, [setFlushEditorYamlToStore, cancelPendingTimers])

  // Cleanup editor and ResizeObserver on unmount
  useEffect(() => {
    return () => {
      cancelPendingTimers()
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      const ed = editorRef.current
      if (ed) {
        ed.dispose()
        editorRef.current = null
      }
    }
  }, [cancelPendingTimers])

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    // Ensure the per-file identity ref reflects the file this editor was
    // mounted for, regardless of the order between this onMount and the
    // useEffect that watches activeFileId.
    activeFileIdRef.current = activeFileId
    // Freeze the file ID this editor instance was created for. All callbacks
    // (blur, onChange, flush) compare this against activeFileIdRef.current to
    // detect when they belong to a stale editor that's being destroyed.
    mountedForFileRef.current = activeFileId
    editor.onDidFocusEditorWidget(() => {
      editorFocusedRef.current = true
    })
    editor.onDidBlurEditorWidget(() => {
      editorFocusedRef.current = false
      // Apply on blur only if this editor is still for the active file.
      // When switching files, the old editor fires blur AFTER the new
      // activeFileId is set, so mountedForFileRef != activeFileIdRef
      // correctly prevents stale content from overwriting the new config.
      const value = editor.getValue()
      cancelPendingTimers()
      if (mountedForFileRef.current !== activeFileIdRef.current) return
      hydrateFromYaml(value)
    })
    const initial = exportYaml()
    programmaticChangeRef.current = true
    editor.setValue(initial)
    programmaticChangeRef.current = false
    setLineCount(initial.split("\n").length)

    // Replace automaticLayout with a debounced ResizeObserver that skips layout
    // at 0×0. Debouncing prevents repeated layout calls during panel animations
    // (collapse/expand), firing once only after the animation settles.
    const container = editor.getContainerDomNode()
    if (container) {
      let timerId: ReturnType<typeof setTimeout> | null = null
      const ro = new ResizeObserver(() => {
        if (timerId !== null) clearTimeout(timerId)
        timerId = setTimeout(() => {
          timerId = null
          const rect = container.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            editorRef.current?.layout()
          }
        }, 150)
      })
      ro.observe(container)
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = ro
    }
    setEditorReady(true)
  }

  // Map validation errors into Monaco editor markers
  useEffect(() => {
    if (!monacoInstance || !editorRef.current || !editorReady) return
    
    const applyMarkers = () => {
      const model = editorRef.current?.getModel()
      if (!model) return

      const markers = validationErrors.map((error) => {
      let startLineNumber = 1
      let endLineNumber = 1
      let startColumn = 1
      let endColumn = model.getLineMaxColumn(1) || 2

      const lines = model.getLinesContent()
      
      // Best-effort search to find the specific line
      let searchStartIndex = 0
      
      // If it's scoped to a job, find the job first
      if (error.jobName) {
        const jobIdx = lines.findIndex(l => l.includes(`job_name: ${error.jobName}`) || l.includes(`job_name: "${error.jobName}"`) || l.includes(`job_name: '${error.jobName}'`))
        if (jobIdx >= 0) searchStartIndex = jobIdx
      } else if (error.section) {
        // If it's scoped to a section (e.g., global), find that section
        const sectionIdx = lines.findIndex(l => l.trim() === `${error.section}:`)
        if (sectionIdx >= 0) searchStartIndex = sectionIdx
      }

      // Now find the specific field or target
      if (error.field) {
        for (let i = searchStartIndex; i < lines.length; i++) {
          const line = lines[i]
          const fieldMatch = line.indexOf(`${error.field}:`)
          if (fieldMatch >= 0) {
            startLineNumber = i + 1
            endLineNumber = i + 1
            const colonIndex = line.indexOf(':', fieldMatch)
            let valStart = colonIndex + 1
            while (valStart < line.length && (line[valStart] === ' ' || line[valStart] === '\t')) {
              valStart++
            }
            startColumn = valStart + 1
            endColumn = line.length + 1
            break
          }
        }
      } else if (error.target) {
        // If it's a target error, search for the target string
        for (let i = searchStartIndex; i < lines.length; i++) {
          const line = lines[i]
          const targetIdx = line.indexOf(error.target)
          if (targetIdx >= 0) {
            startLineNumber = i + 1
            endLineNumber = i + 1
            startColumn = targetIdx + 1
            endColumn = targetIdx + error.target.length + 1
            break
          }
        }
      } else if (searchStartIndex > 0) {
        startLineNumber = searchStartIndex + 1
        endLineNumber = searchStartIndex + 1
        startColumn = lines[searchStartIndex].length - lines[searchStartIndex].trimStart().length + 1
        endColumn = lines[searchStartIndex].length + 1
      }

      return {
        severity: monacoInstance.MarkerSeverity.Error,
        message: error.message,
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
      }
    })

      monacoInstance.editor.setModelMarkers(model, "yaml-validation", markers)
    }

    applyMarkers()
    
    // Re-apply markers multiple times during initial load to beat any background worker overrides
    const t1 = setTimeout(applyMarkers, 100)
    const t2 = setTimeout(applyMarkers, 500)
    const t3 = setTimeout(applyMarkers, 1000)

    // Re-apply markers whenever text changes, to keep line mappings perfectly in sync
    const contentDisposable = editorRef.current.onDidChangeModelContent(() => {
      applyMarkers()
    })

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      contentDisposable.dispose()
      const model = editorRef.current?.getModel()
      if (model && !model.isDisposed()) {
        monacoInstance.editor.setModelMarkers(model, "yaml-validation", [])
      }
    }
  }, [monacoInstance, validationErrors, editorReady, activeFileId, scrapeConfigs])


  // Sync store → editor when state changes from non-editor sources (e.g. job
  // modal, sort, group operations). Marked programmatic so the resulting
  // onChange does not reschedule a pointless hydrate / dirty bump.
  useEffect(() => {
    if (!hasResolvedFile || !editorRef.current || editorFocusedRef.current) return
    const next = usePrometheusStore.getState().exportYaml()
    const cur = editorRef.current.getValue()
    if (cur !== next) {
      programmaticChangeRef.current = true
      editorRef.current.setValue(next)
      programmaticChangeRef.current = false
      setLineCount(next.split("\n").length)
    }
  }, [hasResolvedFile, config, scrapeConfigs])

  const copyYamlToClipboard = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
    await new Promise<void>((resolve, reject) => {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.setAttribute("readonly", "")
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      try {
        if (!document.execCommand("copy")) reject(new Error("execCommand copy failed"))
        else resolve()
      } catch (e) {
        reject(e)
      } finally {
        document.body.removeChild(ta)
      }
    })
  }

  const handleCopy = async () => {
    const text = editorRef.current?.getValue() ?? exportYaml()
    try {
      await copyYamlToClipboard(text)
      setCopied(true)
      toast.success("Copied YAML to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!resolvedFile) return
    try {
      const yaml = editorRef.current?.getValue() ?? exportYaml()
      const filename = resolvedFile.filename || "prometheus.yml"
      
      const blob = new Blob([yaml], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = filename
      
      document.body.appendChild(a)
      a.click()
      
      // Increase timeout to ensure the browser has enough time to register
      // the download name before the object URL is revoked.
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (err) {
      console.error("Download failed:", err)
      toast.error("Failed to download file")
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">
            {resolvedFile?.filename ?? "No file selected"}
          </span>
          {hasResolvedFile ? (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {lineCount} lines
            </Badge>
          ) : null}
          {isLoadingFile && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          {validationErrors.length > 0 && (
            <Badge variant="destructive" className="mr-1 text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              {validationErrors.length}
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!hasResolvedFile}
                  className="h-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Download YAML</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleCopy()}
                  disabled={!hasResolvedFile}
                  className="h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Copy YAML</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCollapse}
                  className="h-8"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Collapse panel</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="max-h-28 shrink-0 overflow-y-auto border-b border-destructive/20 bg-destructive/10 px-4 py-2">
          <div className="space-y-1 text-xs text-destructive">
            {validationErrors.map((error, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        {!hasResolvedFile ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">
              Select or create YAML file
            </p>
          </div>
        ) : (
          <Editor
            key={`yaml-editor-${activeFileId}`}
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            path={`yaml-${activeFileId}`}
            onMount={handleEditorMount}
            onChange={(value) => {
              if (value === undefined) return
              setLineCount(value.split("\n").length)
              // Programmatic setValue (initial mount, store→editor sync) must
              // not be treated as a user edit — it's already store state.
              if (programmaticChangeRef.current) return
              // Use mountedForFileRef (frozen at mount) not activeFileIdRef
              // (which may already point to a new file during transitions).
              const fileId = mountedForFileRef.current
              scheduleTouch(fileId)
              scheduleApply(value, fileId)
            }}
            options={{
              minimap: { enabled: true },
              fontSize: 12,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: false,
              tabSize: 2,
              fixedOverflowWidgets: true,
            }}
          />
        )}
      </div>
    </div>
  )
}
