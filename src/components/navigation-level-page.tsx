import Link from 'next/link'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {ServiceCollection} from '@/components/service-collection'
import type {PreparedCluster} from '@/lib/service-navigation'

type Props = {cluster: PreparedCluster}

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
              <p className="collection-hero-kicker">HVAC service cluster</p>
              <h1>{cluster.name}</h1>
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
              <h2>Available services</h2>
              <p>{count} services in this system</p>
            </div>
          </div>
        </section>
        <ServiceCollection
          pages={cluster.pages}
          clusterSlug={cluster.slug}
          kicker={`${cluster.name} directory`}
          heading={`Choose a ${cluster.name.toLowerCase()} service`}
          description="Choose an equipment or service type to open its complete service landing page."
        />
      </main>
      <CollectionFooter />
    </div>
  )
}
