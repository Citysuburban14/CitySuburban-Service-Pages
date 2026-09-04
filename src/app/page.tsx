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
            <div className="collection-hero-panel" aria-label={`${clusters.length} HVAC service clusters`}>
              <svg className="collection-hero-svg" viewBox="0 0 360 260" aria-hidden="true">
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="264" cy="75" r="51" stroke="#DD382B" strokeWidth="11" />
                  <path d="M264 42v66M235 58l58 34M235 92l58-34" stroke="#fff" strokeWidth="7" />
                  <path d="M126 46c-20 20 20 30 0 50s20 30 0 50M164 46c-20 20 20 30 0 50s20 30 0 50" stroke="#DD382B" strokeWidth="8" />
                  <path d="M61 192h238M78 192v25M126 192v25M174 192v25M222 192v25M282 192v25" stroke="#fff" strokeWidth="5" />
                  <circle cx="78" cy="225" r="8" fill="#DD382B" stroke="#DD382B" />
                  <circle cx="126" cy="225" r="8" fill="#fff" stroke="#fff" />
                  <circle cx="174" cy="225" r="8" fill="#DD382B" stroke="#DD382B" />
                  <circle cx="222" cy="225" r="8" fill="#fff" stroke="#fff" />
                  <circle cx="282" cy="225" r="8" fill="#DD382B" stroke="#DD382B" />
                </g>
              </svg>
              <span>Service clusters</span>
              <strong>{clusters.length}</strong>
              <p>Heating · Cooling · Air quality</p>
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
