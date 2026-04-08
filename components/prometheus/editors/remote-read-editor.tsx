"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { RemoteReadConfig } from '@/lib/prometheus-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Download, ExternalLink, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export function RemoteReadEditor() {
  const { config, addRemoteRead, updateRemoteRead, deleteRemoteRead, activeFileId, files } =
    usePrometheusStore()
  const remoteReads = config.remote_read || []

  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const isDisabled = !hasResolvedFile

  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<RemoteReadConfig>>({})

  const handleAddOrUpdate = () => {
    if (!formData.url) return

    const newRR: RemoteReadConfig = {
      url: formData.url,
      name: formData.name,
      remote_timeout: formData.remote_timeout,
      read_recent: formData.read_recent,
      required_matchers: formData.required_matchers,
      basic_auth: formData.basic_auth,
      bearer_token: formData.bearer_token,
      bearer_token_file: formData.bearer_token_file,
    }

    if (editingIndex !== null) {
      updateRemoteRead(editingIndex, newRR)
    } else {
      addRemoteRead(newRR)
    }
    resetForm()
  }

  const handleEdit = (index: number) => {
    setFormData(remoteReads[index])
    setEditingIndex(index)
    setIsAdding(true)
  }

  const resetForm = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setFormData({})
  }

  return (
    <div className={cn("space-y-6 p-6", isDisabled && "pointer-events-none opacity-50")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Remote Read</h2>
            <p className="text-sm text-muted-foreground">
              Query samples from remote storage endpoints
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isDisabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Remote Read
        </Button>
      </div>

      {remoteReads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No remote read endpoints configured
            </p>
            <p className="text-sm text-muted-foreground">
              Add a remote read endpoint to query external storage
            </p>
            <Button className="mt-4" onClick={() => setIsAdding(true)} disabled={isDisabled}>
              <Plus className="mr-2 h-4 w-4" />
              Add Remote Read
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {remoteReads.map((rr, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {rr.name || `Remote Read ${index + 1}`}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      disabled={isDisabled}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRemoteRead(index)}
                      disabled={isDisabled}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">URL</span>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1 break-all">
                    {rr.url}
                  </div>
                </div>
                {rr.remote_timeout && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeout</span>
                    <span className="font-mono">{rr.remote_timeout}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Read Recent</span>
                  <span>{rr.read_recent ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAdding} onOpenChange={resetForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Remote Read' : 'Add Remote Read'}
            </DialogTitle>
            <DialogDescription>
              Configure a remote read endpoint for querying external storage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL *</label>
              <Input
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://remote-storage.example.com/api/v1/read"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value || undefined })
                  }
                  placeholder="my-remote-storage"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout</label>
                <Input
                  value={formData.remote_timeout || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, remote_timeout: e.target.value || undefined })
                  }
                  placeholder="1m"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <label className="text-sm font-medium">Read Recent</label>
                <p className="text-xs text-muted-foreground">
                  Also query local storage for recent data
                </p>
              </div>
              <Switch
                checked={formData.read_recent || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, read_recent: checked })
                }
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="auth">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Authentication
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Basic Auth Username</label>
                      <Input
                        value={formData.basic_auth?.username || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basic_auth: e.target.value
                              ? { ...formData.basic_auth, username: e.target.value }
                              : undefined,
                          })
                        }
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={formData.basic_auth?.password || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basic_auth: formData.basic_auth
                              ? { ...formData.basic_auth, password: e.target.value || undefined }
                              : undefined,
                          })
                        }
                        placeholder="password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bearer Token File</label>
                    <Input
                      value={formData.bearer_token_file || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bearer_token_file: e.target.value || undefined,
                        })
                      }
                      placeholder="/path/to/token"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate} disabled={!formData.url}>
              {editingIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
