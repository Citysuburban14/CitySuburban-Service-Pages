/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import {clusterPath, type PreparedCluster} from '@/lib/service-navigation'

const clusterCardDescriptions: Record<string, string> = {
  heating: 'Heating and hot-water care for reliable home comfort.',
  cooling: 'Cooling solutions that keep Chicago homes comfortable.',
  'hvac-systems': 'Complete HVAC systems, controls, and maintenance.',
  'indoor-air-quality-ventilation': 'Cleaner indoor air and dependable ventilation solutions.',
  'fireplace-chimney': 'Fireplace, chimney, and solid-fuel home services.',
  'commercial-specialty': 'Commercial HVAC and specialty equipment support.',
}

function optimizedImageUrl(source: string) {
  if (!source.includes('cdn.sanity.io/images/')) return source
  const separator = source.includes('?') ? '&' : '?'
  return `${source}${separator}auto=format&fit=crop&w=720&q=76`
}

export function ClusterCollection({clusters}: {clusters: PreparedCluster[]}) {
  return (
    <section className="collection-directory cluster-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="cluster-directory-heading">
          <div>
            <p className="cluster-directory-eyebrow">Find your system</p>
            <h2 className="collection-kicker" id="service-directory-title">Explore by system</h2>
          </div>
          <p>Choose a service cluster to see the help available for your home or business.</p>
        </div>

        {!clusters.length && <p className="setup-note">No published service clusters are available yet. Import the workbook taxonomy and confirm that each service definition is assigned to a cluster.</p>}
        <div className="cluster-card-grid">
          {clusters.map((cluster) => (
              <Link
                aria-label={`View all ${cluster.name} services`}
                className="cluster-card"
                data-system={cluster.slug}
                href={clusterPath(cluster.slug)}
                key={cluster.id}
              >
                <span className={`cluster-card-media${cluster.cardImage ? '' : ' cluster-card-media-empty'}`}>
                  {cluster.cardImage ? (
                    <img alt={`${cluster.name} services`} decoding="async" loading="lazy" src={optimizedImageUrl(cluster.cardImage)} />
                  ) : (
                    <span className="cluster-card-placeholder" aria-hidden="true">CS</span>
                  )}
                  <span className="cluster-card-count">{cluster.services.length} {cluster.services.length === 1 ? 'service' : 'services'}</span>
                </span>
                <span className="cluster-card-content">
                  <strong className="cluster-card-title">{cluster.name}</strong>
                  <span className="cluster-card-description-text">{clusterCardDescriptions[cluster.slug] || cluster.description}</span>
                  <span className="cluster-card-link">Explore services <span aria-hidden="true">→</span></span>
                </span>
              </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
