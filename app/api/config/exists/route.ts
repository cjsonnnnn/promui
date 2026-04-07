import fs from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return NextResponse.json({ error: 'Missing file query parameter' }, { status: 400 })
    }
    const safe = sanitizeFilename(filename)
    try {
      await fs.stat(filePathFor(safe))
      return NextResponse.json({ exists: true, filename: safe })
    } catch (e) {
      const err = e as NodeJS.ErrnoException
      if (err.code === 'ENOENT') return NextResponse.json({ exists: false, filename: safe })
      throw e
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to check file' },
      { status: 500 }
    )
  }
}
