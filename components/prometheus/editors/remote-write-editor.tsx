"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { RemoteWriteConfig } from '@/lib/prometheus-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Upload, ExternalLink, Settings } from 'lucide-react'
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

export function RemoteWriteEditor() {
  const { config, addRemoteWrite, updateRemoteWrite, deleteRemoteWrite, activeFileId, files } =
    usePrometheusStore()
  const remoteWrites = config.remote_write || []

  const hasResolvedFile = Boolean(
    activeFileId && files.some((f) => f.id === activeFileId)
  )
  const isDisabled = !hasResolvedFile

  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<RemoteWriteConfig>>({})

  const handleAddOrUpdate = () => {
    if (!formData.url) return

    const newRW: RemoteWriteConfig = {
      url: formData.url,
      name: formData.name,
      remote_timeout: formData.remote_timeout,
      headers: formData.headers,
      basic_auth: formData.basic_auth,
      bearer_token: formData.bearer_token,
      bearer_token_file: formData.bearer_token_file,
      queue_config: formData.queue_config,
    }

    if (editingIndex !== null) {
      updateRemoteWrite(editingIndex, newRW)
    } else {
      addRemoteWrite(newRW)
    }
    resetForm()
  }

  const handleEdit = (index: number) => {
    setFormData(remoteWrites[index])
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
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Remote Write</h2>
            <p className="text-sm text-muted-foreground">
              Send samples to remote storage endpoints
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isDisabled}>
          <Plus className="mr-2 h-4 w-4" />
          Add Remote Write
        </Button>
      </div>

      {remoteWrites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No remote write endpoints configured
            </p>
            <p className="text-sm text-muted-foreground">
              Add a remote write endpoint to send data to external storage
            </p>
            <Button className="mt-4" onClick={() => setIsAdding(true)} disabled={isDisabled}>
              <Plus className="mr-2 h-4 w-4" />
              Add Remote Write
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {remoteWrites.map((rw, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {rw.name || `Remote Write ${index + 1}`}
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
                      onClick={() => deleteRemoteWrite(index)}
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
                    {rw.url}
                  </div>
                </div>
                {rw.remote_timeout && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeout</span>
                    <span className="font-mono">{rw.remote_timeout}</span>
                  </div>
                )}
                {rw.basic_auth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth</span>
                    <span>Basic Auth ({rw.basic_auth.username})</span>
                  </div>
                )}
                {rw.bearer_token_file && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auth</span>
                    <span>Bearer Token</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAdding} onOpenChange={resetForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Remote Write' : 'Add Remote Write'}
            </DialogTitle>
            <DialogDescription>
              Configure a remote write endpoint for sample delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL *</label>
              <Input
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://remote-storage.example.com/api/v1/write"
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
                  placeholder="30s"
                />
              </div>
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

              <AccordionItem value="queue">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Queue Configuration
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Capacity</label>
                      <Input
                        type="number"
                        value={formData.queue_config?.capacity || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            queue_config: {
                              ...formData.queue_config,
                              capacity: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="2500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Shards</label>
                      <Input
                        type="number"
                        value={formData.queue_config?.max_shards || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            queue_config: {
                              ...formData.queue_config,
                              max_shards: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Batch Send Deadline</label>
                      <Input
                        value={formData.queue_config?.batch_send_deadline || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            queue_config: {
                              ...formData.queue_config,
                              batch_send_deadline: e.target.value || undefined,
                            },
                          })
                        }
                        placeholder="5s"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Samples Per Send</label>
                      <Input
                        type="number"
                        value={formData.queue_config?.max_samples_per_send || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            queue_config: {
                              ...formData.queue_config,
                              max_samples_per_send: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        placeholder="500"
                      />
                    </div>
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
