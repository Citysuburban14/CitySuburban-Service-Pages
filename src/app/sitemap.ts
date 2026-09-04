import type {MetadataRoute} from 'next'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {SERVICE_NAVIGATION_QUERY} from '@/sanity/lib/queries'
import {clusterPath, landingPagePath, prepareServiceNavigation, servicePath, type ServiceNavigationPayload} from '@/lib/service-navigation'

// Next serves this at /services/sitemap.xml because basePath is applied to the
// sitemap route automatically. Every <loc> is an absolute URL on the public
// canonical host (NEXT_SITE_URL, e.g. https://www.highlightschicago.com).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/+$/, '')
  const lastModified = new Date()
  const data = await metadataClient.fetch(SERVICE_NAVIGATION_QUERY)
  const clusters = prepareServiceNavigation((data || {}) as ServiceNavigationPayload)
  const clusterPages = clusters.map((cluster) => ({
    url: `${base}/services${clusterPath(cluster.slug)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))
  const serviceCollections = clusters.flatMap((cluster) => cluster.services.map((service) => ({
    url: `${base}/services${servicePath(cluster.slug, service.slug)}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  })))
  const servicePages = clusters.flatMap((cluster) => cluster.pages.map((page) => ({
      url: `${base}/services${landingPagePath(cluster.slug, page.serviceSlug, page.areaSlug)}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })))

  return [
    {url: `${base}/services`, lastModified, changeFrequency: 'weekly', priority: 1},
    ...clusterPages,
    ...serviceCollections,
    ...servicePages,
  ]
}
