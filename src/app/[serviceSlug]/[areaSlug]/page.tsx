import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'
import {NavigationLevelPage} from '@/components/navigation-level-page'
import {findNavigationLevel, landingPagePath, prepareServiceNavigation, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY} from '@/sanity/lib/queries'

type Props = {params: Promise<{serviceSlug: string; areaSlug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {serviceSlug: firstSlug, areaSlug: secondSlug} = await params
  const data = await metadataClient.fetch(SERVICE_NAVIGATION_QUERY)
  const clusters = prepareServiceNavigation((data || {}) as ServiceNavigationPayload)
  const cluster = clusters.find((item) => item.slug === firstSlug)
  const service = cluster?.services.find((item) => item.slug === secondSlug)
  if (!cluster || !service) return {}
  return {
    title: `${service.name} Service`,
    description: `Review ${service.name.toLowerCase()} information, project guidance, and scheduling options from City & Suburban.`,
    alternates: {canonical: `${siteUrl.replace(/\/+$/, '')}/services/${cluster.slug}/${service.slug}`},
  }
}

export default async function ServiceCollectionPage({params}: Props) {
  const {serviceSlug: firstSlug, areaSlug: secondSlug} = await params
  const {data} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const clusters = prepareServiceNavigation((data || {}) as ServiceNavigationPayload)

  const cluster = clusters.find((item) => item.slug === firstSlug)
  const nestedService = cluster?.services.find((item) => item.slug === secondSlug)
  if (cluster && nestedService) return <NavigationLevelPage cluster={cluster} service={nestedService} />

  const legacy = findNavigationLevel(clusters, firstSlug)
  if (legacy?.kind === 'service' && legacy.service.pages.some((page) => page.areaSlug === secondSlug)) {
    permanentRedirect(landingPagePath(legacy.cluster.slug, legacy.service.slug, secondSlug))
  }
  notFound()
}
