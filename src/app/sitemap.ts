import type {MetadataRoute} from 'next'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {REFERENCE_NAVIGATION_QUERY} from '@/sanity/lib/queries'
import {referencePagePath, referenceNavigation, type ReferenceOverride} from '@/lib/reference-pages'
import {clusterPath} from '@/lib/service-navigation'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/+$/, '')
  const lastModified = new Date()
  const published = await metadataClient.fetch(REFERENCE_NAVIGATION_QUERY).catch(() => []) as ReferenceOverride[]
  const clusters = referenceNavigation(published)
  return [
    {url: `${base}/services/`, lastModified, changeFrequency: 'weekly', priority: 1},
    ...clusters.map((cluster) => ({
      url: `${base}/services${clusterPath(cluster.slug)}`,
      lastModified, changeFrequency: 'weekly' as const, priority: 0.9,
    })),
    ...published.flatMap((page) => {
      const path = referencePagePath(page)
      if (!page.factChecksComplete || !path) return []
      return [{
      url: `${base}${path}`,
      lastModified, changeFrequency: 'weekly' as const, priority: 0.85,
    }]}),
  ]
}
