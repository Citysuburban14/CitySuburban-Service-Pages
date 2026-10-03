import fs from 'node:fs'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {CollectionHeader} from '../src/components/collection-chrome'

const images: Record<string, string> = {
  'heater-repair': 'reference-assets/svc-heating-repair.jpg',
  'boiler-service': 'reference-assets/job-boiler-1.jpg',
  'heat-pump': 'reference-assets/as-heat-pump.png',
  'hybrid-heating-systems': 'reference-assets/as-gold-14-hybrid-comfort-packaged-system.jpg',
  'hvac-maintenance-plans': 'reference-assets/job-furnace-3.jpg',
  'heater-installation': 'reference-assets/svc-heating-installation.jpg',
  'heater-maintenance': 'reference-assets/job-furnace-1.jpg',
  'ductless-hvac-service': 'reference-assets/svc-ductless.jpg',
  'air-conditioning-repair': 'reference-assets/svc-maintenance-plans.jpg',
  'air-conditioning-maintenance': 'reference-assets/as-coil.png',
  'air-conditioning-installation': 'reference-assets/as-ac.png',
  'cooling-maintenance-plans': 'reference-assets/svc-heating-maintenance.jpg',
  'heat-pump-services': 'reference-assets/svc-heat-pumps.jpg',
  'dehumidifier-installation': 'images/services/city-suburban/316-325/dehumidifier.jpg',
  'indoor-air-quality-test': 'reference-assets/as-air-purification-system.jpg',
  'duct-repair': 'images/service-cards/duct-repair.jpg',
  'duct-maintenance': 'images/service-cards/duct-maintenance.jpg',
  'humidifier-air-cleaner': 'reference-assets/as-steam-humidifier.jpg',
  'commercial-hvac-system-installation': 'images/services/city-suburban/306-315/mechanical-room.jpg',
  'commercial-hvac-system-replacement': 'images/services/city-suburban/rooftop-ac-condensers.jpg',
  'emergency-routine-commercial-hvac-repairs': 'reference-assets/hero-heating.jpg',
  'energy-efficient-hvac-upgrades': 'images/services/city-suburban/306-315/smart-heating-control.jpg',
  'custom-hvac-maintenance-plan': 'images/services/city-suburban/306-315/digital-thermostat-wall-plate.jpg',
  'ductwork-design-repair-services': 'images/service-cards/commercial-ductwork.jpg',
  'dryer-vent-cleaning-repair': 'images/service-cards/dryer-vent.jpg',
}

const header = `<div data-module="site-header">${renderToStaticMarkup(<CollectionHeader />)}</div>`
for (const file of ['catalog.json', 'retained-catalog.json']) {
  const location = `src/reference-pages/${file}`
  const pages = JSON.parse(fs.readFileSync(location, 'utf8'))
  for (const page of pages) {
    if (images[page.slug]) page.cardImage = `/services/${images[page.slug]}`
    const path = `src/reference-pages/${page.referenceFile}`
    const snapshot = JSON.parse(fs.readFileSync(path, 'utf8'))
    const section = snapshot.sections.find((section: {module: string}) => section.module === 'site-header')
    if (section) {
      snapshot.html = snapshot.html.replace(section.html, header)
      section.html = header
      section.contentFields = [] // Shared navigation is edited centrally, not per page.
    }
    fs.writeFileSync(path, JSON.stringify(snapshot) + '\n')
  }
  fs.writeFileSync(location, JSON.stringify(pages, null, 2) + '\n')
}
console.log('Updated shared header snapshots and distinct service card images.')
