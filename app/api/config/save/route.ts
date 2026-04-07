import fs from 'node:fs/promises'
import { NextRequest } from 'next/server'
import YAML from 'yaml'
import { apiFail, apiOk } from '@/lib/api-route'
import { ensureConfigDir, filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    const content = String(body?.content ?? '')

    if (!content.trim()) {
      return apiFail('Cannot save empty YAML content')
    }

    YAML.parse(content)

    await ensureConfigDir()
    const filePath = filePathFor(filename)
    await fs.writeFile(filePath, content, 'utf8')

    return apiOk({ filename })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to save config file')
  }
}
