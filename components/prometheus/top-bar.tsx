"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { VersionHistory } from './version-history'
import { ConfigStats } from './config-stats'
import {
  Upload,
  Download,
  Save,
  RefreshCw,
  Wand2,
  ChevronDown,
  AlertCircle,
  Check,
  Settings,
} from 'lucide-react'

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    importYaml,
    exportYaml,
    sortTargetsInJobs,
    normalizeFormatting,
    validateConfig,
    validationErrors,
    scrapeConfigs,
    config,
    files,
    activeFileId,
  } = usePrometheusStore()

  const [importErrors, setImportErrors] = useState<{ type: string; message: string }[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [reloadStatus, setReloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const result = importYaml(content, file.name)
        if (!result.success || result.errors.length > 0) {
          setImportErrors(result.errors)
          setShowErrors(true)
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ''
  }

  const handleExport = () => {
    const yaml = exportYaml()
    const activeFile = files.find((f) => f.id === activeFileId)
    const filename = activeFile?.filename || 'prometheus.yml'
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReloadPrometheus = async () => {
    setReloadStatus('loading')
    // Simulated reload - in production this would call the Prometheus API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReloadStatus('success')
    setTimeout(() => setReloadStatus('idle'), 2000)
  }

  const hasContent = scrapeConfigs.length > 0 || config.global || config.rule_files?.length

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
      {/* Left side - Logo/Title */}
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

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".yml,.yaml"
          className="hidden"
        />

        {validationErrors.length > 0 && (
          <Badge variant="destructive" className="mr-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.length} issues
          </Badge>
        )}

        <ConfigStats />
        <VersionHistory />

        <div className="h-6 w-px bg-border mx-1" />

        <Button variant="outline" size="sm" onClick={handleImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport} disabled={!hasContent}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Wand2 className="h-4 w-4 mr-2" />
              Tools
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={sortTargetsInJobs}>
              Sort targets in all jobs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={normalizeFormatting}>
              Normalize formatting
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => validateConfig()}>
              Validate configuration
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleReloadPrometheus}
          disabled={reloadStatus === 'loading'}
        >
          {reloadStatus === 'loading' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : reloadStatus === 'success' ? (
            <Check className="h-4 w-4 mr-2 text-success" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {reloadStatus === 'success' ? 'Reloaded' : 'Reload'}
        </Button>

        <Button size="sm" disabled={!hasContent}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Import Errors Dialog */}
      <Dialog open={showErrors} onOpenChange={setShowErrors}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Import Issues
            </DialogTitle>
            <DialogDescription>
              The following issues were found while importing the configuration:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {importErrors.map((error, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm"
              >
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>{error.message}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrors(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
