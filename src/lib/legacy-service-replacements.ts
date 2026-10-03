import migrations from '../../data/service-url-migrations.json'

// Only overlapping services are consolidated. Distinct keyword pages keep their
// own routes, copy and media in retained-catalog.json. No production edge rules
// are changed here; rollout is separate from this app setup.
const replacement: Record<string, string> = migrations.overlaps

export function legacyReplacementPath(slug: string): string | undefined {
  return replacement[slug]
}
