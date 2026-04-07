import { NextResponse } from 'next/server'

function prometheusReloadUrl(): string {
  const base = process.env.PROMETHEUS_URL?.trim() || 'http://127.0.0.1:9090'
  return `${base.replace(/\/$/, '')}/-/reload`
}

export async function POST() {
  const url = prometheusReloadUrl()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        {
          success: false as const,
          error: `HTTP ${response.status}${text ? `: ${text.slice(0, 120)}` : ''}`,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true as const, data: { reloaded: true } }, { status: 200 })
  } catch {
    return NextResponse.json(
      {
        success: false as const,
        error: 'Prometheus server not reachable',
      },
      { status: 200 }
    )
  }
}
