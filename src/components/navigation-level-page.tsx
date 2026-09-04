import Link from 'next/link'
import {CollectionFooter, CollectionHeader} from '@/components/collection-chrome'
import {ServiceCollection} from '@/components/service-collection'
import {clusterPath, type PreparedCluster, type PreparedService} from '@/lib/service-navigation'

type Props = {
  cluster: PreparedCluster
  service?: PreparedService
}

export function NavigationLevelPage({cluster, service}: Props) {
  const isCluster = !service
  const pages = service?.pages || cluster.pages
  const title = service?.name || cluster.name
  const lede = service
    ? `Review ${service.name.toLowerCase()} information, project guidance, and scheduling options before opening the complete service page.`
    : cluster.description
  const count = service ? pages.length : cluster.services.length
  const panelImage = service?.cardImage || cluster.cardImage

  return (
    <div className="collection-page">
      <CollectionHeader />
      <main>
        <nav className="collection-breadcrumb collection-wrap" aria-label="Breadcrumb">
          <ol>
            <li><a href="https://citysuburbanheating.com/">Home</a></li>
            <li><Link href="/">Services</Link></li>
            {service && <li><Link href={clusterPath(cluster.slug)}>{cluster.name}</Link></li>}
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
                <a href="#service-directory-title">{isCluster ? 'Browse services' : 'Open service page'}</a>
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
              <h2>{isCluster ? 'Available services' : 'Available page'}</h2>
              <p>{isCluster ? `${count} services in this system` : 'Complete service details and scheduling'}</p>
            </div>
          </div>
        </section>
        <ServiceCollection
          pages={pages}
          clusterSlug={cluster.slug}
          level={isCluster ? 'service' : 'area'}
          kicker={isCluster ? `${cluster.name} directory` : 'Service page'}
          heading={isCluster ? `Choose a ${cluster.name.toLowerCase()} service` : `Open the ${service?.name.toLowerCase()} page`}
          description={isCluster
            ? 'Choose an equipment or service type to continue to its service collection.'
            : 'Open the complete service page for project guidance, reviews, pricing factors, and scheduling.'}
        />
      </main>
      <CollectionFooter />
    </div>
  )
}
