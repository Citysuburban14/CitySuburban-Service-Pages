import Link from 'next/link'
import type {PreparedCluster} from '@/lib/service-navigation'

export function ClusterCollection({clusters}: {clusters: PreparedCluster[]}) {
  return (
    <section className="collection-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="collection-directory-heading">
          <div>
            <p className="collection-kicker">Explore by system</p>
            <h2 id="service-directory-title">Browse HVAC service clusters</h2>
          </div>
          <p>Start with the system or problem category, choose the service you need, then open its local Chicago service page.</p>
        </div>
        {!clusters.length && <p className="setup-note">No published service clusters are available yet. Import the workbook taxonomy and confirm that each service definition is assigned to a cluster.</p>}
        <div className="cluster-card-grid">
          {clusters.map((cluster) => (
            <Link className="cluster-card" href={`/${cluster.slug}`} key={cluster.id}>
              <span className={`cluster-card-media${cluster.cardImage ? '' : ' cluster-card-media-empty'}`} style={cluster.cardImage ? {backgroundImage: `linear-gradient(90deg,rgba(9,38,58,.92),rgba(9,38,58,.34)),url("${cluster.cardImage}")`} : undefined}>
                <span>{String(cluster.displayOrder).padStart(2, '0')}</span>
              </span>
              <span className="cluster-card-content">
                <span className="cluster-card-meta">{cluster.services.length} {cluster.services.length === 1 ? 'service' : 'services'} · {cluster.pages.length} local {cluster.pages.length === 1 ? 'page' : 'pages'}</span>
                <strong>{cluster.name}</strong>
                <span>{cluster.description}</span>
                <span className="cluster-card-link">View services <span aria-hidden="true">→</span></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
