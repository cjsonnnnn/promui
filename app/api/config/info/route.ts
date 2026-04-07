import { apiFail, apiOk } from '@/lib/api-route'
import { getConfigDir } from '@/lib/config-fs'

export async function GET() {
  try {
    const configured = process.env.CONFIG_DIR?.trim()
    const displayPath = configured && configured.length > 0 ? configured : './configs'
    return apiOk({
      displayPath,
      resolvedPath: getConfigDir(),
    })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to read config info')
  }
}
