import { NextRequest, NextResponse } from 'next/server'
import { appendHistory, deleteHistory, listHistory } from '@/lib/history-fs'
import { sanitizeFilename } from '@/lib/config-fs'

export async function GET(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return NextResponse.json({ error: 'Missing file query parameter' }, { status: 400 })
    }
    const safe = sanitizeFilename(filename)
    const versions = await listHistory(safe)
    return NextResponse.json({ filename: safe, versions })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to load history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filename = sanitizeFilename(body?.file ?? '')
    const yaml = String(body?.yaml ?? '')
    if (!yaml.trim()) {
      return NextResponse.json({ error: 'YAML content is required' }, { status: 400 })
    }
    const entry = await appendHistory(filename, yaml)
    return NextResponse.json({ ok: true, entry })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to append history' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('file')
    if (!filename) {
      return NextResponse.json({ error: 'Missing file query parameter' }, { status: 400 })
    }
    const safe = sanitizeFilename(filename)
    await deleteHistory(safe)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete history' },
      { status: 500 }
    )
  }
}
