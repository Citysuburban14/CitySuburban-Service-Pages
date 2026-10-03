# Service URL directory

The collection entry is **Services → /services/**. Its existing collection and category layouts are preserved. The live Heating, Cooling, Air Quality and Commercial dropdown keywords use the exact 24 paths in the updated GitHub directory. The app supports those paths; the live WordPress proxy rollout is a later step.

## Finalized navbar services

| Service | Exact landing path |
| --- | --- |
| Heater repair | /services/heating/heater-repair/ |
| Boiler Services | /services/heating/boiler-service/ |
| Heat Pump | /services/heating/heat-pump/ |
| Hybrid Heating Systems | /services/heating/hybrid-heating-systems/ |
| HVAC Maintenance Plans | /services/heating/hvac-maintenance-plans/ |
| Heater Installation | /services/heating/heater-installation/ |
| Heater Maintenance | /services/heating/heater-maintenance/ |
| Ductless HVAC Services | /services/cooling/ductless-hvac-service/ |
| Air Conditioning Repair | /services/cooling/air-conditioning-repair/ |
| Air Conditioning Maintenance | /services/cooling/air-conditioning-maintenance/ |
| Air Conditioning Installation | /services/cooling/air-conditioning-installation/ |
| Cooling Maintenance Plans | /services/cooling/cooling-maintenance-plans/ |
| Heat Pump Services | /services/cooling/heat-pump-services/ |
| Dehumidifier Installation | /services/air-quality/dehumidifier-installation/ |
| Indoor Air Quality Test | /services/air-quality/indoor-air-quality-test/ |
| Duct Repair | /services/air-quality/duct-repair/ |
| Duct Maintenance | /services/air-quality/duct-maintenance/ |
| Humidifier & Air Cleaner | /services/air-quality/humidifier-air-cleaner/ |
| Commercial HVAC System Installation | /services/commercial/commercial-hvac-system-installation/ |
| Commercial HVAC System Replacement | /services/commercial/commercial-hvac-system-replacement/ |
| Emergency & Routine Commercial HVAC Repairs | /services/commercial/emergency-routine-commercial-hvac-repairs/ |
| Energy-Efficient HVAC Upgrades | /services/commercial/energy-efficient-hvac-upgrades/ |
| Custom HVAC Maintenance Plan | /services/commercial/custom-hvac-maintenance-plan/ |
| Ductwork Design & Repair Services | /services/commercial/ductwork-design-repair-services/ |

## Retained extra keyword pages

These preserve their keyword/category slugs and source content while adopting the finalized standard design. The application base is now /services/ for every page. Previous /service/ paths permanently redirect to their plural equivalent. They appear after the navbar services in the appropriate collection. Existing scope/review status is preserved; no documents were published by this update.

| Service | App path | Collection |
| --- | --- | --- |
| Water Heater Repair & Installation | /services/heating/water-heater-repair-installation/ | heating |
| HVAC Repair & Installation | /services/hvac-systems/hvac-repair-installation/ | heating |
| Space & Unit Heater Repair & Installation | /services/heating/space-heater-repair-installation/ | heating |
| Air Duct Cleaning, Repair & Sealing | /services/indoor-air-quality-ventilation/air-duct-cleaning-repair/ | air-quality |
| Gas Fireplace Repair & Installation | /services/fireplace-chimney/gas-fireplace-repair-installation/ | heating |
| Smart Thermostat Installation & Repair | /services/hvac-systems/smart-thermostat-installation-repair/ | heating |
| Wood & Pellet Stove Repair & Installation | /services/fireplace-chimney/wood-pellet-stove-repair-installation/ | heating |
| Chimney Sweeping, Inspection & Repair | /services/fireplace-chimney/chimney-sweeping-inspection-repair/ | heating |
| Window & Portable AC Installation & Repair | /services/cooling/window-portable-ac-installation-repair/ | cooling |
| Ceiling Fan Installation & Repair | /services/indoor-air-quality-ventilation/ceiling-fan-installation-repair/ | air-quality |
| Bathroom & Kitchen Exhaust Fan Service | /services/indoor-air-quality-ventilation/exhaust-fan-installation-repair/ | air-quality |
| Commercial Refrigeration & Ice Machine Service | /services/commercial-specialty/commercial-refrigeration-repair-maintenance/ | commercial |
| Oil & Propane Heating Service | /services/heating/oil-propane-heating-repair-maintenance/ | heating |
| Dryer Vent Cleaning & Repair | /services/indoor-air-quality-ventilation/dryer-vent-cleaning-repair/ | air-quality |
| Attic Fan Installation & Repair | /services/indoor-air-quality-ventilation/attic-fan-installation-repair/ | air-quality |
| Radiator & Radiant Heat Service | /services/heating/radiator-radiant-heat-repair-installation/ | heating |
| Standby Generator Service | /services/commercial-specialty/generator-installation-repair/ | commercial |

## Consolidated old keywords

The app's existing single-keyword, category/keyword and Chicago-area aliases for these eight services permanently redirect to the canonical GitHub keyword path. Next uses HTTP **308**, which preserves request methods. Distinct extra keyword pages are not redirected into unrelated categories. Source Sanity documents are preserved; duplicated directory cards are removed.

| Old keyword | Destination |
| --- | --- |
| air-conditioner-repair-installation | /services/cooling/air-conditioning-repair/ |
| furnace-repair-installation | /services/heating/heater-repair/ |
| heat-pump-repair-installation | /services/cooling/heat-pump-services/ |
| boiler-repair-installation | /services/heating/boiler-service/ |
| ductless-mini-split-installation-repair | /services/cooling/ductless-hvac-service/ |
| indoor-air-quality-testing-installation | /services/air-quality/indoor-air-quality-test/ |
| humidifier-installation-repair | /services/air-quality/humidifier-air-cleaner/ |
| dehumidifier-installation-repair | /services/air-quality/dehumidifier-installation/ |

## Sanity and schema markup

All 41 designs use the same responsive CSS and editable ordered section model. Each draft stores card fields, SEO metadata, exact path, canonical URL, key phrases and JSON-LD. The shared standard template draft is version 2.0.0 (October 2026). Original service copy, media, scope status and keyword research remain available in source records. The 24 navbar pages preserve the finalized reference content; the 17 additional pages preserve their own content in the same design.

The schema graph includes the service, page, business, breadcrumbs and visible FAQs. Canonical/page URLs match the directory. Collections, landing pages, Studio, APIs and assets all use /services/. The source reports eight navbar pages needing specific photos; its existing image slots are preserved.

No live Cloudflare routes, WordPress navbar or Sanity publication were changed by this setup. Next renders all 41 pages natively under /services/ and redirects known old /service/ page URLs with HTTP 308. The standalone Cloudflare Worker covers every listed page, collection, alias, asset and API. Unknown paths and neighborhood pages pass through to WordPress. Follow [the updated Cloudflare rollout guide](CLOUDFLARE_PROXY.md) to activate it at the live origin.
