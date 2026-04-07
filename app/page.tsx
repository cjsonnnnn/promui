"use client"

import { useEffect, useRef } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { FileExplorer } from '@/components/prometheus/file-explorer'
import { ConfigTree } from '@/components/prometheus/config-tree'
import { TopBar } from '@/components/prometheus/top-bar'
import { EditorToolbar } from '@/components/prometheus/editor-toolbar'
import { YamlPreview } from '@/components/prometheus/yaml-preview'
import { ConfigErrorBoundary } from '@/components/prometheus/config-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalEditor } from '@/components/prometheus/editors/global-editor'
import { ScrapeConfigsEditor } from '@/components/prometheus/editors/scrape-configs-editor'
import { RuleFilesEditor } from '@/components/prometheus/editors/rule-files-editor'
import { AlertingEditor } from '@/components/prometheus/editors/alerting-editor'
import { RemoteWriteEditor } from '@/components/prometheus/editors/remote-write-editor'
import { RemoteReadEditor } from '@/components/prometheus/editors/remote-read-editor'
import { StorageEditor } from '@/components/prometheus/editors/storage-editor'
import { TracingEditor } from '@/components/prometheus/editors/tracing-editor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

function ConfigEditor() {
  const { activeSection } = usePrometheusStore()

  switch (activeSection) {
    case 'global':
      return <GlobalEditor />
    case 'scrape_configs':
      return <ScrapeConfigsEditor />
    case 'rule_files':
      return <RuleFilesEditor />
    case 'alerting':
      return <AlertingEditor />
    case 'remote_write':
      return <RemoteWriteEditor />
    case 'remote_read':
      return <RemoteReadEditor />
    case 'storage':
      return <StorageEditor />
    case 'tracing':
      return <TracingEditor />
    default:
      return <ScrapeConfigsEditor />
  }
}

export default function PrometheusConfigEditor() {
  const { refreshFiles, refreshConfigInfo, setActiveFile, undo, redo } = usePrometheusStore()
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    const bootstrap = async () => {
      try {
        await refreshConfigInfo()
        await refreshFiles()
        const nextFiles = usePrometheusStore.getState().files
        if (nextFiles.length > 0) {
          await setActiveFile(nextFiles[0].id)
        }
      } catch {
        await refreshFiles().catch(() => {})
      }
    }
    void bootstrap()
  }, [refreshFiles, refreshConfigInfo, setActiveFile])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      usePrometheusStore.getState().flushEditorYamlToStore?.()
      if (usePrometheusStore.getState().hasUnsavedYamlChanges()) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />

        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
            <ConfigErrorBoundary>
              <FileExplorer />
            </ConfigErrorBoundary>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
            <ConfigErrorBoundary>
              <ConfigTree />
            </ConfigErrorBoundary>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={45} minSize={30}>
            <ConfigErrorBoundary>
              <div className="flex h-full min-h-0 flex-col bg-background">
                <EditorToolbar />
                <div className="min-h-0 flex-1 overflow-auto">
                  <ConfigErrorBoundary>
                    <ConfigEditor />
                  </ConfigErrorBoundary>
                </div>
              </div>
            </ConfigErrorBoundary>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full min-h-0">
              <ConfigErrorBoundary>
                <YamlPreview />
              </ConfigErrorBoundary>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  )
}
