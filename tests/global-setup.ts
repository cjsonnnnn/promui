import fs from 'node:fs/promises'
import path from 'node:path'

export default async function globalSetup() {
  const configsDir = path.resolve(process.cwd(), 'configs')
  try {
    const entries = await fs.readdir(configsDir)
    await Promise.all(
      entries
        .filter((f) => /\.ya?ml$/i.test(f))
        .map((f) => fs.unlink(path.join(configsDir, f)).catch(() => {}))
    )
  } catch {
    // configs/ doesn't exist yet — that's fine
  }
}
