import fs from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const from = sanitizeFilename(body?.from ?? '')
    const to = sanitizeFilename(body?.to ?? '')

    if (from === to) {
      return NextResponse.json({ ok: true, filename: to })
    }

    await fs.rename(filePathFor(from), filePathFor(to))
    return NextResponse.json({ ok: true, filename: to })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to rename config file' },
      { status: 400 }
    )
  }
}
