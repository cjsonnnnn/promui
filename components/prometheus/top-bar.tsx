"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Save,
  RefreshCw,
  AlertCircle,
  Settings,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export function TopBar() {
  const {
    validateConfig,
    validationErrors,
    saveActiveFile,
    exportYaml,
    originalYaml,
    activeFileId,
    refreshFiles,
  } = usePrometheusStore()

  const [reloadStatus, setReloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reloadMessage, setReloadMessage] = useState('')
  const [showSaveDiff, setShowSaveDiff] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleReloadPrometheus = async () => {
    setReloadStatus('loading')
    setReloadMessage('')
    try {
      const response = await fetch('/api/prometheus/reload', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Reload failed')
      setReloadStatus('success')
      setReloadMessage('Prometheus reload request sent successfully')
    } catch (error) {
      setReloadStatus('error')
      setReloadMessage((error as Error).message)
    } finally {
      setTimeout(() => setReloadStatus('idle'), 2500)
    }
  }

  const handleSaveConfirm = async () => {
    const result = await saveActiveFile()
    if (!result.success) {
      setSaveError(result.error || 'Save failed')
      return
    }
    setSaveError('')
    setShowSaveDiff(false)
    await refreshFiles()
  }

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
        {validationErrors.length > 0 && (
          <Badge variant="destructive" className="mr-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.length} issues
          </Badge>
        )}

        <ConfigStats />
        <VersionHistory />

        <div className="h-6 w-px bg-border mx-1" />

        <Button variant="outline" size="sm" onClick={() => validateConfig()}>
          Validate
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleReloadPrometheus}
          disabled={reloadStatus === 'loading'}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${reloadStatus === 'loading' ? 'animate-spin' : ''}`} />
          Reload
        </Button>

        <Button size="sm" disabled={!activeFileId} onClick={() => setShowSaveDiff(true)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        {reloadMessage && (
          <span className={reloadStatus === 'error' ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
            {reloadMessage}
          </span>
        )}
      </div>

      <Dialog open={showSaveDiff} onOpenChange={setShowSaveDiff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Save Changes
            </DialogTitle>
            <DialogDescription>
              Confirm save by reviewing the YAML diff preview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Before YAML</p>
              <Textarea value={originalYaml} readOnly className="h-40 font-mono text-xs" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">After YAML</p>
              <Textarea value={exportYaml()} readOnly className="h-40 font-mono text-xs" />
            </div>
            {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDiff(false)}>Cancel</Button>
            <Button onClick={handleSaveConfirm}>Confirm Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
