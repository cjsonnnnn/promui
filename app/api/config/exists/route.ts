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

    const safe = sanitizeFilename(filename)
    try {
      await fs.stat(filePathFor(safe))
      return apiOk({ exists: true, filename: safe })
    } catch (e) {
      const err = e as NodeJS.ErrnoException
      if (err.code === 'ENOENT') return apiOk({ exists: false, filename: safe })
      throw e
    }
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to check file')
  }
}
