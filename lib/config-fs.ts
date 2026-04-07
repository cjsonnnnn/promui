import fs from 'node:fs/promises'
import path from 'node:path'

const SUPPORTED_EXTENSIONS = new Set(['.yml', '.yaml'])

export type ConfigFileInfo = {
  filename: string
  path: string
  size: number
  lastModified: string
}

export function getConfigDir(): string {
  const configured = process.env.CONFIG_DIR?.trim()
  if (!configured) {
    return path.resolve(process.cwd(), 'configs')
  }
  if (path.isAbsolute(configured)) {
    return configured
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), configured)
}

export async function ensureConfigDir(): Promise<string> {
  const configDir = getConfigDir()
  await fs.mkdir(configDir, { recursive: true })
  return configDir
}

export function isYamlFilename(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return SUPPORTED_EXTENSIONS.has(ext)
}

export function sanitizeFilename(filename: string): string {
  const trimmed = filename.trim()
  if (!trimmed) {
    throw new Error('Filename is required')
  }
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Filename must not contain path separators')
  }
  if (!isYamlFilename(trimmed)) {
    throw new Error('Filename must end with .yml or .yaml')
  }
  return trimmed
}

export async function listConfigFiles(): Promise<ConfigFileInfo[]> {
  const configDir = await ensureConfigDir()
  const entries = await fs.readdir(configDir, { withFileTypes: true })

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && isYamlFilename(entry.name))
      .map(async (entry) => {
        const absolutePath = path.join(configDir, entry.name)
        const stats = await fs.stat(absolutePath)
        return {
          filename: entry.name,
          path: absolutePath,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        }
      })
  )

  files.sort((a, b) => a.filename.localeCompare(b.filename))
  return files
}

export function filePathFor(filename: string): string {
  const safeName = sanitizeFilename(filename)
  return path.join(getConfigDir(), safeName)
}
