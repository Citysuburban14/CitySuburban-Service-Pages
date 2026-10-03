import {notFound, permanentRedirect} from 'next/navigation'
import {prepareServiceNavigation, servicePath, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY} from '@/sanity/lib/queries'
import {legacyReplacementPath} from '@/lib/legacy-service-replacements'
import {getReferenceService} from '@/lib/reference-pages'

type Props = {params: Promise<{serviceSlug: string; areaSlug: string; locationSlug: string}>}

export default async function LegacyServicePage({params}: Props) {
  const {serviceSlug: clusterSlug, areaSlug: serviceSlug, locationSlug: areaSlug} = await params
  const replacement = legacyReplacementPath(serviceSlug)
  if (replacement) permanentRedirect(replacement)
  const reference = getReferenceService(clusterSlug, serviceSlug)
  if (reference && areaSlug === 'chicago') permanentRedirect(reference.livePath)
  const {data} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const clusters = prepareServiceNavigation((data || {}) as ServiceNavigationPayload)
  const cluster = clusters.find((item) => item.slug === clusterSlug)
  const service = cluster?.services.find((item) => item.slug === serviceSlug)
  if (!cluster || !service || !service.pages.some((page) => page.areaSlug === areaSlug)) notFound()
  permanentRedirect(`/service${servicePath(cluster.slug, service.slug)}`)
}
