import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ServiceLandingPage} from '@/components/service-landing-page'
import {landingPagePath, prepareServiceNavigation, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY, SERVICE_PAGE_METADATA_QUERY, SERVICE_PAGE_QUERY} from '@/sanity/lib/queries'
import type {ServicePageData} from '@/types/content'

type Props = {params: Promise<{serviceSlug: string; areaSlug: string; locationSlug: string}>}

async function resolveRoute(params: Awaited<Props['params']>) {
  const navigation = await metadataClient.fetch(SERVICE_NAVIGATION_QUERY)
  const clusters = prepareServiceNavigation((navigation || {}) as ServiceNavigationPayload)
  const cluster = clusters.find((item) => item.slug === params.serviceSlug)
  const service = cluster?.services.find((item) => item.slug === params.areaSlug)
  const page = service?.pages.find((item) => item.areaSlug === params.locationSlug)
  return {cluster, service, page}
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const resolved = await params
  const route = await resolveRoute(resolved)
  if (!route.page) return {}
  const metadata = await metadataClient.fetch(SERVICE_PAGE_METADATA_QUERY, {
    serviceSlug: resolved.areaSlug,
    areaSlug: resolved.locationSlug,
  })
  if (!metadata) return {}
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {canonical: `${siteUrl.replace(/\/+$/, '')}/services${landingPagePath(resolved.serviceSlug, resolved.areaSlug, resolved.locationSlug)}`},
  }
}

export default async function ServicePage({params}: Props) {
  const resolved = await params
  const route = await resolveRoute(resolved)
  if (!route.page) notFound()
  const {data} = await sanityFetch({
    query: SERVICE_PAGE_QUERY,
    params: {serviceSlug: resolved.areaSlug, areaSlug: resolved.locationSlug},
  })
  const typed = data as ServicePageData
  if (!typed.page || !typed.settings) notFound()
  return <ServiceLandingPage data={typed} />
}
