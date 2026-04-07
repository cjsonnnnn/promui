import { NextRequest } from 'next/server'
import { appendHistory, deleteHistory, listHistory } from '@/lib/history-fs'
import { sanitizeFilename } from '@/lib/config-fs'
import { apiFail, apiOk } from '@/lib/api-route'

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return apiFail('Missing file query parameter')
    }
    const safe = sanitizeFilename(filename)
    const versions = await listHistory(safe)
    return apiOk({ filename: safe, versions })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to load history')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    const yaml = String(body?.yaml ?? '')
    if (!yaml.trim()) {
      return apiFail('YAML content is required')
    }
    const entry = await appendHistory(filename, yaml)
    return apiOk({ entry })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to append history')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return apiFail('Missing file query parameter')
    }
    const safe = sanitizeFilename(filename)
    await deleteHistory(safe)
    return apiOk({ deleted: true })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to delete history')
  }
}
