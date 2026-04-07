/**
 * Parse JSON API bodies shaped as { success: boolean, data?: unknown, error?: string }.
 * Tolerates legacy responses during transition.
 */
export type ApiEnvelope<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function parseApiResponse<T = unknown>(
  response: Response
): Promise<ApiEnvelope<T>> {
  let text = ''
  try {
    text = await response.text()
  } catch {
    return { success: false, error: 'Failed to read response' }
  }
  if (!text.trim()) {
    return {
      success: response.ok,
      error: response.ok ? undefined : 'Empty response',
    }
  }
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>
    if (typeof parsed.success === 'boolean') {
      return parsed as ApiEnvelope<T>
    }
    return { success: response.ok, data: parsed as T }
  } catch {
    return { success: false, error: text.slice(0, 200) }
  }
}
