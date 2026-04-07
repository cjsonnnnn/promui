"use client"

import { useState, useEffect } from 'react'
import { ScrapeConfig } from '@/lib/prometheus-types'
import { usePrometheusStore } from '@/lib/prometheus-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, X } from 'lucide-react'

interface JobEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: ScrapeConfig | null
}

interface LabelEntry {
  key: string
  value: string
}

export function JobEditorModal({ open, onOpenChange, job }: JobEditorModalProps) {
  const { addScrapeConfig, updateScrapeConfig, validateConfig } = usePrometheusStore()

  const [jobName, setJobName] = useState('')
  const [targets, setTargets] = useState<string[]>([''])
  const [scrapeInterval, setScrapeInterval] = useState('')
  const [scrapeTimeout, setScrapeTimeout] = useState('')
  const [metricsPath, setMetricsPath] = useState('')
  const [labels, setLabels] = useState<LabelEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (job) {
      setJobName(job.job_name)
      setTargets(
        job.static_configs[0]?.targets.length > 0
          ? job.static_configs[0].targets
          : ['']
      )
      setScrapeInterval(job.scrape_interval || '')
      setScrapeTimeout(job.scrape_timeout || '')
      setMetricsPath(job.metrics_path || '')
      const existingLabels = job.static_configs[0]?.labels || {}
      setLabels(
        Object.entries(existingLabels).map(([key, value]) => ({ key, value }))
      )
    } else {
      resetForm()
    }
  }, [job, open])

  const resetForm = () => {
    setJobName('')
    setTargets([''])
    setScrapeInterval('')
    setScrapeTimeout('')
    setMetricsPath('')
    setLabels([])
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!jobName.trim()) {
      newErrors.jobName = 'Job name is required'
    }

    const validTargets = targets.filter((t) => t.trim())
    if (validTargets.length === 0) {
      newErrors.targets = 'At least one target is required'
    }

    const targetRegex = /^[\w.-]+:\d+$/
    validTargets.forEach((target, idx) => {
      if (!targetRegex.test(target)) {
        newErrors[`target_${idx}`] = `Invalid format: ${target}`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const labelsObj: Record<string, string> = {}
    labels.forEach((l) => {
      if (l.key.trim() && l.value.trim()) {
        labelsObj[l.key.trim()] = l.value.trim()
      }
    })

    const newJob: Omit<ScrapeConfig, 'id'> = {
      job_name: jobName.trim(),
      static_configs: [
        {
          targets: targets.filter((t) => t.trim()),
          ...(Object.keys(labelsObj).length > 0 ? { labels: labelsObj } : {}),
        },
      ],
      ...(scrapeInterval.trim() ? { scrape_interval: scrapeInterval.trim() } : {}),
      ...(scrapeTimeout.trim() ? { scrape_timeout: scrapeTimeout.trim() } : {}),
      ...(metricsPath.trim() ? { metrics_path: metricsPath.trim() } : {}),
    }

    if (job) {
      updateScrapeConfig(job.id, newJob)
    } else {
      addScrapeConfig(newJob)
    }

    validateConfig()
    onOpenChange(false)
  }

  const addTarget = () => {
    setTargets([...targets, ''])
  }

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index))
  }

  const updateTarget = (index: number, value: string) => {
    const newTargets = [...targets]
    newTargets[index] = value
    setTargets(newTargets)
  }

  const addLabel = () => {
    setLabels([...labels, { key: '', value: '' }])
  }

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index))
  }

  const updateLabel = (index: number, field: 'key' | 'value', value: string) => {
    const newLabels = [...labels]
    newLabels[index][field] = value
    setLabels(newLabels)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {job ? 'Modify the scrape configuration for this job.' : 'Configure a new scrape job with targets and settings.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="jobName">Job Name *</Label>
            <Input
              id="jobName"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g., node-exporter"
              className={errors.jobName ? 'border-destructive' : ''}
            />
            {errors.jobName && (
              <p className="text-xs text-destructive">{errors.jobName}</p>
            )}
          </div>

          {/* Targets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Targets *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTarget}>
                <Plus className="h-4 w-4 mr-1" />
                Add Target
              </Button>
            </div>
            {errors.targets && (
              <p className="text-xs text-destructive">{errors.targets}</p>
            )}
            <div className="space-y-2">
              {targets.map((target, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={target}
                    onChange={(e) => updateTarget(index, e.target.value)}
                    placeholder="e.g., 192.168.1.100:9100"
                    className={errors[`target_${index}`] ? 'border-destructive' : ''}
                  />
                  {targets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTarget(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scrapeInterval">Scrape Interval</Label>
              <Input
                id="scrapeInterval"
                value={scrapeInterval}
                onChange={(e) => setScrapeInterval(e.target.value)}
                placeholder="e.g., 15s"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scrapeTimeout">Scrape Timeout</Label>
              <Input
                id="scrapeTimeout"
                value={scrapeTimeout}
                onChange={(e) => setScrapeTimeout(e.target.value)}
                placeholder="e.g., 10s"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricsPath">Metrics Path</Label>
              <Input
                id="metricsPath"
                value={metricsPath}
                onChange={(e) => setMetricsPath(e.target.value)}
                placeholder="e.g., /metrics"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Labels</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLabel}>
                <Plus className="h-4 w-4 mr-1" />
                Add Label
              </Button>
            </div>
            {labels.length > 0 && (
              <div className="space-y-2">
                {labels.map((label, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={label.key}
                      onChange={(e) => updateLabel(index, 'key', e.target.value)}
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={label.value}
                      onChange={(e) => updateLabel(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLabel(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{job ? 'Save Changes' : 'Add Job'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
