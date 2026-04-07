import fs from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'
import { deleteHistory } from '@/lib/history-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    await fs.unlink(filePathFor(filename))
    await deleteHistory(filename)
    return NextResponse.json({ ok: true, filename })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete config file' },
      { status: 400 }
    )
  }
}
