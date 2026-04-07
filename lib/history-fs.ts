import fs from 'node:fs/promises'
import path from 'node:path'
import { sanitizeFilename } from './config-fs'

export type HistoryEntry = {
  id: string
  timestamp: string
  yaml: string
}

type HistoryFile = {
  versions: HistoryEntry[]
}

function getHistoryRoot(): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), '.config-history')
}

function historyPathForConfigFile(filename: string): string {
  const safe = sanitizeFilename(filename)
  return path.join(getHistoryRoot(), `${safe}.json`)
}

export async function ensureHistoryDir(): Promise<void> {
  await fs.mkdir(getHistoryRoot(), { recursive: true })
}

async function readHistoryFile(filename: string): Promise<HistoryFile> {
  const filePath = historyPathForConfigFile(filename)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as HistoryFile
    return { versions: Array.isArray(parsed.versions) ? parsed.versions : [] }
  } catch (e) {
    const err = e as NodeJS.ErrnoException
    if (err.code === 'ENOENT') return { versions: [] }
    throw e
  }
}

export async function listHistory(filename: string): Promise<HistoryEntry[]> {
  const { versions } = await readHistoryFile(filename)
  return [...versions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function appendHistory(filename: string, yaml: string): Promise<HistoryEntry> {
  await ensureHistoryDir()
  const filePath = historyPathForConfigFile(filename)
  const existing = await readHistoryFile(filename)
  const entry: HistoryEntry = {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    yaml,
  }
  existing.versions.push(entry)
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf8')
  return entry
}

export async function deleteHistory(filename: string): Promise<void> {
  const filePath = historyPathForConfigFile(filename)
  try {
    await fs.unlink(filePath)
  } catch (e) {
    const err = e as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') throw e
  }
}

export async function renameHistory(fromFilename: string, toFilename: string): Promise<void> {
  if (fromFilename === toFilename) return
  const oldPath = historyPathForConfigFile(fromFilename)
  const newPath = historyPathForConfigFile(toFilename)
  try {
    await fs.rename(oldPath, newPath)
  } catch (e) {
    const err = e as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') throw e
  }
}
