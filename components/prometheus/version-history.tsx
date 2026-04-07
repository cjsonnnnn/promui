"use client"

import { useState } from 'react'
import { usePrometheusStore } from '@/lib/prometheus-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  History,
  RotateCcw,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VersionHistory() {
  const { versions, restoreVersion } = usePrometheusStore()

  const [isOpen, setIsOpen] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState<string | null>(null)

  const handleRestore = (id: string) => {
    restoreVersion(id)
    setRestoreConfirm(null)
  }

  // Sort versions by timestamp descending
  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <History className="mr-2 h-4 w-4" />
        History
        {versions.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {versions.length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and restore previous versions of your configuration.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {sortedVersions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No versions saved yet
                </p>
                <p className="text-sm text-muted-foreground">
                  A snapshot is created automatically on every save
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedVersions.map((version, index) => (
                  <div
                    key={version.id}
                    className={cn(
                      'group rounded-lg border border-border p-3 transition-colors hover:bg-muted/50',
                      index === 0 && 'border-success/50 bg-success/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            v{versions.length - index}
                          </span>
                          {index === 0 && (
                            <Badge variant="outline" className="text-success border-success/50">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground mt-1">
                          {version.comment}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(version.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            Changed: {version.changedSections.join(', ')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => setRestoreConfirm(version.id)}
                        disabled={index === 0}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation */}
      <Dialog
        open={!!restoreConfirm}
        onOpenChange={() => setRestoreConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? Your current
              unsaved changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => restoreConfirm && handleRestore(restoreConfirm)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
