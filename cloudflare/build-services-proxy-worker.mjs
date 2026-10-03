// Generate a standalone, dashboard-pasteable Worker from the exact URL directory.
import fs from 'node:fs';
const catalog = JSON.parse(fs.readFileSync(new URL('../src/reference-pages/catalog.json', import.meta.url), 'utf8'));
const paths = catalog.map(page => page.livePath.replace(/\/+$/, ''));
if (paths.length !== 24 || new Set(paths).size !== paths.length || paths.some(path => !path.startsWith('/services/'))) {
  throw new Error('Invalid finalized navbar service URL catalog');
}
const file = new URL('./services-proxy-worker.mjs', import.meta.url);
const source = fs.readFileSync(file, 'utf8');
const generated = '// BEGIN SERVICE LANDING PATHS\nconst SERVICE_LANDING_PATHS = new Set([\n' +
  paths.map(path => `  '${path}',`).join('\n') + '\n]);\n// END SERVICE LANDING PATHS';
const updated = source.replace(/\/\/ BEGIN SERVICE LANDING PATHS[\s\S]*?\/\/ END SERVICE LANDING PATHS/, generated);
if (updated === source && !source.includes(paths[0])) throw new Error('Missing Worker path markers');
fs.writeFileSync(file, updated);
console.log(`Worker synchronized with all ${paths.length} exact navbar landing URLs.`);
