import fs from 'node:fs/promises'
import { NextRequest } from 'next/server'
import { apiFail, apiOk } from '@/lib/api-route'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'
import { renameHistory } from '@/lib/history-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const from = sanitizeFilename(body?.from ?? '')
    const to = sanitizeFilename(body?.to ?? '')

    if (from === to) {
      return apiOk({ filename: to })
    }

    const toPath = filePathFor(to)
    const exists = await fs.access(toPath).then(() => true).catch(() => false)
    if (exists) {
      return apiFail('A file with that name already exists.', 409)
    }

    await fs.rename(filePathFor(from), toPath)
    await renameHistory(from, to)
    return apiOk({ filename: to })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to rename config file')
  }
}
