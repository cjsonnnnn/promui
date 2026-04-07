import { NextResponse } from 'next/server'
import { listConfigFiles } from '@/lib/config-fs'

export async function GET() {
  try {
    const files = await listConfigFiles()
    return NextResponse.json({ files })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to list config files' },
      { status: 500 }
    )
  }
}
