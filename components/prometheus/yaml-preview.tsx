"use client"

import { useEffect, useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, AlertCircle, FileCode, Download } from 'lucide-react'

export function YamlPreview() {
  const { exportYaml, validateConfig, validationErrors, scrapeConfigs, config, files, activeFileId } =
    usePrometheusStore()
  const [yaml, setYaml] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setYaml(exportYaml())
    validateConfig()
  }, [scrapeConfigs, config, exportYaml, validateConfig])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const activeFile = files.find((f) => f.id === activeFileId)
    const filename = activeFile?.filename || 'prometheus.yml'
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const highlightYaml = (yaml: string): React.ReactNode[] => {
    const lines = yaml.split('\n')
    return lines.map((line, i) => {
      let highlighted = line

      // Section headers (top-level keys)
      if (/^[a-z_]+:/.test(line)) {
        highlighted = highlighted.replace(
          /^([a-z_]+):/gi,
          '<span class="text-chart-1 font-medium">$1</span>:'
        )
      } else {
        // Nested keys
        highlighted = highlighted.replace(
          /^(\s+)([a-z_]+):/gi,
          '$1<span class="text-chart-2">$2</span>:'
        )

        // String values (after colon)
        highlighted = highlighted.replace(
          /: (.+)$/,
          ': <span class="text-foreground/80">$1</span>'
        )

        // Array items
        highlighted = highlighted.replace(
          /^(\s*)- (.+)$/,
          '$1<span class="text-muted-foreground">-</span> <span class="text-foreground/80">$2</span>'
        )
      }

      return (
        <div key={i} className="leading-6 hover:bg-muted/30 px-2 -mx-2 rounded">
          <span className="text-muted-foreground/50 select-none mr-4 inline-block w-8 text-right text-xs">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      )
    })
  }

  const hasActiveFile = !!activeFileId

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {files.find((f) => f.id === activeFileId)?.filename || 'prometheus.yml'}
          </span>
          <Badge variant="secondary" className="text-xs">
            {yaml.split('\n').length} lines
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {validationErrors.length > 0 && (
            <Badge variant="destructive" className="text-xs mr-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!hasActiveFile}
            className="h-8"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!hasActiveFile}
            className="h-8"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <div className="text-xs text-destructive space-y-1">
            {validationErrors.slice(0, 5).map((error, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{error.message}</span>
              </div>
            ))}
            {validationErrors.length > 5 && (
              <div className="text-xs text-destructive/70 pl-5">
                +{validationErrors.length - 5} more issues...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="p-4 min-h-full">
          {!hasActiveFile ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileCode className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground text-sm">
                Select or create a YAML file to preview configuration
              </p>
            </div>
          ) : (
            <pre className="font-mono text-xs">
              <code>{highlightYaml(yaml)}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
