"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import type * as monaco from "monaco-editor"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, AlertCircle, FileCode, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

function useDebouncedCallback<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const f = useRef(fn)
  f.current = fn
  return useCallback(
    (...args: Parameters<T>) => {
      if (t.current) clearTimeout(t.current)
      t.current = setTimeout(() => f.current(...args), ms)
    },
    [ms]
  ) as T
}

export function YamlPreview() {
  const {
    exportYaml,
    validateConfig,
    validationErrors,
    activeFileId,
    files,
    hydrateFromYaml,
    config,
    scrapeConfigs,
    isLoadingFile,
    setFlushEditorYamlToStore,
  } = usePrometheusStore()

  const resolvedFile =
    activeFileId && files.some((f) => f.id === activeFileId)
      ? files.find((f) => f.id === activeFileId)
      : undefined
  const hasResolvedFile = Boolean(resolvedFile)

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const editorFocusedRef = useRef(false)
  const [copied, setCopied] = useState(false)
  const [lineCount, setLineCount] = useState(1)

  const debouncedApply = useDebouncedCallback((value: string) => {
    hydrateFromYaml(value)
  }, 400)

  const debouncedTouch = useDebouncedCallback(() => {
    usePrometheusStore.getState().touchYamlFromEditor()
  }, 200)

  const flushYaml = (value: string) => {
    hydrateFromYaml(value)
  }

  useEffect(() => {
    setFlushEditorYamlToStore(() => {
      const ed = editorRef.current
      if (ed) usePrometheusStore.getState().hydrateFromYaml(ed.getValue())
    })
    return () => setFlushEditorYamlToStore(null)
  }, [setFlushEditorYamlToStore])

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    editor.onDidFocusEditorWidget(() => {
      editorFocusedRef.current = true
    })
    editor.onDidBlurEditorWidget(() => {
      editorFocusedRef.current = false
      flushYaml(editor.getValue())
    })
    const initial = exportYaml()
    editor.setValue(initial)
    setLineCount(initial.split("\n").length)
  }

  useEffect(() => {
    if (!hasResolvedFile) {
      usePrometheusStore.setState({ validationErrors: [] })
      return
    }
    validateConfig()
  }, [hasResolvedFile, scrapeConfigs, config, validateConfig])

  useEffect(() => {
    if (!hasResolvedFile || !editorRef.current || editorFocusedRef.current) return
    const next = exportYaml()
    const cur = editorRef.current.getValue()
    if (cur !== next) {
      editorRef.current.setValue(next)
      setLineCount(next.split("\n").length)
    }
  }, [hasResolvedFile, config, scrapeConfigs, exportYaml])

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

  const handleDownload = () => {
    if (!resolvedFile) return
    const yaml = editorRef.current?.getValue() ?? exportYaml()
    const filename = resolvedFile.filename
    const blob = new Blob([yaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                  size="sm"
                  onClick={() => void handleCopy()}
                  disabled={!hasResolvedFile}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="mr-1 h-4 w-4" />
                  ) : (
                    <Copy className="mr-1 h-4 w-4" />
                  )}
                  Copy
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Copy YAML</TooltipContent>
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
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            path={`yaml-${activeFileId}`}
            onMount={handleEditorMount}
            onChange={(value) => {
              if (value !== undefined) {
                setLineCount(value.split("\n").length)
                debouncedTouch()
                debouncedApply(value)
              }
            }}
            options={{
              minimap: { enabled: true },
              fontSize: 12,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  )
}
