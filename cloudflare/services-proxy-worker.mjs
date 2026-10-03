// Cloudflare Worker for the new service pages on citysuburbanheating.com
//
// Prepared rollout: one route per host, citysuburbanheating.com/service*
// and www.citysuburbanheating.com/service*. See docs/CLOUDFLARE_PROXY.md.
// The exact 24 /services/... landing URLs and the /service app go to Vercel.
// Unmigrated service URLs, neighborhood pages and legacy footer hubs stay on WordPress.
// The app handles old keyword redirects; the Worker relays their status/Location.

const ORIGIN = 'https://city-suburban-service-pages.vercel.app';

// BEGIN SERVICE LANDING PATHS
const SERVICE_LANDING_PATHS = new Set([
  '/services/heating/heater-repair',
  '/services/heating/boiler-service',
  '/services/heating/heat-pump',
  '/services/heating/hybrid-heating-systems',
  '/services/heating/hvac-maintenance-plans',
  '/services/heating/heater-installation',
  '/services/heating/heater-maintenance',
  '/services/cooling/ductless-hvac-service',
  '/services/cooling/air-conditioning-repair',
  '/services/cooling/air-conditioning-maintenance',
  '/services/cooling/air-conditioning-installation',
  '/services/cooling/cooling-maintenance-plans',
  '/services/cooling/heat-pump-services',
  '/services/air-quality/dehumidifier-installation',
  '/services/air-quality/indoor-air-quality-test',
  '/services/air-quality/duct-repair',
  '/services/air-quality/duct-maintenance',
  '/services/air-quality/humidifier-air-cleaner',
  '/services/commercial/commercial-hvac-system-installation',
  '/services/commercial/commercial-hvac-system-replacement',
  '/services/commercial/emergency-routine-commercial-hvac-repairs',
  '/services/commercial/energy-efficient-hvac-upgrades',
  '/services/commercial/custom-hvac-maintenance-plan',
  '/services/commercial/ductwork-design-repair-services',
]);
// END SERVICE LANDING PATHS

// Legacy footer hubs/test page retained on WordPress. The app now supports
// /service/air-quality and /service/commercial-hvac, so those are no longer excluded.
const KEEP_ON_WORDPRESS = new Set([
  '/service/commercial-hvac-service',
  '/service/heating-services',
  '/service/cooling-services',
  '/service/air-quality-service',
  '/service/cooling-test',
]);

function isUnder(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

async function proxyToApp(request, url) {
  const publicHost = url.host;
  const headers = new Headers(request.headers);
  headers.delete('Host'); // Fetch uses the Vercel hostname for upstream routing.
  headers.set('X-Forwarded-Host', publicHost);
  headers.set('X-Forwarded-Proto', 'https');

  const res = await fetch(new URL(url.pathname + url.search, ORIGIN).toString(), {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  });

  const out = new Headers(res.headers);
  const loc = out.get('Location');
  if (loc) {
    const destination = new URL(loc, ORIGIN);
    if (destination.origin === ORIGIN && /^(https?:)?\/\//.test(loc)) {
      out.set('Location', `https://${publicHost}${destination.pathname}${destination.search}${destination.hash}`);
    }
  }
  out.set('X-CitySuburban-Proxy', 'vercel');
  return new Response(res.body, {status: res.status, statusText: res.statusText, headers: out});
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.pathname.replace(/\/+$/, '') || '/';

    if (SERVICE_LANDING_PATHS.has(key)) return proxyToApp(request, url);

    if (isUnder(key, '/service')) {
      // A same-zone subrequest goes to WordPress and does not re-run this Worker.
      return KEEP_ON_WORDPRESS.has(key) ? fetch(request) : proxyToApp(request, url);
    }

    return fetch(request);
  },
};

export default worker;
