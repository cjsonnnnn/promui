import fs from 'node:fs/promises'
import { NextRequest } from 'next/server'
import { apiFail, apiOk } from '@/lib/api-route'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'
import { deleteHistory } from '@/lib/history-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    await fs.unlink(filePathFor(filename))
    await deleteHistory(filename)
    return apiOk({ filename })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to delete config file')
  }
}
