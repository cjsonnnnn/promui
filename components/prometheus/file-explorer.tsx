"use client"

import { useMemo, useRef, useState } from "react"
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
  PanelLeftClose,
  Copy,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface FileExplorerProps {
  onCollapse?: () => void
}

/** Trim and append `.yml` when no extension was supplied. Empty input → ''. */
function normalizeFilename(raw: string): string {
  const t = raw.trim()
  if (!t) return ""
  if (/\.(yml|yaml)$/i.test(t)) return t
  return `${t}.yml`
}

function describeFilenameError(raw: string): string {
  const t = raw.trim()
  if (!t) return "Filename is required"
  if (t.includes("/") || t.includes("\\")) return "Filename must not contain slashes"
  const normalized = normalizeFilename(t)
  if (normalized === ".yml" || normalized === ".yaml") return "Filename is required"
  return ""
}

export function FileExplorer({ onCollapse }: FileExplorerProps) {
  const files = usePrometheusStore((s) => s.files)
  const activeFileId = usePrometheusStore((s) => s.activeFileId)
  const configDirectoryDisplay = usePrometheusStore((s) => s.configDirectoryDisplay)

  const refreshFiles = usePrometheusStore((s) => s.refreshFiles)
  const setActiveFile = usePrometheusStore((s) => s.setActiveFile)
  const deleteFile = usePrometheusStore((s) => s.deleteFile)
  const createNewFile = usePrometheusStore((s) => s.createNewFile)
  const uploadYamlFile = usePrometheusStore((s) => s.uploadYamlFile)
  const renameFile = usePrometheusStore((s) => s.renameFile)
  const duplicateFile = usePrometheusStore((s) => s.duplicateFile)
  const saveYamlToDisk = usePrometheusStore((s) => s.saveYamlToDisk)
  const ensureInitialHistorySnapshot = usePrometheusStore(
    (s) => s.ensureInitialHistorySnapshot
  )
  const flushEditorYamlToStore = usePrometheusStore((s) => s.flushEditorYamlToStore)
  const discardUnsavedChanges = usePrometheusStore((s) => s.discardUnsavedChanges)
  const hasUnsavedYamlChanges = usePrometheusStore((s) => s.hasUnsavedYamlChanges)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isNewFileOpen, setIsNewFileOpen] = useState(false)
  const [newFilename, setNewFilename] = useState("")
  const [renameTarget, setRenameTarget] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [duplicateTarget, setDuplicateTarget] = useState<string | null>(null)
  const [duplicateValue, setDuplicateValue] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [conflict, setConflict] = useState<ConflictState>(null)
  const [conflictRename, setConflictRename] = useState("")
  const [conflictError, setConflictError] = useState("")
  const [renameError, setRenameError] = useState("")
  const [refreshSpin, setRefreshSpin] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const pendingAfterUnsavedRef = useRef<(() => Promise<void>) | null>(null)

  const newFilenamePreview = useMemo(() => normalizeFilename(newFilename), [newFilename])
  const renamePreview = useMemo(() => normalizeFilename(renameValue), [renameValue])
  const duplicatePreview = useMemo(() => normalizeFilename(duplicateValue), [duplicateValue])

  const runWithUnsavedCheck = (action: () => void | Promise<void>) => {
    flushEditorYamlToStore?.()
    if (!hasUnsavedYamlChanges()) {
      const res = action()
      if (res instanceof Promise) {
        res.catch(console.error)
      }
      return
    }
    pendingAfterUnsavedRef.current = async () => { await action() }
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
    const validationError = describeFilenameError(newFilename)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }
    const name = normalizeFilename(newFilename)
    try {
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
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create file")
    }
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
    const validationError = describeFilenameError(renameValue)
    if (validationError) {
      setRenameError(validationError)
      return
    }
    const result = await renameFile(renameTarget, normalizeFilename(renameValue))
    if (!result.success) {
      setRenameError(result.error || "Failed to rename file")
      return
    }
    setRenameError("")
    setRenameTarget(null)
    setRenameValue("")
  }

  const handleDuplicate = async () => {
    if (!duplicateTarget) return
    const validationError = describeFilenameError(duplicateValue)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }
    const result = await duplicateFile(
      duplicateTarget,
      normalizeFilename(duplicateValue)
    )
    if (!result.success) {
      setErrorMessage(result.error || "Failed to duplicate file")
      return
    }
    setErrorMessage("")
    setDuplicateTarget(null)
    setDuplicateValue("")
  }

  const handleConflictRename = async () => {
    if (!conflict) return
    const validationError = describeFilenameError(conflictRename)
    if (validationError) {
      setConflictError(validationError)
      return
    }
    const next = normalizeFilename(conflictRename)
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
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCollapse}>
                <PanelLeftClose className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse panel</TooltipContent>
          </Tooltip>
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
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                runWithUnsavedCheck(() => {
                  fileInputRef.current?.click()
                })
              }}>
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

      <ScrollArea className="min-h-0 flex-1">
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
                  data-testid="file-item"
                  data-filename={file.filename}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          void runWithUnsavedCheck(async () => {
                            setDuplicateTarget(file.id)
                            // Suggest a copy name
                            const base = file.filename.replace(/\.ya?ml$/i, '')
                            let suggestion = `${base}-copy.yaml`
                            let counter = 1
                            while (usePrometheusStore.getState().files.some((f) => f.filename === suggestion)) {
                              suggestion = `${base}-copy-${counter}.yaml`
                              counter++
                            }
                            setDuplicateValue(suggestion)
                          })
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          void runWithUnsavedCheck(async () => {
                            setRenameTarget(file.id)
                            setRenameValue(file.filename)
                          })
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          void runWithUnsavedCheck(async () => {
                            setDeleteConfirm(file.id)
                          })
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          data-testid="new-file-btn"
          onClick={() => {
            runWithUnsavedCheck(() => {
              setNewFilename("")
              setErrorMessage("")
              setIsNewFileOpen(true)
            })
          }}
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
              data-testid="keep-changes-btn"
              onClick={() => {
                pendingAfterUnsavedRef.current = null
                setUnsavedDialogOpen(false)
              }}
            >
              Keep
            </Button>
            <Button
              variant="secondary"
              data-testid="discard-changes-btn"
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

      <Dialog
        open={isNewFileOpen}
        onOpenChange={(open) => {
          setIsNewFileOpen(open)
          if (!open) {
            setNewFilename("")
            setErrorMessage("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New YAML File</DialogTitle>
            <DialogDescription>
              Enter a name. The <span className="font-mono">.yml</span> extension is added automatically if you omit it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Input
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              placeholder="prometheus"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void tryCreate()
              }}
            />
            {newFilename.trim() && newFilenamePreview && (
              <p className="text-xs text-muted-foreground">
                Will be saved as <span className="font-mono">{newFilenamePreview}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" data-testid="create-file-cancel-btn" onClick={() => setIsNewFileOpen(false)}>
              Cancel
            </Button>
            <Button data-testid="create-file-confirm-btn" onClick={() => void tryCreate()}>Create</Button>
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
            <Input value={conflictRename} onChange={(e) => setConflictRename(e.target.value)} placeholder="my-config" />
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

      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null)
            setRenameValue("")
            setRenameError("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleRename()
              }}
            />
            {renameValue.trim() && renamePreview && renamePreview !== renameValue.trim() && (
              <p className="text-xs text-muted-foreground">
                Will be saved as <span className="font-mono">{renamePreview}</span>
              </p>
            )}
            {renameError && <p className="text-xs text-destructive">{renameError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" data-testid="rename-cancel-btn" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button data-testid="rename-confirm-btn" onClick={() => void handleRename()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!duplicateTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDuplicateTarget(null)
            setDuplicateValue("")
            setErrorMessage("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate File</DialogTitle>
            <DialogDescription>
              Create a copy of this file with a new name. Version history will not be copied.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Input
              value={duplicateValue}
              onChange={(e) => setDuplicateValue(e.target.value)}
              placeholder="new-filename"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleDuplicate()
              }}
            />
            {duplicateValue.trim() && duplicatePreview && duplicatePreview !== duplicateValue.trim() && (
              <p className="text-xs text-muted-foreground">
                Will be saved as <span className="font-mono">{duplicatePreview}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateTarget(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleDuplicate()}>Duplicate</Button>
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
            <Button variant="outline" data-testid="delete-cancel-btn" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" data-testid="delete-confirm-btn" onClick={() => deleteConfirm && void handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
