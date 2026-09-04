# HVAC service-cluster architecture

The public service library follows the taxonomy in `HVAC_Keyword_Clusters.xlsx`, primarily the `Clusters` and `Listicle Titles` tabs.

## Public hierarchy

1. `/services` — cluster collection
2. `/services/{cluster-slug}` — services assigned to one cluster
3. `/services/{service-slug}` — available area pages for one service
4. `/services/{service-slug}/{area-slug}` — the standard Sanity-driven service landing page

The intermediate pages do not duplicate landing-page content. They organize the existing pages and derive their cards, images, descriptions, volumes, and availability from the same `servicePage`, `serviceDefinition`, and `serviceArea` records.

## Workbook mapping

| Order | Cluster | Slug | Service IDs | Rule |
| --- | --- | --- | --- | --- |
| 1 | Heating & Hot Water | `heating` | 301, 303, 306, 308, 321, 324 | Equipment that creates heat or hot water. |
| 2 | Cooling | `cooling` | 302, 310, 314 | Equipment that removes heat. |
| 3 | Whole-System HVAC & Controls | `hvac-systems` | 304, 305, 311 | Whole-system work and controls. |
| 4 | Indoor Air Quality & Ventilation | `indoor-air-quality-ventilation` | 307, 315, 316, 317, 319, 320, 322, 323 | Air movement, filtration, humidity and ventilation. |
| 5 | Fireplace, Chimney & Solid Fuel | `fireplace-chimney` | 309, 312, 313 | Scope-flagged hearth and chimney work. |
| 6 | Commercial & Specialty | `commercial-specialty` | 318, 325 | Scope-flagged commercial or adjacent-trade work. |

The source workbook also lists **Fans (General/Portable)** under Indoor Air Quality & Ventilation. It intentionally has no service ID or page because its dominant intent is retail. Whole-house-fan intent belongs under ventilation and exhaust fans.

## Sanity relationships

- `serviceCluster` stores the cluster name, slug, public description, workbook order, volumes, source IDs, and internal scope note.
- `serviceDefinition.cluster` is a required reference to one `serviceCluster`.
- `serviceDefinition.scopeStatus` preserves the workbook’s core, adjacent, confirm, low-value, or out-of-scope decision.
- `servicePage.service` connects an area-specific landing page to its service definition.
- `servicePage.area` connects that page to its service area.

This relationship makes one landing page resolve upward through `servicePage → serviceDefinition → serviceCluster` without copying taxonomy text into every page.

## Visibility and publishing rules

- A cluster appears publicly only when the current Sanity perspective contains at least one valid service page assigned to it.
- A service appears inside its cluster only when it has at least one valid area landing page.
- Draft landing pages remain drafts. Importing taxonomy does not publish or unpublish them.
- `confirm`, `low-value`, and `out-of-scope` are editorial warnings, not automatic publication changes. An editor must confirm company capability before publishing a flagged page.
- General/portable fan pages must not be generated unless the taxonomy decision is intentionally changed.

## Content workflow

1. Add or update a cluster in Sanity.
2. Create the service definition and assign its cluster and scope status.
3. Create the relevant area record if it does not exist.
4. Create the service page by referencing the service, area, and standard template.
5. Review the collection path and final landing page in Presentation mode.
6. Publish only after service scope and page content are approved.

Run `pnpm content:import-clusters -- --dry-run` to inspect the workbook mapping, then `pnpm content:import-clusters` to create the six cluster documents and patch existing service definitions without changing landing-page publication states.
