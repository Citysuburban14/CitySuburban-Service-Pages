import fs from 'node:fs'
import catalog from '../src/reference-pages/catalog.json'
import retained from '../src/reference-pages/retained-catalog.json'
import migrations from '../data/service-url-migrations.json'

const text = `# Service URL directory

The collection entry is **Services → /services/**. Its existing collection and category layouts are preserved. The live Heating, Cooling, Air Quality and Commercial dropdown keywords use the exact 24 paths in the updated GitHub directory. The app supports those paths; the live WordPress proxy rollout is a later step.

## Finalized navbar services

| Service | Exact landing path |
| --- | --- |
${catalog.map((page) => `| ${page.name} | ${page.livePath} |`).join('\n')}

## Retained extra keyword pages

These preserve their keyword/category slugs and source content while adopting the finalized standard design. The application base is now /services/ for every page. Previous /service/ paths permanently redirect to their plural equivalent. They appear after the navbar services in the appropriate collection. Existing scope/review status is preserved; no documents were published by this update.

| Service | App path | Collection |
| --- | --- | --- |
${retained.map((page) => `| ${page.name} | ${page.livePath} | ${page.directoryClusterSlug} |`).join('\n')}

## Consolidated old keywords

The app's existing single-keyword, category/keyword and Chicago-area aliases for these eight services permanently redirect to the canonical GitHub keyword path. Next uses HTTP **308**, which preserves request methods. Distinct extra keyword pages are not redirected into unrelated categories. Source Sanity documents are preserved; duplicated directory cards are removed.

| Old keyword | Destination |
| --- | --- |
${Object.entries(migrations.overlaps).map(([slug, target]) => `| ${slug} | ${target} |`).join('\n')}

## Sanity and schema markup

All 41 designs use the same responsive CSS and editable ordered section model. Each draft stores card fields, SEO metadata, exact path, canonical URL, key phrases and JSON-LD. The shared standard template draft is version 2.0.0 (October 2026). Original service copy, media, scope status and keyword research remain available in source records. The 24 navbar pages preserve the finalized reference content; the 17 additional pages preserve their own content in the same design.

The schema graph includes the service, page, business, breadcrumbs and visible FAQs. Canonical/page URLs match the directory. Collections, landing pages, Studio, APIs and assets all use /services/. The source reports eight navbar pages needing specific photos; its existing image slots are preserved.

No live Cloudflare routes, WordPress navbar or Sanity publication were changed by this setup. Next renders all 41 pages natively under /services/ and redirects known old /service/ page URLs with HTTP 308. The standalone Cloudflare Worker covers every listed page, collection, alias, asset and API. Unknown paths and neighborhood pages pass through to WordPress. Follow [the updated Cloudflare rollout guide](CLOUDFLARE_PROXY.md) to activate it at the live origin.
`
fs.writeFileSync('docs/service-url-directory.md', text)
console.log(`Wrote URL directory: ${catalog.length} navbar pages, ${retained.length} retained pages, ${Object.keys(migrations.overlaps).length} aliases.`)
