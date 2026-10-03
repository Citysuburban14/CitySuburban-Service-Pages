import fs from 'node:fs'
import path from 'node:path'

// Cluster document IDs are stable even when a cluster's public slug changes
// (cluster-indoor-air-quality-ventilation now has the slug "air-quality"), so
// references are resolved by slug through this map instead of being built from it.
const clusters = JSON.parse(fs.readFileSync(path.resolve('data/service-clusters.json'), 'utf8')) as {clusters: Array<{id: string; slug: string}>}
const clusterIds = new Map(clusters.clusters.map((cluster) => [cluster.slug, cluster.id]))

// Service slugs that must equal an existing citysuburbanheating.com URL.
const liveSlugs = (JSON.parse(fs.readFileSync(path.resolve('data/live-url-slugs.json'), 'utf8')) as {services: Record<string, string>}).services

export function clusterRef(clusterSlug: string): {_type: 'reference'; _ref: string} {
  const id = clusterIds.get(clusterSlug)
  if (!id) throw new Error(`Unknown cluster slug: ${clusterSlug}`)
  return {_type: 'reference', _ref: id}
}

export function serviceSlug(serviceId: number | string, sourceSlug: string): string {
  return liveSlugs[String(serviceId)] || sourceSlug
}
