import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    serviceCluster: defineLocations({
      select: {title: 'name', slug: 'slug.current'},
      resolve: (document) => ({
        locations: document?.slug ? [{title: document.title || 'Service cluster', href: `/services/${document.slug}`}] : [],
      }),
    }),
    serviceDefinition: defineLocations({
      select: {title: 'name', slug: 'slug.current', clusterSlug: 'cluster->slug.current'},
      resolve: (document) => ({
        locations: document?.slug && document?.clusterSlug ? [{title: document.title || 'Service collection', href: `/services/${document.clusterSlug}/${document.slug}`}] : [],
      }),
    }),
    servicePage: defineLocations({
      select: {
        title: 'title',
        serviceSlug: 'service->slug.current',
        clusterSlug: 'service->cluster->slug.current',
        areaSlug: 'area->slug.current',
      },
      resolve: (document) => ({
        locations: document?.clusterSlug && document?.serviceSlug && document?.areaSlug
          ? [{title: document.title || 'Service page', href: `/services/${document.clusterSlug}/${document.serviceSlug}/${document.areaSlug}`}]
          : [],
      }),
    }),
  },
}
