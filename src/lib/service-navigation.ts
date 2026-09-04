import {prepareCollectionItems, type CollectionItem, type PreparedCollectionItem} from './collection-items'

export type ClusterRecord = {
  _id?: string | null
  name?: string | null
  slug?: string | null
  description?: string | null
  displayOrder?: number | null
  sourceServiceCount?: number | null
  monthlySearchVolume?: number | null
  chicagoSearchVolume?: number | null
  requiresScopeReview?: boolean | null
}

export type NavigationPage = CollectionItem & {
  clusterId?: string | null
  clusterName?: string | null
  clusterSlug?: string | null
  scopeStatus?: string | null
  scopeNote?: string | null
}

export type ServiceNavigationPayload = {
  clusters?: ClusterRecord[] | null
  pages?: NavigationPage[] | null
}

export type PreparedService = {
  slug: string
  name: string
  monthlySearchVolume?: number
  description?: string
  cardImage?: string
  scopeStatus?: string
  pages: PreparedCollectionItem[]
}

export type PreparedCluster = {
  id: string
  slug: string
  name: string
  description: string
  displayOrder: number
  sourceServiceCount: number
  monthlySearchVolume?: number
  chicagoSearchVolume?: number
  requiresScopeReview: boolean
  pages: PreparedCollectionItem[]
  services: PreparedService[]
  cardImage?: string
}

const fallbackClusterSlugs: Record<string, string> = {
  'Heating & Hot Water': 'heating',
  Cooling: 'cooling',
  'Whole-System HVAC & Controls': 'hvac-systems',
  'Indoor Air Quality & Ventilation': 'indoor-air-quality-ventilation',
  'Fireplace, Chimney & Solid Fuel': 'fireplace-chimney',
  'Commercial & Specialty': 'commercial-specialty',
}

function clean(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function prepareServiceNavigation(payload: ServiceNavigationPayload): PreparedCluster[] {
  const rawPages = payload.pages || []
  const preparedPages = prepareCollectionItems(rawPages)
  const sourceById = new Map(preparedPages.map((page) => [page._id, rawPages.find((candidate) => candidate._id === page._id)]))

  return (payload.clusters || []).flatMap((cluster, index) => {
    const slug = clean(cluster.slug) || fallbackClusterSlugs[clean(cluster.name) || '']
    const name = clean(cluster.name)
    if (!slug || !name) return []
    const pages = preparedPages.filter((page) => {
      const source = sourceById.get(page._id)
      return clean(source?.clusterSlug) === slug || (!clean(source?.clusterSlug) && clean(source?.clusterName) === name)
    })
    if (!pages.length) return []

    const byService = new Map<string, PreparedService>()
    for (const page of pages) {
      const source = sourceById.get(page._id)
      const existing = byService.get(page.serviceSlug)
      if (existing) {
        existing.pages.push(page)
        continue
      }
      byService.set(page.serviceSlug, {
        slug: page.serviceSlug,
        name: page.serviceName,
        monthlySearchVolume: page.monthlySearchVolume,
        description: page.metaDescription,
        cardImage: page.cardImage,
        scopeStatus: clean(source?.scopeStatus),
        pages: [page],
      })
    }
    const services = [...byService.values()].sort((left, right) => (right.monthlySearchVolume || 0) - (left.monthlySearchVolume || 0))
    return [{
      id: clean(cluster._id) || `cluster-${slug}`,
      slug,
      name,
      description: clean(cluster.description) || `Explore ${name.toLowerCase()} services available from City & Suburban.`,
      displayOrder: typeof cluster.displayOrder === 'number' ? cluster.displayOrder : index + 1,
      sourceServiceCount: typeof cluster.sourceServiceCount === 'number' ? cluster.sourceServiceCount : services.length,
      monthlySearchVolume: typeof cluster.monthlySearchVolume === 'number' ? cluster.monthlySearchVolume : undefined,
      chicagoSearchVolume: typeof cluster.chicagoSearchVolume === 'number' ? cluster.chicagoSearchVolume : undefined,
      requiresScopeReview: cluster.requiresScopeReview === true,
      pages,
      services,
      cardImage: services.find((service) => service.cardImage)?.cardImage,
    }]
  }).sort((left, right) => left.displayOrder - right.displayOrder)
}

export function findNavigationLevel(clusters: PreparedCluster[], slug: string) {
  const cluster = clusters.find((item) => item.slug === slug)
  if (cluster) return {kind: 'cluster' as const, cluster}
  for (const parent of clusters) {
    const service = parent.services.find((item) => item.slug === slug)
    if (service) return {kind: 'service' as const, cluster: parent, service}
  }
  return undefined
}

export function clusterPath(clusterSlug: string): string {
  return `/${clusterSlug}`
}

export function servicePath(clusterSlug: string, serviceSlug: string): string {
  return `/${clusterSlug}/${serviceSlug}`
}

export function landingPagePath(clusterSlug: string, serviceSlug: string, areaSlug: string): string {
  return `/${clusterSlug}/${serviceSlug}/${areaSlug}`
}
