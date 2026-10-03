// Cloudflare Worker for the new service pages on citysuburbanheating.com
//
// Routes (one per host): citysuburbanheating.com/service*  and  www.citysuburbanheating.com/service*
// That pattern also matches /services/... and /service-areas/..., which this Worker handles too.
//
// What happens to each request, in order:
//   /service and /service/...  -> the Vercel + Sanity app (basePath /service), except the
//                                 WordPress-only pages in KEEP_ON_WORDPRESS.
//                                 /service/heating/, /service/cooling/ and /service/air-quality/
//                                 are live WordPress hub URLs that the app's cluster pages now
//                                 replace in place.
//   /services/...              -> the 10 old WordPress pages whose keyword matches a new page
//                                 get a 301 to that page. Everything else stays on WordPress.
//   anything else (/service-areas/, /service-area/...) -> WordPress, untouched.
//
// Paths are compared lowercased and without a trailing slash.

const ORIGIN = 'https://city-suburban-service-pages.vercel.app';

// Old WordPress URL -> new page. The first 8 are the same keyword; the last 2 are
// duplicates of a page that already has one of the first 8.
const REDIRECTS = {
  '/services/heating/heater-repair': '/service/heating/heater-repair/',
  '/services/heating/boiler-service': '/service/heating/boiler-service/',
  '/services/cooling/air-conditioning-installation': '/service/cooling/air-conditioning-installation/',
  '/services/cooling/ductless-hvac-service': '/service/cooling/ductless-hvac-service/',
  '/services/cooling/heat-pump-services': '/service/cooling/heat-pump-services/',
  '/services/air-quality/dehumidifier-installation': '/service/air-quality/dehumidifier-installation/',
  '/services/air-quality/indoor-air-quality-test': '/service/air-quality/indoor-air-quality-test/',
  '/services/air-quality/duct-repair': '/service/air-quality/duct-repair/',
  '/services/cooling/air-conditioning-repair': '/service/cooling/air-conditioning-installation/',
  '/services/heating/heat-pump': '/service/cooling/heat-pump-services/',
};

// WordPress pages under /service/ that the app has no equivalent for.
const KEEP_ON_WORDPRESS = new Set([
  '/service/commercial-hvac',
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
  if (loc && loc.startsWith(ORIGIN)) out.set('Location', loc.replace(ORIGIN, `https://${publicHost}`));
  return new Response(res.body, {status: res.status, statusText: res.statusText, headers: out});
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);
    const key = url.pathname.toLowerCase().replace(/\/+$/, '') || '/';

    if (isUnder(key, '/service')) {
      // A same-zone subrequest goes to WordPress and does not re-run this Worker.
      return KEEP_ON_WORDPRESS.has(key) ? fetch(request) : proxyToApp(request, url);
    }

    if (isUnder(key, '/services')) {
      const target = REDIRECTS[key];
      if (target) return Response.redirect(`https://${url.host}${target}${url.search}`, 301);
    }

    return fetch(request);
  },
};

export default worker;
