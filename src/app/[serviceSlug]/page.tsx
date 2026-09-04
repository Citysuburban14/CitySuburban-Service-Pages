import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'
import {NavigationLevelPage} from '@/components/navigation-level-page'
import {findNavigationLevel, prepareServiceNavigation, servicePath, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY} from '@/sanity/lib/queries'

type Props = {params: Promise<{serviceSlug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {serviceSlug: slug} = await params
  const data = await metadataClient.fetch(SERVICE_NAVIGATION_QUERY)
  const level = findNavigationLevel(prepareServiceNavigation((data || {}) as ServiceNavigationPayload), slug)
  if (!level) return {}
  if (level.kind === 'service') return {}
  return {
    title: `${level.cluster.name} Services in Chicago`,
    description: level.cluster.description,
    alternates: {canonical: `${siteUrl.replace(/\/+$/, '')}/services/${level.cluster.slug}`},
  }
}

export default async function NavigationPage({params}: Props) {
  const {serviceSlug: slug} = await params
  const {data} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const level = findNavigationLevel(prepareServiceNavigation((data || {}) as ServiceNavigationPayload), slug)
  if (!level) notFound()

  if (level.kind === 'service') permanentRedirect(servicePath(level.cluster.slug, level.service.slug))
  return <NavigationLevelPage cluster={level.cluster} />
}
