import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    const response = await fetch('http://127.0.0.1:9090/-/reload', {
      method: 'POST',
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        {
          error: `Prometheus returned ${response.status}. ${text?.slice(0, 200) || response.statusText}. Is Prometheus running and was it started with --web.enable-lifecycle?`,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = (error as Error).message || 'Unknown error'
    const friendly =
      /fetch failed|ECONNREFUSED|aborted|timeout/i.test(message)
        ? 'Prometheus not reachable at http://127.0.0.1:9090 (connection refused or timeout).'
        : message
    return NextResponse.json({ error: friendly }, { status: 500 })
  }
}
