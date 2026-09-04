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
              <svg className="collection-hero-svg" viewBox="0 0 360 220" aria-hidden="true">
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="164" y="18" width="166" height="126" rx="20" stroke="#fff" strokeWidth="5" />
                  <circle cx="247" cy="72" r="37" stroke="#DD382B" strokeWidth="9" />
                  <circle cx="247" cy="72" r="7" fill="#DD382B" stroke="#DD382B" />
                  <path d="M247 42v23M247 79v23M221 57l20 11M253 76l20 11M221 87l20-11M253 68l20-11" stroke="#fff" strokeWidth="6" />
                  <path d="M195 118h18M222 118h18M249 118h18M276 118h18" stroke="#DD382B" strokeWidth="5" />
                  <path d="M119 34c-18 17 18 26 0 43s18 26 0 43M145 34c-18 17 18 26 0 43s18 26 0 43" stroke="#DD382B" strokeWidth="8" />
                  <path d="M112 174h218M126 174v24M164 174v24M202 174v24M240 174v24M278 174v24M316 174v24" stroke="#fff" strokeWidth="4" />
                  <circle cx="126" cy="202" r="7" fill="#DD382B" stroke="#DD382B" />
                  <circle cx="164" cy="202" r="7" fill="#fff" stroke="#fff" />
                  <circle cx="202" cy="202" r="7" fill="#DD382B" stroke="#DD382B" />
                  <circle cx="240" cy="202" r="7" fill="#fff" stroke="#fff" />
                  <circle cx="278" cy="202" r="7" fill="#DD382B" stroke="#DD382B" />
                  <circle cx="316" cy="202" r="7" fill="#fff" stroke="#fff" />
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
