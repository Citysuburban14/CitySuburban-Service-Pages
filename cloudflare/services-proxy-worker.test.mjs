// Run: node cloudflare/services-proxy-worker.test.mjs
import worker from './services-proxy-worker.mjs';
const calls = [];
globalThis.fetch = async (input) => { calls.push(typeof input === 'string' ? input : input.url); return new Response('ok', {status: 200}); };
const V = 'https://city-suburban-service-pages.vercel.app';
const cases = [
  // exact-keyword pages: proxied to the app at the SAME path, no redirect
  ['https://citysuburbanheating.com/services/heating/heater-repair/', 200, null, `${V}/services/heating/heater-repair/`],
  ['https://citysuburbanheating.com/services/air-quality/dehumidifier-installation/', 200, null, `${V}/services/air-quality/dehumidifier-installation/`],
  ['https://citysuburbanheating.com/services/cooling/heat-pump-services/?utm=x', 200, null, `${V}/services/cooling/heat-pump-services/?utm=x`],
  // duplicates: 301 to the URL that carries the page
  ['https://citysuburbanheating.com/services/cooling/air-conditioning-repair/', 301, 'https://citysuburbanheating.com/services/cooling/air-conditioning-installation/'],
  ['https://www.citysuburbanheating.com/services/Heating/Heat-Pump', 301, 'https://www.citysuburbanheating.com/services/cooling/heat-pump-services/'],
  // stays on WordPress
  ['https://citysuburbanheating.com/services/heating/heater-installation/', 200, null, 'https://citysuburbanheating.com/services/heating/heater-installation/'],
  ['https://citysuburbanheating.com/services/commercial/custom-hvac-maintenance-plan/', 200, null, 'https://citysuburbanheating.com/services/commercial/custom-hvac-maintenance-plan/'],
  // new collection and new-only pages: app
  ['https://citysuburbanheating.com/services/', 200, null, `${V}/services/`],
  ['https://citysuburbanheating.com/services/heating/furnace-repair-installation/', 200, null, `${V}/services/heating/furnace-repair-installation/`],
];
let fail = 0;
for (const [url, status, loc, origin] of cases) {
  calls.length = 0;
  const r = await worker.fetch(new Request(url));
  const ok = r.status === status && (loc === null || r.headers.get('Location') === loc) && (!origin || calls[0] === origin);
  if (!ok) fail++;
  console.log(ok ? 'PASS' : 'FAIL', r.status, url, '->', r.headers.get('Location') || calls[0] || '');
}
console.log(fail ? `${fail} failed` : 'all passed'); process.exit(fail ? 1 : 0);
