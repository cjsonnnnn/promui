import { apiFail, apiOk } from '@/lib/api-route'
import { listConfigFiles } from '@/lib/config-fs'

export async function GET() {
  try {
    const files = await listConfigFiles()
    return apiOk({ files })
  } catch (error) {
    return apiFail((error as Error).message || 'Failed to list config files')
  }
}
