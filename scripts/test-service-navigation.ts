import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {clusterPath, findNavigationLevel, legacyServiceSlugs, prepareServiceNavigation, servicePath} from '../src/lib/service-navigation'
import {serviceSlug} from './service-url-map'

type Row = Record<string, string | number>
type Source = {equip: Row[]; area: Row[]; page: Row[]}
type ClusterSource = {
  clusters: Array<{
    id: string
    name: string
    slug: string
    description: string
    displayOrder: number
    sourceServiceCount: number
    monthlySearchVolume: number
    chicagoSearchVolume: number
    serviceIds: number[]
    requiresScopeReview: boolean
  }>
}
type TaxonomySource = {
  excludedTopics: Array<{equipment: string}>
  services: Array<{serviceId: number; slug: string; clusterSlug: string; scopeStatus: string}>
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) as T
}

const sources = [
  readJson<Source>('data/source-content.json'),
  readJson<Source>('data/source-content-306-315.json'),
  readJson<Source>('data/source-content-316-325.json'),
]
const clusterSource = readJson<ClusterSource>('data/service-clusters.json')
const taxonomySource = readJson<TaxonomySource>('data/service-taxonomy.json')
const equipment = sources.flatMap((source) => source.equip)
const pageRows = sources.flatMap((source) => source.page)
const equipmentById = new Map(equipment.map((row) => [Number(row.C), row]))
const taxonomyById = new Map(taxonomySource.services.map((item) => [item.serviceId, item]))

assert.equal(equipment.length, 25, 'the three content batches must contain 25 service definitions')
assert.equal(pageRows.length, 25, 'the three content batches must contain 25 Chicago landing pages')
assert.equal(taxonomySource.services.length, 25, 'the workbook taxonomy must map all 25 service IDs')
assert.deepEqual([...taxonomyById.keys()].sort((a, b) => a - b), Array.from({length: 25}, (_, index) => 301 + index))

const clusters = prepareServiceNavigation({
  clusters: clusterSource.clusters.map((cluster) => ({
    _id: cluster.id,
    name: cluster.name,
    slug: cluster.slug,
    description: cluster.description,
    displayOrder: cluster.displayOrder,
    sourceServiceCount: cluster.sourceServiceCount,
    monthlySearchVolume: cluster.monthlySearchVolume,
    chicagoSearchVolume: cluster.chicagoSearchVolume,
    requiresScopeReview: cluster.requiresScopeReview,
  })),
  pages: pageRows.map((row) => {
    const serviceId = Number(row.service_id)
    const service = equipmentById.get(serviceId)
    const taxonomy = taxonomyById.get(serviceId)
    assert.ok(service, `service ${serviceId} is missing from the content batches`)
    assert.ok(taxonomy, `service ${serviceId} is missing from the workbook taxonomy`)
    assert.equal(row.area_slug, 'chicago', `service ${serviceId} must use the Chicago area`)
    const slug = serviceSlug(serviceId, String(service.slug))
    assert.equal(slug, taxonomy.slug, `service ${serviceId} slug does not match its workbook mapping`)
    return {
      _id: `servicePage-${serviceId}-chicago`,
      serviceSlug: slug,
      areaSlug: String(row.area_slug),
      serviceName: String(service.name),
      areaName: 'Chicago',
      monthlySearchVolume: 1,
      clusterSlug: taxonomy.clusterSlug,
      scopeStatus: taxonomy.scopeStatus,
    }
  }),
})

assert.equal(clusters.length, 6, 'all six workbook clusters must be buildable with the 25 service pages')
assert.equal(clusters.reduce((total, cluster) => total + cluster.services.length, 0), 25)
assert.equal(clusters.reduce((total, cluster) => total + cluster.pages.length, 0), 25)

for (const expected of clusterSource.clusters) {
  const cluster = clusters.find((candidate) => candidate.slug === expected.slug)
  assert.ok(cluster, `cluster ${expected.slug} is missing`)
  const actualIds = cluster.services
    .map((service) => taxonomySource.services.find((item) => item.slug === service.slug)?.serviceId)
    .filter((id): id is number => typeof id === 'number')
    .sort((a, b) => a - b)
  assert.deepEqual(actualIds, [...expected.serviceIds].sort((a, b) => a - b), `cluster ${expected.slug} has the wrong services`)
  assert.equal(findNavigationLevel(clusters, expected.slug)?.kind, 'cluster')
}

for (const service of taxonomySource.services) {
  const level = findNavigationLevel(clusters, service.slug)
  assert.equal(level?.kind, 'service', `service route ${service.slug} is missing`)
  if (level?.kind === 'service') {
    assert.equal(level.cluster.slug, service.clusterSlug, `service ${service.serviceId} resolves to the wrong cluster`)
    assert.equal(level.service.pages.length, 1, `service ${service.serviceId} must resolve to one Chicago page`)
  }
}

assert.equal(findNavigationLevel(clusters, 'unknown'), undefined)
assert.equal(clusterPath('heating'), '/heating/')
assert.equal(servicePath('heating', 'furnace-repair-installation'), '/heating/furnace-repair-installation/')

// Pages that replace a live WordPress page must sit at that page's exact URL.
const liveUrls: Record<number, string> = {
  302: '/cooling/air-conditioning-installation/', 305: '/cooling/heat-pump-services/', 306: '/heating/heater-repair/',
  307: '/air-quality/duct-repair/', 308: '/heating/boiler-service/', 310: '/cooling/ductless-hvac-service/',
  315: '/air-quality/indoor-air-quality-test/', 320: '/air-quality/dehumidifier-installation/',
}
for (const [id, url] of Object.entries(liveUrls)) {
  const item = taxonomySource.services.find((candidate) => candidate.serviceId === Number(id))
  assert.ok(item, `service ${id} is missing from the taxonomy`)
  assert.equal(servicePath(item.clusterSlug, item.slug), url, `service ${id} must keep its live URL`)
}
// The app's old-slug aliases must point at exactly the slugs the import scripts apply.
for (const [id, url] of Object.entries(liveUrls)) {
  const slug = url.split('/')[2]
  assert.ok(Object.values(legacyServiceSlugs).includes(slug), `alias for service ${id} is missing`)
  assert.equal(serviceSlug(id, 'unused'), slug, `live slug override for service ${id} is wrong`)
}
assert.equal(Object.keys(legacyServiceSlugs).length, Object.keys(liveUrls).length)
assert.equal(taxonomySource.excludedTopics.some((topic) => /Fans \(General\/Portable\)/.test(topic.equipment)), true)
assert.equal(clusters.some((cluster) => cluster.services.some((service) => /portable-fan/.test(service.slug))), false)

console.log('Service-navigation hierarchy checks passed: 6 clusters, 25 services, and 25 Chicago landing pages.')
