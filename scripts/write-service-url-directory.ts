import fs from 'node:fs'
import catalog from '../src/reference-pages/catalog.json'
import retained from '../src/reference-pages/retained-catalog.json'
import migrations from '../data/service-url-migrations.json'

const text = `# Service URL directory

The collection entry is **Services → /service/**. Its existing collection and category layouts are preserved. The live Heating, Cooling, Air Quality and Commercial dropdown keywords use the exact 24 paths in the updated GitHub directory. The app supports those paths; the live WordPress proxy rollout is a later step.

## Finalized navbar services

| Service | Exact landing path |
| --- | --- |
${catalog.map((page) => `| ${page.name} | ${page.livePath} |`).join('\n')}

## Retained extra keyword pages

These keep their original app paths and source content while adopting the finalized standard design. They appear after the navbar services in the appropriate collection. Existing scope/review status is preserved; no documents were published by this update.

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

The schema graph includes the service, page, business, breadcrumbs and visible FAQs. Canonical/service/page URLs match the directory. Collection navigation uses /service/; navbar landing URLs use /services/. The source reports eight navbar pages needing specific photos; its existing image slots are preserved.

No Cloudflare Worker rules, WordPress navbar, Sanity publication or production proxy routing were changed. The internal Next proxy only makes the exact landing paths render in this app. Deploying/activating those pages at the live origin is a separate rollout.
`
fs.writeFileSync('docs/service-url-directory.md', text)
console.log(`Wrote URL directory: ${catalog.length} navbar pages, ${retained.length} retained pages, ${Object.keys(migrations.overlaps).length} aliases.`)
