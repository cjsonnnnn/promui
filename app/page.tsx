"use client"

import { usePrometheusStore } from '@/lib/prometheus-store'
import { FileExplorer } from '@/components/prometheus/file-explorer'
import { ConfigTree } from '@/components/prometheus/config-tree'
import { TopBar } from '@/components/prometheus/top-bar'
import { YamlPreview } from '@/components/prometheus/yaml-preview'
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
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File Explorer */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
          <FileExplorer />
        </ResizablePanel>
        
        <ResizableHandle withHandle />

        {/* Config Tree */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
          <ConfigTree />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Editor */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <div className="h-full overflow-auto bg-background">
            <ConfigEditor />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* YAML Preview */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <YamlPreview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
