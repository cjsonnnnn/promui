import YAML from 'yaml'

/**
 * Recursively normalise a parsed YAML value so that the fingerprint is
 * equivalent regardless of whether empty arrays / empty objects / null values
 * were present in the original text or were stripped by our serialiser.
 *
 * This mirrors the `JSON.stringify(value, replacer)` behaviour in
 * `exportYamlFromState`, which omits keys whose value is `undefined` or an
 * empty array (`[]`). Both sides of the dirty comparison must go through the
 * same normalisation to avoid false positives.
 */
function normaliseDeep(value: unknown): unknown {
  if (value === null || value === undefined) return undefined
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined          // strip empty arrays
    const items = value.map(normaliseDeep).filter((v) => v !== undefined)
    return items.length === 0 ? undefined : items
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    const keys = Object.keys(o).sort()
    const out: Record<string, unknown> = {}
    let hasKey = false
    for (const k of keys) {
      const v = normaliseDeep(o[k])
      if (v !== undefined) {
        out[k] = v
        hasKey = true
      }
    }
    return hasKey ? out : undefined                  // strip empty objects
  }
  return value
}

/** Logical fingerprint: ignores YAML formatting, key order, whitespace, and
 *  empty arrays/objects — consistent with the exportYaml() serialiser output. */
export function canonicalYamlFingerprint(yamlText: string): string {
  const t = yamlText.trim()
  if (!t) return '__empty__'
  try {
    const parsed = YAML.parse(yamlText) as unknown
    const normalised = normaliseDeep(parsed)
    if (normalised === undefined) return '__empty__'
    return JSON.stringify(normalised)
  } catch {
    return `__raw__:${t}`
  }
}

export function canonicalYamlDocumentsEqual(a: string, b: string): boolean {
  return canonicalYamlFingerprint(a) === canonicalYamlFingerprint(b)
}

