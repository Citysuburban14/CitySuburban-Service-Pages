import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {ServiceCollection} from '@/components/service-collection'
import {findNavigationLevel, prepareServiceNavigation, type ServiceNavigationPayload} from '@/lib/service-navigation'
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
  const title = level.kind === 'cluster'
    ? `${level.cluster.name} Services in Chicago`
    : `${level.service.name} Service Areas`
  const description = level.kind === 'cluster'
    ? level.cluster.description
    : `Choose a local ${level.service.name.toLowerCase()} service page from City & Suburban.`
  return {title, description, alternates: {canonical: `${siteUrl.replace(/\/+$/, '')}/services/${slug}`}}
}

export default async function NavigationPage({params}: Props) {
  const {serviceSlug: slug} = await params
  const {data} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const level = findNavigationLevel(prepareServiceNavigation((data || {}) as ServiceNavigationPayload), slug)
  if (!level) notFound()

  const isCluster = level.kind === 'cluster'
  const cluster = level.cluster
  const pages = isCluster ? cluster.pages : level.service.pages
  const title = isCluster ? cluster.name : level.service.name
  const lede = isCluster
    ? cluster.description
    : `Select your service area to view local ${level.service.name.toLowerCase()} information, project guidance, reviews, and scheduling options.`
  const count = isCluster ? cluster.services.length : pages.length
  const panelImage = isCluster ? cluster.cardImage : level.service.cardImage
  const panelTitle = isCluster ? 'Available services' : 'Available service areas'
  const panelDetail = isCluster
    ? `${pages.length} Chicago service ${pages.length === 1 ? 'page' : 'pages'}`
    : `${count} Chicago landing ${count === 1 ? 'page' : 'pages'}`

  return (
    <div className="collection-page">
      <CollectionHeader />
      <main>
        <nav className="collection-breadcrumb collection-wrap" aria-label="Breadcrumb">
          <ol>
            <li><a href="https://citysuburbanheating.com/">Home</a></li>
            <li><Link href="/">Services</Link></li>
            {!isCluster && <li><Link href={`/${cluster.slug}`}>{cluster.name}</Link></li>}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <section className="collection-level-hero">
          <div className="collection-wrap collection-level-hero-grid">
            <div>
              <p className="collection-hero-kicker">{isCluster ? 'HVAC service cluster' : cluster.name}</p>
              <h1>{title}</h1>
              <p>{lede}</p>
              <div className="collection-hero-actions">
                <a href="#service-directory-title">{isCluster ? 'Browse services' : 'Choose your area'}</a>
                <a href="https://citysuburbanheating.com/contact-us/">Schedule service</a>
              </div>
            </div>
            <div
              className={`collection-level-stat${panelImage ? ' collection-level-stat-image' : ''}`}
              data-panel-image={panelImage}
              style={panelImage ? {backgroundImage: `linear-gradient(90deg,rgba(9,38,58,.96) 0%,rgba(9,38,58,.82) 52%,rgba(9,38,58,.38) 100%),url("${panelImage}")`} : undefined}
            >
              <span>{title}</span>
              <strong>{count}</strong>
              <h2>{panelTitle}</h2>
              <p>{panelDetail}</p>
            </div>
          </div>
        </section>
        <ServiceCollection
          pages={pages}
          level={isCluster ? 'service' : 'area'}
          kicker={isCluster ? `${cluster.name} directory` : 'Service areas'}
          heading={isCluster ? `Choose a ${cluster.name.toLowerCase()} service` : `Choose your ${level.service.name.toLowerCase()} page`}
          description={isCluster
            ? 'Each service opens a collection of its available local landing pages.'
            : 'Each location page follows the approved design and combines its mapped service and area content from Sanity.'}
        />
      </main>
      <CollectionFooter />
    </div>
  )
}
