import type {Metadata} from 'next'
import {ClusterCollection} from '@/components/cluster-collection'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {prepareServiceNavigation, type ServiceNavigationPayload} from '@/lib/service-navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_NAVIGATION_QUERY} from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'HVAC Services in Chicago',
  description: 'Explore City & Suburban heating, cooling, indoor-air-quality, and commercial HVAC service pages.',
  alternates: {canonical: 'https://citysuburbanheating.com/services'},
}

export default async function HomePage() {
  const {data} = await sanityFetch({query: SERVICE_NAVIGATION_QUERY, stega: false})
  const clusters = prepareServiceNavigation((data || {}) as ServiceNavigationPayload)
  const pageCount = clusters.reduce((total, cluster) => total + cluster.pages.length, 0)
  return (
    <div className="collection-page">
      <CollectionHeader />
      <main>
        <section className="collection-hero">
          <div className="collection-wrap collection-hero-grid">
            <div>
              <p className="collection-hero-kicker">Family-owned HVAC company since 1952</p>
              <h1>Trusted HVAC experts for Chicago homes</h1>
              <p>Explore dependable heating, cooling, indoor-air-quality, and commercial HVAC services for Chicago homes and buildings.</p>
              <div className="collection-hero-actions">
                <a href="#service-directory-title">Explore service clusters</a>
                <a href="https://citysuburbanheating.com/contact-us/">Schedule service</a>
              </div>
            </div>
            <div className="collection-hero-panel" aria-label={`${clusters.length} service clusters and ${pageCount} available local service pages`}>
              <span>Service clusters</span>
              <strong>{clusters.length}</strong>
              <p>{pageCount} local service pages and growing</p>
              <a href="tel:+17732383838">Call (773) 238-3838 <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>
        <ClusterCollection clusters={clusters} />
        <section className="collection-trust-band">
          <div className="collection-wrap">
            <p>Why City & Suburban</p>
            <div><strong>1952</strong><span>Family-owned since</span></div>
            <div><strong>24/7</strong><span>Service availability</span></div>
            <div><strong>4.98</strong><span>Across 204 Google reviews</span></div>
            <a href="https://citysuburbanheating.com/about-us/">Meet the company <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <CollectionFooter />
    </div>
  )
}
