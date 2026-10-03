// Run: node cloudflare/services-proxy-worker.test.mjs
import worker from './services-proxy-worker.mjs';

const calls = [];
globalThis.fetch = async (input) => {
  calls.push(typeof input === 'string' ? input : input.url);
  return new Response('ok', {status: 200});
};

const S = 'https://citysuburbanheating.com';
const V = 'https://city-suburban-service-pages.vercel.app';
const WP = (path) => `${S}${path}`;

// [request URL, expected status, expected Location or null, expected upstream URL or null]
const cases = [
  // App: collection, the 3 hub URLs replaced in place, landing pages, assets, API
  [`${S}/service/`, 200, null, `${V}/service/`],
  [`${S}/service`, 200, null, `${V}/service`],
  [`${S}/service/heating/`, 200, null, `${V}/service/heating/`],
  [`${S}/service/air-quality/`, 200, null, `${V}/service/air-quality/`],
  [`${S}/service/heating/heater-repair/?utm=x`, 200, null, `${V}/service/heating/heater-repair/?utm=x`],
  [`${S}/service/heating/furnace-repair-installation/`, 200, null, `${V}/service/heating/furnace-repair-installation/`],
  [`${S}/service/_next/static/chunk.js`, 200, null, `${V}/service/_next/static/chunk.js`],
  [`${S}/service/api/lead/`, 200, null, `${V}/service/api/lead/`],
  // WordPress-only pages under /service/
  [`${S}/service/commercial-hvac/`, 200, null, WP('/service/commercial-hvac/')],
  [`${S}/service/heating-services/`, 200, null, WP('/service/heating-services/')],
  // The 10 old /services/ pages: one 301 each
  [`${S}/services/heating/heater-repair/`, 301, `${S}/service/heating/heater-repair/`],
  [`${S}/services/air-quality/duct-repair/`, 301, `${S}/service/air-quality/duct-repair/`],
  [`https://www.citysuburbanheating.com/services/Cooling/Heat-Pump-Services?x=1`, 301, 'https://www.citysuburbanheating.com/service/cooling/heat-pump-services/?x=1'],
  [`${S}/services/cooling/air-conditioning-repair/`, 301, `${S}/service/cooling/air-conditioning-installation/`],
  [`${S}/services/heating/heat-pump/`, 301, `${S}/service/cooling/heat-pump-services/`],
  // Everything else under /services/ stays on WordPress
  [`${S}/services/heating/heater-installation/`, 200, null, WP('/services/heating/heater-installation/')],
  [`${S}/services/commercial/custom-hvac-maintenance-plan/`, 200, null, WP('/services/commercial/custom-hvac-maintenance-plan/')],
  // Paths that only share the prefix are never touched
  [`${S}/service-areas/`, 200, null, WP('/service-areas/')],
  [`${S}/service-area/lincoln-park/`, 200, null, WP('/service-area/lincoln-park/')],
];

let fail = 0;
for (const [url, status, loc, upstream] of cases) {
  calls.length = 0;
  const r = await worker.fetch(new Request(url));
  const ok = r.status === status
    && (loc === null || r.headers.get('Location') === loc)
    && (upstream === undefined || upstream === null ? calls.length === 0 : calls[0] === upstream);
  if (!ok) fail++;
  console.log(ok ? 'PASS' : 'FAIL', r.status, url, '->', r.headers.get('Location') || calls[0] || '');
}
console.log(fail ? `${fail} failed` : `all ${cases.length} passed`);
process.exit(fail ? 1 : 0);
