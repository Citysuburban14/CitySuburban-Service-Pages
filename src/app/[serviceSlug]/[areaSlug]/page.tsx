import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'
import {ServiceLandingPage} from '@/components/service-landing-page'
import {findNavigationLevel, prepareServiceNavigation, servicePath, type PreparedService, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {metadataClient} from '@/sanity/lib/client'
import {siteUrl} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/live'
import {REFERENCE_SERVICE_QUERY, SERVICE_NAVIGATION_QUERY, SERVICE_PAGE_METADATA_QUERY, SERVICE_PAGE_QUERY} from '@/sanity/lib/queries'
import type {ServicePageData} from '@/types/content'
import {getReferenceService, getReferenceSnapshot, type ReferenceDocument} from '@/lib/reference-pages'
import {ReferenceLandingPage} from '@/components/reference-landing-page'
import {legacyReplacementPath} from '@/lib/legacy-service-replacements'
import {applyReferenceContentFields, synchronizeVisibleSchema} from '@/lib/reference-content-fields'
import {migrateServiceContent} from '@/lib/service-base-path'

type Props = {params: Promise<{serviceSlug: string; areaSlug: string}>}

function primaryPage(service: PreparedService) {
  return service.pages.find((page) => page.areaSlug === 'chicago') || service.pages[0]
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {serviceSlug: clusterSlug, areaSlug: serviceSlug} = await params
  const reference = getReferenceService(clusterSlug, serviceSlug)
  if (reference) {
    const updated = migrateServiceContent(await metadataClient.fetch(REFERENCE_SERVICE_QUERY, {clusterSlug, serviceSlug: reference.slug}).catch(() => null))
    return {
    title: {absolute: updated?.metaTitle || reference.title},
    description: updated?.metaDescription || reference.description,
    alternates: {canonical: updated?.canonicalUrl || reference.canonicalUrl},
    robots: {index: updated?.factChecksComplete === true, follow: true},
  }
  }
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
  const replacement = legacyReplacementPath(secondSlug)
  if (replacement) permanentRedirect(replacement.replace(/^\/services/, ''))
  const reference = getReferenceService(firstSlug, secondSlug)
  const snapshot = reference && getReferenceSnapshot(firstSlug, secondSlug)
  if (reference && snapshot) {
    const result = await sanityFetch({query: REFERENCE_SERVICE_QUERY, params: {clusterSlug: firstSlug, serviceSlug: reference.slug}, stega: false}).catch(() => null)
    const updated = migrateServiceContent(result?.data as ReferenceDocument | null)
    const editedSnapshot = updated?.sections?.length ? {
      ...snapshot,
      style: updated.responsiveCss || snapshot.style,
      schema: updated.structuredData || snapshot.schema,
      html: `<main ${htmlAttributes(snapshot.mainAttributes)}><div ${htmlAttributes(snapshot.wrapperAttributes)}>${updated.sections.map((section) => applyReferenceContentFields(section.html, section.contentFields)).join('')}</div></main>`,
    } : snapshot
    if (updated?.sections?.length) editedSnapshot.schema = synchronizeVisibleSchema(editedSnapshot.schema, editedSnapshot.html)
    return <ReferenceLandingPage snapshot={{style: editedSnapshot.style, html: editedSnapshot.html, schema: editedSnapshot.schema}} serviceName={updated?.name || reference.name} />
  }
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

function htmlAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes).map(([name, value]) => `${name}="${value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join(' ')
}
