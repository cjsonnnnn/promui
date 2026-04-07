import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch('http://localhost:9090/-/reload', {
      method: 'POST',
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: `Reload failed (${response.status}): ${text || response.statusText}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to contact Prometheus reload endpoint' },
      { status: 500 }
    )
  }
}
