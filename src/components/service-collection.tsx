'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'
import {prepareCollectionItems, type CollectionItem} from '@/lib/collection-items'

export type {CollectionItem}

type Props = {
  pages: CollectionItem[]
  level?: 'service' | 'area'
  kicker?: string
  heading?: string
  description?: string
}

export function ServiceCollection({
  pages,
  level = 'area',
  kicker = 'Explore our services',
  heading = 'Find the right HVAC service',
  description = 'Browse locally focused service pages for heating, cooling, air quality, and commercial HVAC needs across Chicago.',
}: Props) {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('All areas')
  const stablePages = useMemo(() => {
    const prepared = prepareCollectionItems(pages)
    if (level === 'area') return prepared
    return prepared.filter((page, index) => prepared.findIndex((candidate) => candidate.serviceSlug === page.serviceSlug) === index)
  }, [level, pages])
  const areas = useMemo(() => ['All areas', ...Array.from(new Set(stablePages.map((page) => page.areaName))).sort()], [stablePages])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return stablePages.filter((page) => {
      const matchesArea = area === 'All areas' || page.areaName === area
      const haystack = `${page.serviceName} ${page.areaName} ${page.metaDescription || ''}`.toLowerCase()
      return matchesArea && (!term || haystack.includes(term))
    })
  }, [area, query, stablePages])

  return (
    <section className="collection-directory" aria-labelledby="service-directory-title">
      <div className="collection-wrap">
        <div className="collection-directory-heading">
          <div>
            <p className="collection-kicker">{kicker}</p>
            <h2 id="service-directory-title">{heading}</h2>
          </div>
          <p>{description}</p>
        </div>
        <div className="collection-toolbar">
          <label>
            <span>Search services</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by service or area" type="search" />
          </label>
          {level === 'area' && areas.length > 2 && <div className="collection-area-filter" aria-label="Filter by area">
            {areas.map((item) => <button type="button" aria-pressed={area === item} onClick={() => setArea(item)} key={item}>{item}</button>)}
          </div>}
          <p className="collection-result-count" aria-live="polite">Showing <strong>{filtered.length}</strong> of {stablePages.length} {level === 'service' ? 'services' : 'local pages'}</p>
        </div>
        {!stablePages.length && <p className="setup-note">The Sanity dataset has no publishable service pages. Confirm each page has both a service and an area, or import the starter content.</p>}
        {stablePages.length > 0 && filtered.length === 0 && <div className="collection-empty"><h3>No matching services</h3><p>Try a broader service name or clear the search.</p><button type="button" onClick={() => {setQuery(''); setArea('All areas')}}>Clear filters</button></div>}
        <div className="collection-card-grid">
          {filtered.map((page) => (
            <Link className="collection-card" data-card-image={page.cardImage} href={level === 'service' ? `/${page.serviceSlug}` : `/${page.serviceSlug}/${page.areaSlug}`} key={page._id}>
              <span className={`collection-card-media${page.cardImage ? '' : ' collection-card-media-empty'}`} style={page.cardImage ? {backgroundImage: `linear-gradient(180deg, rgba(9,38,58,0) 45%, rgba(9,38,58,.14)), url("${page.cardImage}")`} : undefined} role="img" aria-label={`${page.serviceName} in ${page.areaName}`}>
                {!page.cardImage && <span aria-hidden="true">CS</span>}
              </span>
              <span className="collection-card-arrow" aria-hidden="true">→</span>
              <span className="collection-card-content">
                <span className="collection-card-area">{level === 'service' ? 'Service collection' : page.areaName}</span>
                <strong>{page.serviceName}</strong>
                {page.metaDescription && <span className="collection-card-description">{page.metaDescription}</span>}
                {page.monthlySearchVolume ? <span className="collection-card-volume">{page.monthlySearchVolume.toLocaleString('en-US')} monthly searches</span> : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
