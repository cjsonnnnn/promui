import YAML from 'yaml'

function sortKeysDeep(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  const o = value as Record<string, unknown>
  const keys = Object.keys(o).sort()
  const out: Record<string, unknown> = {}
  for (const k of keys) {
    out[k] = sortKeysDeep(o[k])
  }
  return out
}

/** Logical fingerprint: ignores YAML formatting / key order / whitespace. */
export function canonicalYamlFingerprint(yamlText: string): string {
  const t = yamlText.trim()
  if (!t) return '__empty__'
  try {
    const parsed = YAML.parse(yamlText) as unknown
    return JSON.stringify(sortKeysDeep(parsed))
  } catch {
    return `__raw__:${t}`
  }
}

export function canonicalYamlDocumentsEqual(a: string, b: string): boolean {
  return canonicalYamlFingerprint(a) === canonicalYamlFingerprint(b)
}
