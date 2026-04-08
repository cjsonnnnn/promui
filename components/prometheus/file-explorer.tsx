"use client"

import { useRef, useState } from "react"
import { usePrometheusStore } from "@/lib/prometheus-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  File,
  FolderOpen,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Pencil,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import YAML from "yaml"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const defaultConfig = {
  global: {
    scrape_interval: "15s",
    evaluation_interval: "15s",
  },
  scrape_configs: [] as unknown[],
  rule_files: [] as unknown[],
}

type ConflictState =
  | {
      kind: "new"
      filename: string
    }
  | {
      kind: "upload"
      filename: string
      yaml: string
    }
  | null

export function FileExplorer() {
  const {
    files,
    activeFileId,
    configDirectoryDisplay,
    refreshFiles,
    setActiveFile,
    deleteFile,
    createNewFile,
    uploadYamlFile,
    renameFile,
    saveYamlToDisk,
    ensureInitialHistorySnapshot,
    flushEditorYamlToStore,
    discardUnsavedChanges,
    hasUnsavedYamlChanges,
  } = usePrometheusStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isNewFileOpen, setIsNewFileOpen] = useState(false)
  const [newFilename, setNewFilename] = useState("")
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [conflict, setConflict] = useState<ConflictState>(null)
  const [conflictRename, setConflictRename] = useState("")
  const [conflictError, setConflictError] = useState("")
  const [refreshSpin, setRefreshSpin] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const pendingAfterUnsavedRef = useRef<(() => Promise<void>) | null>(null)

  const runWithUnsavedCheck = async (action: () => Promise<void>) => {
    flushEditorYamlToStore?.()
    if (!hasUnsavedYamlChanges()) {
      await action()
      return
    }
    pendingAfterUnsavedRef.current = action
    setUnsavedDialogOpen(true)
  }

  const handleRefresh = async () => {
    setRefreshSpin(true)
    try {
      await refreshFiles()
    } finally {
      window.setTimeout(() => setRefreshSpin(false), 1000)
    }
  }

  const tryCreate = async () => {
    const name = newFilename.trim()
    if (!name) {
      setErrorMessage("Filename is required")
      return
    }
    if (!/\.(yml|yaml)$/i.test(name)) {
      setErrorMessage("Filename must end with .yml or .yaml")
      return
    }
    const result = await createNewFile(name)
    if (result.conflict) {
      setConflict({ kind: "new", filename: name })
      setConflictRename(name.replace(/\.ya?ml$/i, "") + "-copy.yml")
      setConflictError("")
      setErrorMessage("")
      return
    }
    if (!result.success) {
      setErrorMessage(result.error || "Failed to create file")
      return
    }
    setErrorMessage("")
    setIsNewFileOpen(false)
    setNewFilename("")
  }

  const tryUpload = async (file: File, content: string) => {
    if (!/\.(yml|yaml)$/i.test(file.name)) {
      setErrorMessage("Filename must end with .yml or .yaml")
      return
    }
    const result = await uploadYamlFile(file.name, content)
    if (result.conflict) {
      setConflict({ kind: "upload", filename: file.name, yaml: content })
      setConflictRename(
        file.name.replace(/\.ya?ml$/i, "") + "-copy.yml"
      )
      setConflictError("")
      setErrorMessage("")
      return
    }
    if (!result.success) {
      setErrorMessage(result.error || "Failed to upload file")
      return
    }
    setErrorMessage("")
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    const input = e.target
    await tryUpload(file, content)
    input.value = ""
  }

  const handleDelete = async (id: string) => {
    const result = await deleteFile(id)
    if (!result.success) {
      setErrorMessage(result.error || "Failed to delete file")
    }
    setDeleteConfirm(null)
  }

  const handleRename = async () => {
    if (!renameTarget) return
    const result = await renameFile(renameTarget, renameValue.trim())
    if (!result.success) {
      setErrorMessage(result.error || "Failed to rename file")
      return
    }
    setErrorMessage("")
    setRenameTarget(null)
    setRenameValue("")
  }

  const handleConflictRename = async () => {
    if (!conflict) return
    const next = conflictRename.trim()
    if (!next || !/\.(yml|yaml)$/i.test(next)) {
      setConflictError("Filename must end with .yml or .yaml")
      return
    }
    if (next === conflict.filename) {
      setConflictError("Choose a different filename")
      return
    }
    const exists = usePrometheusStore.getState().files.some((f) => f.filename === next)
    if (exists) {
      setConflictError("That filename also exists")
      return
    }
    if (conflict.kind === "new") {
      const yaml = YAML.stringify(defaultConfig, { indent: 2 })
      const saved = await saveYamlToDisk(next, yaml)
      if (!saved.success) {
        setConflictError(saved.error || "Failed to create file")
        return
      }
    } else {
      const saved = await saveYamlToDisk(next, conflict.yaml)
      if (!saved.success) {
        setConflictError(saved.error || "Failed to save upload")
        return
      }
    }
    setConflict(null)
    setIsNewFileOpen(false)
    setNewFilename("")
    setConflictError("")
    setErrorMessage("")
    await refreshFiles()
    await setActiveFile(next)
    await ensureInitialHistorySnapshot(next)
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Config Files</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleRefresh()}>
                <RefreshCw className={cn("h-3.5 w-3.5", refreshSpin && "refresh-spin-once")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh config files list</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload YAML file</TooltipContent>
          </Tooltip>
          <input ref={fileInputRef} type="file" accept=".yml,.yaml" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">Config Directory</span>
        <Badge variant="outline" className="w-fit max-w-full truncate font-mono text-xs font-normal">
          {configDirectoryDisplay}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <File className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">No config files loaded</p>
              <p className="text-xs text-muted-foreground">Create or upload a YAML file</p>
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors",
                    activeFileId === file.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() =>
                    void runWithUnsavedCheck(async () => {
                      await setActiveFile(file.id)
                    })
                  }
                >
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file.filename}</div>
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
                      void runWithUnsavedCheck(async () => {
                        setRenameTarget(file.id)
                        setRenameValue(file.filename)
                      })
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      void runWithUnsavedCheck(async () => {
                        setDeleteConfirm(file.id)
                      })
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

      {errorMessage && <div className="px-3 py-1 text-xs text-destructive">{errorMessage}</div>}

      <div className="border-t border-border p-2 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => setIsNewFileOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          New File
        </Button>
      </div>

      <Dialog
        open={unsavedDialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            pendingAfterUnsavedRef.current = null
            setUnsavedDialogOpen(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Discard and continue, or stay on this file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-end gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                pendingAfterUnsavedRef.current = null
                setUnsavedDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const next = pendingAfterUnsavedRef.current
                pendingAfterUnsavedRef.current = null
                setUnsavedDialogOpen(false)
                if (!next) return
                discardUnsavedChanges()
                void next()
              }}
            >
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFileOpen} onOpenChange={setIsNewFileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New YAML File</DialogTitle>
            <DialogDescription>Enter a filename with `.yml` or `.yaml`.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={newFilename} onChange={(e) => setNewFilename(e.target.value)} placeholder="prometheus.yml" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void tryCreate()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!conflict}
        onOpenChange={(o) => {
          if (!o) {
            setConflict(null)
            setConflictError("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File already exists</DialogTitle>
            <DialogDescription>
              <span className="font-mono">{conflict?.filename}</span> is already present. Enter a new filename or cancel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-muted-foreground">New filename</label>
            <Input value={conflictRename} onChange={(e) => setConflictRename(e.target.value)} placeholder="my-config.yml" />
            {conflictError && <p className="text-xs text-destructive">{conflictError}</p>}
          </div>
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setConflict(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => void handleConflictRename()}>
              Rename file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleRename()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Config File</DialogTitle>
            <DialogDescription>
              Are you sure? This removes the file and its local version history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && void handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
