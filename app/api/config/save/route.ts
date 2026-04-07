import fs from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import YAML from 'yaml'
import { ensureConfigDir, filePathFor, sanitizeFilename } from '@/lib/config-fs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    const content = String(body?.content ?? '')

    if (!content.trim()) {
      return NextResponse.json({ error: 'Cannot save empty YAML content' }, { status: 400 })
    }

    // Reject invalid YAML to keep file state consistent.
    YAML.parse(content)

    await ensureConfigDir()
    const filePath = filePathFor(filename)
    await fs.writeFile(filePath, content, 'utf8')

    return NextResponse.json({ ok: true, filename })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to save config file' },
      { status: 400 }
    )
  }
}
