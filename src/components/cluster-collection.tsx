import Link from 'next/link'
import {clusterPath, type PreparedCluster} from '@/lib/service-navigation'

const clusterCardDescriptions: Record<string, string> = {
  heating: 'Furnaces, boilers, water heaters, radiant heat, and dependable home-heating service.',
  cooling: 'Central air, ductless mini-splits, and room AC solutions for reliable summer comfort.',
  'hvac-systems': 'Complete HVAC installation, controls, thermostats, maintenance, and system support.',
  'indoor-air-quality-ventilation': 'Cleaner-air solutions including duct care, ventilation, humidification, and filtration.',
  'fireplace-chimney': 'Fireplace, chimney, gas-log, and solid-fuel services for safe, comfortable homes.',
  'commercial-specialty': 'Commercial equipment and specialty HVAC service for Chicago properties and facilities.',
}

export function ClusterCollection({clusters}: {clusters: PreparedCluster[]}) {
  return (
    <section className="collection-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="cluster-directory-heading">
          <h2 className="collection-kicker" id="service-directory-title">Explore by system</h2>
        </div>
        {!clusters.length && <p className="setup-note">No published service clusters are available yet. Import the workbook taxonomy and confirm that each service definition is assigned to a cluster.</p>}
        <div className="cluster-card-grid">
          {clusters.map((cluster) => {
            return (
              <Link className="cluster-card" href={clusterPath(cluster.slug)} key={cluster.id}>
                <span className={`cluster-card-media${cluster.cardImage ? '' : ' cluster-card-media-empty'}`} style={cluster.cardImage ? {backgroundImage: `linear-gradient(180deg,rgba(9,38,58,.04),rgba(9,38,58,.34)),url("${cluster.cardImage}")`} : undefined}>
                  <span className="cluster-card-number">System {String(cluster.displayOrder).padStart(2, '0')}</span>
                </span>
                <span className="cluster-card-content">
                  <span className="cluster-card-meta">{cluster.services.length} {cluster.services.length === 1 ? 'service' : 'services'}</span>
                  <strong>{cluster.name}</strong>
                  <span className="cluster-card-description-text">{clusterCardDescriptions[cluster.slug] || cluster.description}</span>
                  <span className="cluster-card-services-label">Services include</span>
                  <span className="cluster-card-services" aria-label={`${cluster.name} services`}>
                    {cluster.services.map((service) => <span className="cluster-card-service-chip" key={service.slug}>{service.name}</span>)}
                  </span>
                  <span className="cluster-card-link">View All Services <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
