"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  File,
  Folder,
  FolderOpen,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FileExplorer() {
  const {
    files,
    activeFileId,
    directoryPath,
    setDirectoryPath,
    setActiveFile,
    deleteFile,
  } = usePrometheusStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempPath, setTempPath] = useState(directoryPath)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSaveSettings = () => {
    setDirectoryPath(tempPath)
    setIsSettingsOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteFile(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Config Files</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Directory Path */}
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
          <Folder className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{directoryPath}</span>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <File className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                No config files loaded
              </p>
              <p className="text-xs text-muted-foreground">
                Import a YAML file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    'group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors',
                    activeFileId === file.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => setActiveFile(file.id)}
                >
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {file.filename}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(file.lastModified)}</span>
                      <span>·</span>
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(file.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add File Button */}
      <div className="border-t border-border p-2">
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Plus className="h-3.5 w-3.5" />
          New Config File
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Directory Settings</DialogTitle>
            <DialogDescription>
              Configure the directory path for Prometheus configuration files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Config Directory Path</label>
              <Input
                value={tempPath}
                onChange={(e) => setTempPath(e.target.value)}
                placeholder="/etc/prometheus"
              />
              <p className="text-xs text-muted-foreground">
                The directory where your Prometheus config files are stored
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Config File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this configuration file? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
