import fs from 'node:fs/promises'
import { NextRequest } from 'next/server'
import { apiFail, apiOk } from '@/lib/api-route'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return apiFail('Missing file query parameter')
    }

    const safeName = sanitizeFilename(filename)
    const filePath = filePathFor(safeName)
    const content = await fs.readFile(filePath, 'utf8')

    return apiOk({ filename: safeName, content })
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      return apiFail('File not found')
    }
    return apiFail((error as Error).message || 'Failed to load config file')
  }
}
