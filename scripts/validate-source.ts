import fs from 'node:fs'
import path from 'node:path'

type Row = Record<string, string>
type Source = {equip: Row[]; area: Row[]; page: Row[]}
type MediaPlan = {assets: Record<string, {path: string}>; services: Record<string, {cover: string; gallery: string[]; workingPhotos: string[]}>; areas: Record<string, Record<string, string>>}

const source = JSON.parse(fs.readFileSync(path.resolve('data/source-content.json'), 'utf8')) as Source
const mediaPlan = JSON.parse(fs.readFileSync(path.resolve('data/media-plan.json'), 'utf8')) as MediaPlan
const reviewContexts = JSON.parse(fs.readFileSync(path.resolve('data/review-context.json'), 'utf8')) as Record<string, Record<string, string>>
const errors: string[] = []
const warnings: string[] = []
const unique = (values: string[]) => new Set(values).size === values.length
const entries = (raw = '') => raw.split('||').map((item) => item.trim()).filter(Boolean)
const equipmentSlugs = source.equip.map((row) => row.slug)
const areaSlugs = source.area.map((row) => row.slug)
const pageKeys = source.page.map((row) => `${row.equipment_slug}__${row.area_slug}`)
const expectedKeys = equipmentSlugs.flatMap((equipment) => areaSlugs.map((area) => `${equipment}__${area}`))

if (!unique(equipmentSlugs)) errors.push('Duplicate service slugs')
if (!unique(source.equip.map((row) => row.service_id))) errors.push('Duplicate service IDs')
if (!unique(pageKeys)) errors.push('Duplicate service-page joins')
for (const key of expectedKeys) if (!pageKeys.includes(key)) errors.push(`Missing service-page row: ${key}`)
for (const row of source.equip) {
  if (!/^\d+$/.test(String(row.service_id))) errors.push(`Invalid service_id for ${row.slug}`)
  if (!/[\d,]+\/mo/.test(String(row.kw_volume))) errors.push(`Invalid kw_volume for ${row.slug}`)
  if (!row.h1_prefix || !row.hero_lede || !row.faqs) errors.push(`Missing required service content for ${row.slug}`)
  if (entries(row.types).length < 6) errors.push(`Too few equipment types for ${row.slug}`)
  if (entries(row.brands).length < 6) errors.push(`Too few brands for ${row.slug}`)
  if (entries(row.why).length < 3) errors.push(`Too few trust reasons for ${row.slug}`)
  if (entries(row.other_services).length < 3) errors.push(`Expected at least three related services for ${row.slug}`)
  if (entries(row.pricing_rows).length < 1) errors.push(`Missing pricing rows for ${row.slug}`)
  if (entries(row.faqs).length < 1) errors.push(`Missing FAQs for ${row.slug}`)
}
for (const row of source.page) {
  const expectedCanonical = `${row.site_url.replace(/\/$/, '')}/services/${row.equipment_slug}/${row.area_slug}/`
  if (row.canonical_url !== expectedCanonical) errors.push(`Unexpected canonical URL for ${row.equipment_slug}`)
  if (/Highlights Chicago/i.test(row.company_name)) errors.push(`Inherited company name for ${row.equipment_slug}`)
  if (row.meta_title.length > 75) errors.push(`Meta title exceeds 75 characters for ${row.equipment_slug}`)
  if (row.meta_description.length > 170) errors.push(`Meta description exceeds 170 characters for ${row.equipment_slug}`)
  const service = source.equip.find((candidate) => candidate.slug === row.equipment_slug)
  if (!service || String(service.service_id) !== String(row.service_id)) errors.push(`service_id mismatch for ${row.equipment_slug}`)
  if (entries(row.reviews).length !== 4) errors.push(`Expected four reviews for ${row.equipment_slug}`)
  const plannedMedia = mediaPlan.services[row.equipment_slug]
  if (!plannedMedia?.cover) errors.push(`Missing collection cover for ${row.equipment_slug}`)
  if ((plannedMedia?.gallery.length || entries(row.gallery).length) !== 3) errors.push(`Expected three gallery images for ${row.equipment_slug}`)
  if ((plannedMedia?.workingPhotos.length || entries(row.working_photos).length) !== 3) errors.push(`Expected three working photos for ${row.equipment_slug}`)
  if (entries(row.guides).length < 1) errors.push(`Missing guides for ${row.equipment_slug}`)
  if (!row.form_subtitle || !row.form_note) errors.push(`Missing page-specific form copy for ${row.equipment_slug}`)
  for (const review of entries(row.reviews)) {
    const [quote, , date, sourceUrl, sourceId] = review.split('::').map((value) => value.trim())
    if (!sourceId) errors.push(`Missing review source ID for ${row.equipment_slug}`)
    if (quote.split(/\s+/).filter(Boolean).length > 14) errors.push(`Review excerpt exceeds 14 words for ${sourceId || row.equipment_slug}`)
    if (sourceId && !reviewContexts[String(row.service_id)]?.[sourceId]) errors.push(`Missing review summary for ${row.service_id}/${sourceId}`)
    if (sourceId && /Highlights Chicago|electric(?:al|ian)/i.test(reviewContexts[String(row.service_id)]?.[sourceId] || '')) errors.push(`Cross-client review content found for ${row.service_id}/${sourceId}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) errors.push(`Invalid review date for ${sourceId || row.equipment_slug}`)
    if (!/^https:\/\/www\.google\.com\/maps\/reviews\//.test(sourceUrl || '')) errors.push(`Invalid Google review URL for ${sourceId || row.equipment_slug}`)
  }
}

for (const [assetKey, media] of Object.entries(mediaPlan.assets)) {
  if (!fs.existsSync(path.resolve(media.path))) errors.push(`Missing media file for ${assetKey}: ${media.path}`)
}
for (const row of source.area) {
  const names = entries(row.sub_areas).map((entry) => entry.split('::')[0].trim())
  for (const name of names) if (!mediaPlan.areas[row.slug]?.[name]) errors.push(`Missing location image for ${name}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(JSON.stringify({
  services: source.equip.length,
  areas: source.area.length,
  pages: source.page.length,
  pageJoins: pageKeys,
  monthlySearchVolumeTotal: source.equip.reduce((sum, row) => sum + Number((String(row.kw_volume).match(/[\d,]+/)?.[0] || '0').replace(/,/g, '')), 0),
  reviewSummaryRecords: Object.values(reviewContexts).reduce((count, reviews) => count + Object.keys(reviews).length, 0),
  warnings,
}, null, 2))
