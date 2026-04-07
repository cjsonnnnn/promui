"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { AlertmanagerConfig, AlertingConfig } from '@/lib/prometheus-types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Bell, Server } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AlertingEditor() {
  const { config, updateAlerting } = usePrometheusStore()
  const alerting = config.alerting || { alertmanagers: [] }

  const [isAddingAM, setIsAddingAM] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<AlertmanagerConfig>>({})

  const handleAddOrUpdate = () => {
    const newAM: AlertmanagerConfig = {
      static_configs: formData.static_configs || [{ targets: [] }],
      scheme: formData.scheme || 'http',
      path_prefix: formData.path_prefix,
      timeout: formData.timeout,
      api_version: formData.api_version || 'v2',
    }

    const newAlertmanagers = [...(alerting.alertmanagers || [])]
    
    if (editingIndex !== null) {
      newAlertmanagers[editingIndex] = newAM
    } else {
      newAlertmanagers.push(newAM)
    }

    updateAlerting({ ...alerting, alertmanagers: newAlertmanagers })
    resetForm()
  }

  const handleDelete = (index: number) => {
    const newAlertmanagers = (alerting.alertmanagers || []).filter((_, i) => i !== index)
    updateAlerting({ ...alerting, alertmanagers: newAlertmanagers })
  }

  const handleEdit = (index: number) => {
    const am = alerting.alertmanagers?.[index]
    if (am) {
      setFormData(am)
      setEditingIndex(index)
      setIsAddingAM(true)
    }
  }

  const resetForm = () => {
    setIsAddingAM(false)
    setEditingIndex(null)
    setFormData({})
  }

  const getTargets = (am: AlertmanagerConfig): string[] => {
    return am.static_configs?.flatMap((sc) => sc.targets) || []
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Alerting Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure Alertmanager endpoints for alert delivery
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddingAM(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Alertmanager
        </Button>
      </div>

      {(!alerting.alertmanagers || alerting.alertmanagers.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No Alertmanager instances configured
            </p>
            <p className="text-sm text-muted-foreground">
              Add an Alertmanager to start receiving alerts
            </p>
            <Button className="mt-4" onClick={() => setIsAddingAM(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Alertmanager
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerting.alertmanagers?.map((am, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Alertmanager {index + 1}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheme</span>
                  <span className="font-mono">{am.scheme || 'http'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Version</span>
                  <span className="font-mono">{am.api_version || 'v2'}</span>
                </div>
                {am.timeout && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeout</span>
                    <span className="font-mono">{am.timeout}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground text-xs">Targets</span>
                  <div className="mt-1 space-y-1">
                    {getTargets(am).map((target, i) => (
                      <div key={i} className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {target}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddingAM} onOpenChange={resetForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit Alertmanager' : 'Add Alertmanager'}
            </DialogTitle>
            <DialogDescription>
              Configure an Alertmanager endpoint for alert delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Targets</label>
              <Input
                value={formData.static_configs?.[0]?.targets.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    static_configs: [
                      {
                        targets: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      },
                    ],
                  })
                }
                placeholder="alertmanager:9093, alertmanager2:9093"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of Alertmanager addresses
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scheme</label>
                <Select
                  value={formData.scheme || 'http'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, scheme: value as 'http' | 'https' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Version</label>
                <Select
                  value={formData.api_version || 'v2'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, api_version: value as 'v1' | 'v2' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">v1</SelectItem>
                    <SelectItem value="v2">v2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeout</label>
                <Input
                  value={formData.timeout || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, timeout: e.target.value || undefined })
                  }
                  placeholder="10s"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Path Prefix</label>
                <Input
                  value={formData.path_prefix || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, path_prefix: e.target.value || undefined })
                  }
                  placeholder="/alertmanager"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate}>
              {editingIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
