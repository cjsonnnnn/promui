import { NextResponse } from 'next/server'
import { getConfigDir } from '@/lib/config-fs'

export async function GET() {
  const configured = process.env.CONFIG_DIR?.trim()
  const displayPath = configured && configured.length > 0 ? configured : './configs'
  return NextResponse.json({
    displayPath,
    resolvedPath: getConfigDir(),
  })
}
