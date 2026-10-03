import fs from 'node:fs'
import path from 'node:path'

// Resolve a cluster reference from its slug through data/service-clusters.json, so the
// reference stays correct even if a cluster's public slug ever differs from its ID.
const clusters = JSON.parse(fs.readFileSync(path.resolve('data/service-clusters.json'), 'utf8')) as {clusters: Array<{id: string; slug: string}>}
const clusterIds = new Map(clusters.clusters.map((cluster) => [cluster.slug, cluster.id]))

export function clusterRef(clusterSlug: string): {_type: 'reference'; _ref: string} {
  const id = clusterIds.get(clusterSlug)
  if (!id) throw new Error(`Unknown cluster slug: ${clusterSlug}`)
  return {_type: 'reference', _ref: id}
}
