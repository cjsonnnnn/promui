"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, FileText, File } from 'lucide-react'

export function RuleFilesEditor() {
  const { config, addRuleFile, deleteRuleFile, setRuleFiles } = usePrometheusStore()
  const ruleFiles = config.rule_files || []

  const [newPath, setNewPath] = useState('')

  const handleAdd = () => {
    if (newPath.trim()) {
      addRuleFile(newPath.trim())
      setNewPath('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rule Files</h2>
          <p className="text-sm text-muted-foreground">
            Paths to recording and alerting rules
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rule File Paths</CardTitle>
          <CardDescription>
            Add paths to your Prometheus rule files. Supports glob patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ruleFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <File className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No rule files configured
              </p>
              <p className="text-xs text-muted-foreground">
                Add paths to your recording and alerting rules
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {ruleFiles.map((path, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 font-mono text-sm">{path}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteRuleFile(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="/etc/prometheus/rules/*.yml"
              className="flex-1 font-mono"
            />
            <Button onClick={handleAdd} disabled={!newPath.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Path
            </Button>
          </div>

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">Tip: You can use glob patterns</p>
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
              <li>/etc/prometheus/rules/*.yml - all YAML files in directory</li>
              <li>/etc/prometheus/rules/**/*.yml - recursive</li>
              <li>/etc/prometheus/alerts.yml - specific file</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
