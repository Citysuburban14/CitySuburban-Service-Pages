import Link from 'next/link'
import {clusterPath, type PreparedCluster} from '@/lib/service-navigation'

export function ClusterCollection({clusters}: {clusters: PreparedCluster[]}) {
  return (
    <section className="collection-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="cluster-directory-heading">
          <h2 className="collection-kicker" id="service-directory-title">Explore by system</h2>
        </div>
        {!clusters.length && <p className="setup-note">No published service clusters are available yet. Import the workbook taxonomy and confirm that each service definition is assigned to a cluster.</p>}
        <div className="cluster-card-grid">
          {clusters.map((cluster) => (
            <Link className="cluster-card" href={clusterPath(cluster.slug)} key={cluster.id}>
              <span className={`cluster-card-media${cluster.cardImage ? '' : ' cluster-card-media-empty'}`} style={cluster.cardImage ? {backgroundImage: `linear-gradient(90deg,rgba(9,38,58,.92),rgba(9,38,58,.34)),url("${cluster.cardImage}")`} : undefined}>
                <span>{String(cluster.displayOrder).padStart(2, '0')}</span>
              </span>
              <span className="cluster-card-content">
                <span className="cluster-card-meta">{cluster.services.length} {cluster.services.length === 1 ? 'service' : 'services'}</span>
                <strong>{cluster.name}</strong>
                <span className="cluster-card-description-text">{cluster.description}</span>
                <ul className="cluster-card-services" aria-label={`${cluster.name} services`}>
                  {cluster.services.map((service) => <li key={service.slug}>{service.name}</li>)}
                </ul>
                <span className="cluster-card-link">View All Services <span aria-hidden="true">→</span></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
