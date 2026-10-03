import catalog from '@/reference-pages/catalog.json'
import retainedCatalog from '@/reference-pages/retained-catalog.json'
import migrations from '../../data/service-url-migrations.json'
import {referenceSnapshots} from '@/reference-pages'
import type {ReferenceSnapshot} from '@/reference-pages/types'
import type {PreparedCluster} from './service-navigation'
import type {ReferenceContentField} from './reference-content-fields'

export type ReferenceService = (typeof catalog)[number] | (typeof retainedCatalog)[number]

const clusterDetails: Record<string, {name: string; description: string}> = {
  heating: {name: 'Heating', description: 'Heating repair, installation, maintenance, heat pumps, boilers and system plans for Chicago homes.'},
  cooling: {name: 'Cooling', description: 'Air conditioning, ductless systems, heat pumps and maintenance for Chicago homes.'},
  'air-quality': {name: 'Air Quality', description: 'Ductwork, humidity control and indoor air quality services in Chicago.'},
  commercial: {name: 'Commercial HVAC', description: 'Commercial HVAC installation, repair, replacement, ductwork and maintenance.'},
}

export const referenceServices: ReferenceService[] = [...catalog, ...retainedCatalog]

export function referenceCollectionSlug(slug: string): string {
  return slug === 'commercial-hvac' ? 'commercial' : (migrations.directoryCategories as Record<string, string>)[slug] || slug
}

export type ReferenceOverride = {name?: string; clusterSlug?: string; slug?: string; livePath?: string; canonicalUrl?: string; cardDescription?: string; cardImage?: string; metaDescription?: string; factChecksComplete?: boolean}
export type ReferenceDocument = ReferenceOverride & {
  metaTitle?: string
  factChecksComplete?: boolean
  responsiveCss?: string
  structuredData?: string
  sections?: Array<{_key?: string; module: string; html: string; contentFields?: ReferenceContentField[]}>
}

export function getReferenceService(clusterSlug: string, slug: string): ReferenceService | undefined {
  return referenceServices.find((item) => item.clusterSlug === clusterSlug && (item.slug === slug || item.legacySlug === slug))
}

export function getReferenceSnapshot(clusterSlug: string, slug: string): ReferenceSnapshot | undefined {
  const service = getReferenceService(clusterSlug, slug)
  return service && referenceSnapshots[`${clusterSlug}/${service.slug}`]
}

export function referenceNavigation(overrides: ReferenceOverride[] = []): PreparedCluster[] {
  return Object.entries(clusterDetails).map(([slug, details], index) => {
    const services = referenceServices.filter((item) => ('directoryClusterSlug' in item ? item.directoryClusterSlug : item.clusterSlug) === slug)
    const pages = services.map((item) => {
      const override = overrides.find((row) => row.clusterSlug === item.clusterSlug && row.slug === item.slug)
      return ({
      _id: `reference-${slug}-${item.slug}`,
      serviceSlug: item.slug,
      livePath: item.livePath,
      areaSlug: 'chicago',
      serviceName: override?.name || item.name,
      areaName: 'Chicago',
      metaDescription: override?.cardDescription || override?.metaDescription || item.description,
      cardImage: override?.cardImage || item.cardImage || undefined,
    })})
    return {
      id: `reference-${slug}`,
      slug,
      name: details.name,
      description: details.description,
      displayOrder: index + 1,
      sourceServiceCount: services.length,
      requiresScopeReview: services.some((item) => item.qcStatus !== 'PASS'),
      pages,
      services: pages.map((page) => ({slug: page.serviceSlug, name: page.serviceName, description: page.metaDescription, cardImage: page.cardImage, pages: [page]})),
      cardImage: pages.find((page) => page.cardImage)?.cardImage,
    }
  })
}
