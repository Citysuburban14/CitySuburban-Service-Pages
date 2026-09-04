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
      select: {title: 'name', slug: 'slug.current'},
      resolve: (document) => ({
        locations: document?.slug ? [{title: document.title || 'Service collection', href: `/services/${document.slug}`}] : [],
      }),
    }),
    servicePage: defineLocations({
      select: {
        title: 'title',
        serviceSlug: 'service->slug.current',
        areaSlug: 'area->slug.current',
      },
      resolve: (document) => ({
        locations: document?.serviceSlug && document?.areaSlug
          ? [{title: document.title || 'Service page', href: `/services/${document.serviceSlug}/${document.areaSlug}`}]
          : [],
      }),
    }),
  },
}
