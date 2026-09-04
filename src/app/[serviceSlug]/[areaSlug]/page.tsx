import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'
import {ServiceLandingPage} from '@/components/service-landing-page'
import {findNavigationLevel, prepareServiceNavigation, servicePath, type PreparedService, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY, SERVICE_PAGE_METADATA_QUERY, SERVICE_PAGE_QUERY} from '@/sanity/lib/queries'
import type {ServicePageData} from '@/types/content'

type Props = {params: Promise<{serviceSlug: string; areaSlug: string}>}

function primaryPage(service: PreparedService) {
  return service.pages.find((page) => page.areaSlug === 'chicago') || service.pages[0]
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {serviceSlug: clusterSlug, areaSlug: serviceSlug} = await params
  const navigation = await metadataClient.fetch(SERVICE_NAVIGATION_QUERY)
  const clusters = prepareServiceNavigation((navigation || {}) as ServiceNavigationPayload)
  const cluster = clusters.find((item) => item.slug === clusterSlug)
  const service = cluster?.services.find((item) => item.slug === serviceSlug)
  const page = service && primaryPage(service)
  if (!cluster || !service || !page) return {}
  const metadata = await metadataClient.fetch(SERVICE_PAGE_METADATA_QUERY, {serviceSlug, areaSlug: page.areaSlug})
  if (!metadata) return {}
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {canonical: `${siteUrl.replace(/\/+$/, '')}/services${servicePath(cluster.slug, service.slug)}`},
  }
}

export default async function ServicePage({params}: Props) {
  const {serviceSlug: firstSlug, areaSlug: secondSlug} = await params
  const {data: navigation} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const clusters = prepareServiceNavigation((navigation || {}) as ServiceNavigationPayload)

  const cluster = clusters.find((item) => item.slug === firstSlug)
  const service = cluster?.services.find((item) => item.slug === secondSlug)
  const page = service && primaryPage(service)
  if (cluster && service && page) {
    const {data} = await sanityFetch({query: SERVICE_PAGE_QUERY, params: {serviceSlug: service.slug, areaSlug: page.areaSlug}})
    const typed = data as ServicePageData
    if (!typed.page || !typed.settings) notFound()
    return <ServiceLandingPage data={typed} />
  }

  const legacy = findNavigationLevel(clusters, firstSlug)
  if (legacy?.kind === 'service' && legacy.service.pages.some((candidate) => candidate.areaSlug === secondSlug)) {
    permanentRedirect(servicePath(legacy.cluster.slug, legacy.service.slug))
  }
  notFound()
}
