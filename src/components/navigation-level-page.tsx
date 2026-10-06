import Link from 'next/link'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {ServiceCollection} from '@/components/service-collection'
import type {PreparedCluster} from '@/lib/service-navigation'

type Props = {cluster: PreparedCluster}

// Plain guidance shown on every category directory (audit 2026-10-05: decision router + safety stop).
const DIRECTORY_GUIDE = 'Pick the service that matches what the equipment is doing: repair for a fault, maintenance for routine care, installation when the equipment needs replacing. If the right page is unclear, call (773) 238-3838 and describe the symptoms. If a carbon monoxide alarm sounds, you smell gas, or you see smoke, leave the building and call 911 from outside before calling for service.'

function withArticle(phrase: string) {
  return `${/^[aeiou]/i.test(phrase) ? 'an' : 'a'} ${phrase}`
}

export function NavigationLevelPage({cluster}: Props) {
  const count = cluster.services.length

  return (
    <div className="collection-page">
      <CollectionHeader />
      <main>
        <nav className="collection-breadcrumb collection-wrap" aria-label="Breadcrumb">
          <ol>
            <li><a href="https://citysuburbanheating.com/">Home</a></li>
            <li><Link href="/">Services</Link></li>
            <li aria-current="page">{cluster.name}</li>
          </ol>
        </nav>
        <section className="collection-level-hero">
          <div className="collection-wrap collection-level-hero-grid">
            <div>
              <p className="collection-hero-kicker">City &amp; Suburban services</p>
              <h1>{cluster.name} services in Chicago</h1>
              <p>{cluster.description}</p>
              <div className="collection-hero-actions">
                <a href="#service-directory-title">Browse services</a>
                <a href="https://citysuburbanheating.com/contact-us/">Schedule service</a>
              </div>
            </div>
            <div
              className={`collection-level-stat${cluster.cardImage ? ' collection-level-stat-image' : ''}`}
              data-panel-image={cluster.cardImage}
              style={cluster.cardImage ? {backgroundImage: `linear-gradient(90deg,rgba(9,38,58,.96) 0%,rgba(9,38,58,.82) 52%,rgba(9,38,58,.38) 100%),url("${cluster.cardImage}")`} : undefined}
            >
              <span>{cluster.name}</span>
              <strong>{count}</strong>
              <h2>{count === 1 ? 'Service' : 'Services'} in this category</h2>
            </div>
          </div>
        </section>
        <ServiceCollection
          pages={cluster.pages}
          clusterSlug={cluster.slug}
          kicker={`${cluster.name} directory`}
          heading={`Choose ${withArticle(cluster.name.toLowerCase())} service`}
          description={DIRECTORY_GUIDE}
        />
      </main>
      <CollectionFooter />
    </div>
  )
}
