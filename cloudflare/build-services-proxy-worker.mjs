// Generate a standalone, dashboard-pasteable Worker from the exact URL directory.
import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync(new URL('../src/reference-pages/catalog.json', import.meta.url), 'utf8'));
const read = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const retained = read('../src/reference-pages/retained-catalog.json');
const migrations = read('../data/service-url-migrations.json');
const collections = read('../data/service-collection-aliases.json');
const taxonomy = read('../data/service-taxonomy.json');
const paths = new Set(['/services']);
for (const slug of Object.keys({...migrations.directoryCategories, ...collections, commercial: 'commercial', 'air-quality': 'air-quality', 'commercial-hvac': 'commercial'})) paths.add(`/services/${slug}`);
function addAliases(page) {
  for (const slug of new Set([page.slug, page.legacySlug].filter(Boolean))) {
    for (const path of [`/services/${slug}`, `/services/${slug}/chicago`, `/services/${page.clusterSlug}/${slug}`, `/services/${page.clusterSlug}/${slug}/chicago`]) paths.add(path);
  }
}
for (const page of [...catalog, ...retained]) addAliases(page);
for (const page of taxonomy.services) if (migrations.overlaps[page.slug]) addAliases(page);
if (catalog.length !== 24 || retained.length !== 17 || [...catalog, ...retained].some(page => !page.livePath.startsWith('/services/'))) {
  throw new Error('Invalid finalized navbar service URL catalog');
}
const file = new URL('./services-proxy-worker.mjs', import.meta.url);
const source = fs.readFileSync(file, 'utf8');
const generated = '// BEGIN SERVICE LANDING PATHS\nconst SERVICE_LANDING_PATHS = new Set([\n' +
  [...paths].sort().map(path => `  '${path}',`).join('\n') + '\n]);\n// END SERVICE LANDING PATHS';
const updated = source.replace(/\/\/ BEGIN SERVICE LANDING PATHS[\s\S]*?\/\/ END SERVICE LANDING PATHS/, generated);
if (!source.includes('// BEGIN SERVICE LANDING PATHS')) throw new Error('Missing Worker path markers');
fs.writeFileSync(file, updated);
console.log(`Worker synchronized: 41 landing pages, collections and ${paths.size} known paths including aliases.`);
