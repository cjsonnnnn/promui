/** UI / YAML comment group name for jobs without another scrape group (never empty string). */
export const SCRAPE_GROUP_UNGROUPED = 'Ungrouped'

/** Normalize group keys for storage, YAML sections, and Radix Select values. */
export function canonicalScrapeGroup(name: string | undefined | null): string {
  const t = String(name ?? '').trim()
  if (!t || t === '__ungrouped__') return SCRAPE_GROUP_UNGROUPED
  return t
}
