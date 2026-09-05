'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import {useState} from 'react'
import {clusterPath, type PreparedCluster} from '@/lib/service-navigation'

const clusterCardDescriptions: Record<string, string> = {
  heating: 'Furnaces, boilers, water heaters, radiant heat, and dependable home-heating service.',
  cooling: 'Central air, ductless mini-splits, and room AC solutions for reliable summer comfort.',
  'hvac-systems': 'Complete HVAC installation, controls, thermostats, maintenance, and system support.',
  'indoor-air-quality-ventilation': 'Cleaner-air solutions including duct care, ventilation, humidification, and filtration.',
  'fireplace-chimney': 'Fireplace, chimney, gas-log, and solid-fuel services for safe, comfortable homes.',
  'commercial-specialty': 'Commercial equipment and specialty HVAC service for Chicago properties and facilities.',
}

const clusterFilterLabels: Record<string, string> = {
  heating: 'Heating',
  cooling: 'Cooling',
  'hvac-systems': 'HVAC systems',
  'indoor-air-quality-ventilation': 'Air quality',
  'fireplace-chimney': 'Fireplace',
  'commercial-specialty': 'Commercial',
}

function optimizedImageUrl(source: string) {
  if (!source.includes('cdn.sanity.io/images/')) return source
  const separator = source.includes('?') ? '&' : '?'
  return `${source}${separator}auto=format&fit=crop&w=720&q=76`
}

export function ClusterCollection({clusters}: {clusters: PreparedCluster[]}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const visibleClusters = activeFilter === 'all' ? clusters : clusters.filter((cluster) => cluster.slug === activeFilter)

  return (
    <section className="collection-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="cluster-directory-heading">
          <div>
            <p className="cluster-directory-eyebrow">Find your system</p>
            <h2 className="collection-kicker" id="service-directory-title">Explore by system</h2>
          </div>
          <p>Choose the system you need help with, then view every available service in that category.</p>
        </div>

        {clusters.length > 0 && (
          <div className="cluster-filter-bar" aria-label="Filter service systems">
            <button type="button" aria-pressed={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>All systems</button>
            {clusters.map((cluster) => (
              <button
                type="button"
                aria-pressed={activeFilter === cluster.slug}
                key={cluster.id}
                onClick={() => setActiveFilter(cluster.slug)}
              >
                {clusterFilterLabels[cluster.slug] || cluster.name}
              </button>
            ))}
          </div>
        )}

        <p className="cluster-filter-status" aria-live="polite">
          Showing {visibleClusters.length} of {clusters.length} service systems
        </p>

        {!clusters.length && <p className="setup-note">No published service clusters are available yet. Import the workbook taxonomy and confirm that each service definition is assigned to a cluster.</p>}
        <div className="cluster-card-grid" data-filter={activeFilter}>
          {visibleClusters.map((cluster) => {
            const visibleServices = cluster.services.slice(0, 3)
            const remainingServices = Math.max(0, cluster.services.length - visibleServices.length)
            return (
              <Link
                aria-label={`View all ${cluster.name} services`}
                className="cluster-card"
                data-system={cluster.slug}
                href={clusterPath(cluster.slug)}
                key={cluster.id}
              >
                <span className={`cluster-card-media${cluster.cardImage ? '' : ' cluster-card-media-empty'}`}>
                  {cluster.cardImage ? (
                    <img alt={`${cluster.name} HVAC equipment`} decoding="async" loading="lazy" src={optimizedImageUrl(cluster.cardImage)} />
                  ) : (
                    <span className="cluster-card-placeholder" aria-hidden="true">CS</span>
                  )}
                  <span className="cluster-card-tag">HVAC system</span>
                  <span className="cluster-card-count">{cluster.services.length} {cluster.services.length === 1 ? 'service' : 'services'}</span>
                  <strong className="cluster-card-title">{cluster.name}</strong>
                </span>
                <span className="cluster-card-content">
                  <span className="cluster-card-description-text">{clusterCardDescriptions[cluster.slug] || cluster.description}</span>
                  <span className="cluster-card-services" aria-label={`Featured ${cluster.name} services`}>
                    {visibleServices.map((service) => <span className="cluster-card-service-chip" key={service.slug}>{service.name}</span>)}
                    {remainingServices > 0 && <span className="cluster-card-service-chip cluster-card-more-chip">+{remainingServices} more</span>}
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
