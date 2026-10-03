export type CollectionItem = {
  _id?: string | null
  title?: string | null
  serviceSlug?: string | null
  areaSlug?: string | null
  serviceName?: string | null
  areaName?: string | null
  monthlySearchVolume?: number | null
  metaDescription?: string | null
  cardImage?: string | null
}

export type PreparedCollectionItem = Omit<CollectionItem, 'serviceSlug' | 'areaSlug' | 'serviceName' | 'areaName' | 'monthlySearchVolume' | 'metaDescription' | 'cardImage'> & {
  _id: string
  serviceSlug: string
  areaSlug: string
  serviceName: string
  areaName: string
  monthlySearchVolume?: number
  metaDescription?: string
  cardImage?: string
}

const serviceCardImages: Record<string, string> = {
  'furnace': '/service/images/services/furnace-repair.png',
  'generator-installation': '/service/images/services/generator-installation.jpg',
  'solar-panel-installation': '/service/images/services/solar-panel-installation.jpg',
  'ceiling-fan-installation': '/service/images/services/ceiling-fan-installation.jpg',
  'generator-repair': '/service/images/services/generator-repair.jpg',
  'whole-house-surge-protector': '/service/images/services/whole-house-surge-protector.jpg',
  'gfci-outlet-installation': '/service/images/services/gfci-outlet-installation.jpg',
  'garbage-disposal-wiring': '/service/images/services/garbage-disposal-wiring.jpg',
  'electrical-repair': '/service/images/services/electrical-repair.jpg',
  'electrical-panel-upgrade': '/service/images/services/electrical-panel-upgrade.jpg',
  'circuit-breaker-replacement': '/service/images/services/circuit-breaker-replacement.jpg',
}

function cleanString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function prepareCollectionItems(pages: CollectionItem[]): PreparedCollectionItem[] {
  return pages.flatMap((page, index) => {
    const serviceSlug = cleanString(page.serviceSlug)
    const areaSlug = cleanString(page.areaSlug)
    if (!serviceSlug || !areaSlug) return []

    const monthlySearchVolume = typeof page.monthlySearchVolume === 'number' && Number.isFinite(page.monthlySearchVolume) && page.monthlySearchVolume > 0
      ? page.monthlySearchVolume
      : undefined

    return [{
      ...page,
      _id: cleanString(page._id) || `${serviceSlug}-${areaSlug}-${index}`,
      serviceSlug,
      areaSlug,
      serviceName: cleanString(page.serviceName) || cleanString(page.title) || 'Electrical service',
      areaName: cleanString(page.areaName) || 'Chicago',
      monthlySearchVolume,
      metaDescription: cleanString(page.metaDescription),
      cardImage: serviceCardImages[serviceSlug] || cleanString(page.cardImage),
    }]
  })
}
