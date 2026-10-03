// Compatibility command: a generic prefix proxy no longer needs URL generation.
import fs from 'node:fs';
const source = fs.readFileSync(new URL('./services-proxy-worker.mjs', import.meta.url), 'utf8');
if (source.includes('SERVICE_LANDING_PATHS') || !source.includes("const BASE_PATH = '/services'")) {
  throw new Error('Expected a generic /services proxy without a keyword allowlist');
}
console.log('Generic /services proxy verified. New pages need no Worker regeneration.');
