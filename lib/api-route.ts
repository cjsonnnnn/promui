import { NextResponse } from 'next/server'

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true as const, data }, { status })
}

export function apiFail(error: string, status = 200) {
  return NextResponse.json({ success: false as const, error }, { status })
}

export async function apiTry<T>(fn: () => Promise<T>, map?: (v: T) => unknown) {
  try {
    const result = await fn()
    const data = map ? map(result) : result
    return apiOk(data)
  } catch (e) {
    return apiFail((e as Error).message || 'Request failed')
  }
}
