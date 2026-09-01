import type {Metadata} from 'next'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {CollectionItem, ServiceCollection} from '@/components/service-collection'
import {furnaceLincolnParkCollectionItem} from '@/data/furnace-lincoln-park-sample'
import {sanityFetch} from '@/sanity/lib/live'
import {SERVICE_INDEX_QUERY} from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'HVAC Services in Chicago',
  description: 'Explore City & Suburban heating, cooling, indoor-air-quality, and commercial HVAC service pages.',
  alternates: {canonical: 'https://citysuburbanheating.com/services'},
}

export default async function HomePage() {
  const {data} = await sanityFetch({query: SERVICE_INDEX_QUERY, stega: false})
  const sanityPages = (data || []) as CollectionItem[]
  const hasSampleRoute = sanityPages.some((page) => page.serviceSlug === furnaceLincolnParkCollectionItem.serviceSlug && page.areaSlug === furnaceLincolnParkCollectionItem.areaSlug)
  const pages = hasSampleRoute ? sanityPages : [furnaceLincolnParkCollectionItem, ...sanityPages]
  return (
    <div className="collection-page">
      <CollectionHeader />
      <main>
        <section className="collection-hero">
          <div className="collection-wrap collection-hero-grid">
            <div>
              <p className="collection-hero-kicker">Family-owned HVAC company since 1952</p>
              <h1>Trusted HVAC experts from city to suburbs</h1>
              <p>Explore dependable heating, cooling, indoor-air-quality, and commercial HVAC services for Chicago homes and nearby suburbs.</p>
              <div className="collection-hero-actions">
                <a href="#service-directory-title">Explore services</a>
                <a href="https://citysuburbanheating.com/contact-us/">Schedule service</a>
              </div>
            </div>
            <div className="collection-hero-panel" aria-label={`${pages.length} available local service pages`}>
              <span>Service library</span>
              <strong>{pages.length}</strong>
              <p>Local service pages and growing</p>
              <a href="tel:+17732383838">Call (773) 238-3838 <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>
        <ServiceCollection pages={pages} />
        <section className="collection-trust-band">
          <div className="collection-wrap">
            <p>Why City & Suburban</p>
            <div><strong>70+</strong><span>Years serving Chicagoland</span></div>
            <div><strong>24/7</strong><span>Service availability</span></div>
            <div><strong>NATE</strong><span>Certified HVAC technicians</span></div>
            <a href="https://citysuburbanheating.com/about-us/">Meet the company <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <CollectionFooter />
    </div>
  )
}
