import fs from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return NextResponse.json({ error: 'Missing file query parameter' }, { status: 400 })
    }

    const safeName = sanitizeFilename(filename)
    const filePath = filePathFor(safeName)
    const content = await fs.readFile(filePath, 'utf8')

    return NextResponse.json({ filename: safeName, content })
  } catch (error) {
    const message = (error as Error).message || 'Failed to load config file'
    const status = /ENOENT/.test(message) ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
