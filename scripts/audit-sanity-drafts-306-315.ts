import fs from 'node:fs'
import path from 'node:path'
import {createClient} from 'next-sanity'

function loadLocalEnv() {
  const envPath = path.resolve('.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator < 1) continue
    const key = trimmed.slice(0, separator)
    const value = trimmed.slice(separator + 1).replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()
const projectId = process.env.NEXT_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'q0tvhxym'
const dataset = process.env.NEXT_SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN
if (!token) throw new Error('Sanity token is missing')

const ids = Array.from({length: 10}, (_, index) => 306 + index)
const existingIds = ids.flatMap((id) => [
  `service-${id}`,
  `drafts.service-${id}`,
  `servicePage-${id}-chicago`,
  `drafts.servicePage-${id}-chicago`,
])

const client = createClient({projectId, dataset, apiVersion: '2026-03-01', token, useCdn: false, perspective: 'raw'})

async function main() {
const documents = await client.fetch(`*[_id in $ids]{
  _id, _type, _rev, serviceId, name, title,
  "slug": slug.current,
  "serviceRef": service._ref,
  "areaRef": area._ref,
  "templateRef": template._ref,
  "reviewCount": count(reviews),
  "trustMetricCount": count(trustMetrics),
  "guideCount": count(guides),
  "galleryCount": count(gallery),
  "workingPhotoCount": count(workingPhotos),
  "hasCoverImage": defined(coverImage.image.asset) || defined(coverImage.externalUrl),
  "hasFormCopy": defined(formSubtitle) && defined(formNote),
  "metaTitleLength": length(seo.title),
  "metaDescriptionLength": length(seo.description)
} | order(serviceId asc, _id asc)`, {ids: existingIds})

const baseline = await client.fetch(`*[_id in $ids]{_id, _rev} | order(_id asc)`, {
  ids: Array.from({length: 5}, (_, index) => 301 + index).flatMap((id) => [`service-${id}`, `servicePage-${id}-chicago`]),
})

console.log(JSON.stringify({projectId, dataset, documents, publishedBaseline301To305: baseline}, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unknown Sanity audit error')
  process.exit(1)
})
