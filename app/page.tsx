"use client"

import { useEffect, useRef, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { PanelLeft, PanelRight, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [configPanelCollapsed, setConfigPanelCollapsed] = useState(false)
  const [yamlPanelCollapsed, setYamlPanelCollapsed] = useState(false)

  // Store previous sizes for restoration
  const [leftPanelSize, setLeftPanelSize] = useState(15)
  const [configPanelSize, setConfigPanelSize] = useState(15)
  const [yamlPanelSize, setYamlPanelSize] = useState(25)

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
          {/* Left Panel - File Explorer */}
          {!leftPanelCollapsed ? (
            <>
              <ResizablePanel
                defaultSize={leftPanelSize}
                minSize={12}
                maxSize={25}
                onResize={(size) => setLeftPanelSize(size)}
              >
                <ConfigErrorBoundary>
                  <FileExplorer
                    onCollapse={() => setLeftPanelCollapsed(true)}
                  />
                </ConfigErrorBoundary>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          ) : (
            <div className="flex flex-col items-center border-r border-border bg-card py-2 w-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setLeftPanelCollapsed(false)}
                title="Expand Files Panel"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="mt-2 flex-1 flex items-center justify-center">
                <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                  Files
                </span>
              </div>
            </div>
          )}

          {/* Config Tree Panel */}
          {!configPanelCollapsed ? (
            <>
              <ResizablePanel
                defaultSize={configPanelSize}
                minSize={12}
                maxSize={25}
                onResize={(size) => setConfigPanelSize(size)}
              >
                <ConfigErrorBoundary>
                  <ConfigTree
                    onCollapse={() => setConfigPanelCollapsed(true)}
                  />
                </ConfigErrorBoundary>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          ) : (
            <div className="flex flex-col items-center border-r border-border bg-card py-2 w-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setConfigPanelCollapsed(false)}
                title="Expand Config Panel"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
              <div className="mt-2 flex-1 flex items-center justify-center">
                <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
                  Config
                </span>
              </div>
            </div>
          )}

          {/* Main Editor Panel - Always visible */}
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

          {/* YAML Preview Panel */}
          {!yamlPanelCollapsed ? (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={yamlPanelSize}
                minSize={20}
                maxSize={40}
                onResize={(size) => setYamlPanelSize(size)}
              >
                <div className="h-full min-h-0">
                  <ConfigErrorBoundary>
                    <YamlPreview
                      onCollapse={() => setYamlPanelCollapsed(true)}
                    />
                  </ConfigErrorBoundary>
                </div>
              </ResizablePanel>
            </>
          ) : (
            <div className="flex flex-col items-center border-l border-border bg-card py-2 w-8">
              <div className="flex-1 flex items-center justify-center">
                <span className="text-xs text-muted-foreground [writing-mode:vertical-lr]">
                  YAML
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mt-auto"
                onClick={() => setYamlPanelCollapsed(false)}
                title="Expand YAML Panel"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  )
}
