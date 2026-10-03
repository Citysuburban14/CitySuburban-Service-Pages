import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'
import {migrateServiceUrls} from '../lib/service-base-path'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    referenceServicePage: defineLocations({
      select: {title: 'name', slug: 'slug.current', clusterSlug: 'clusterSlug', livePath: 'livePath'},
      resolve: (document) => ({
        locations: document?.clusterSlug && document?.slug
          ? [{title: document.title || 'Service page', href: migrateServiceUrls(document.livePath || `/services/${document.clusterSlug}/${document.slug}/`)}]
          : [],
      }),
    }),
    serviceCluster: defineLocations({
      select: {title: 'name', slug: 'slug.current'},
      resolve: (document) => ({
        locations: document?.slug ? [{title: document.title || 'Service cluster', href: `/services/${document.slug}/`}] : [],
      }),
    }),
    serviceDefinition: defineLocations({
      select: {title: 'name', slug: 'slug.current', clusterSlug: 'cluster->slug.current'},
      resolve: (document) => ({
        locations: document?.slug && document?.clusterSlug ? [{title: document.title || 'Service page', href: `/services/${document.clusterSlug}/${document.slug}/`}] : [],
      }),
    }),
    servicePage: defineLocations({
      select: {
        title: 'title',
        serviceSlug: 'service->slug.current',
        clusterSlug: 'service->cluster->slug.current',
      },
      resolve: (document) => ({
        locations: document?.clusterSlug && document?.serviceSlug
          ? [{title: document.title || 'Service page', href: `/services/${document.clusterSlug}/${document.serviceSlug}/`}]
          : [],
      }),
    }),
  },
}
