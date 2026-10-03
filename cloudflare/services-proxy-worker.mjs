// Cloudflare Worker for the new service pages on citysuburbanheating.com
//
// Routes (one per host): citysuburbanheating.com/service*  and  www.citysuburbanheating.com/service*
// That pattern also matches /services/... and /service-areas/..., which this Worker handles too.
//
// What happens to each request, in order:
//   /service and /service/...  -> the Vercel + Sanity app (basePath /service), except the
//                                 WordPress pages in KEEP_ON_WORDPRESS.
//   anything else (/services/..., /service-areas/, /service-area/...) -> WordPress, untouched.
//
// There are no redirects. The live /services/... pages keep working on WordPress until
// a decision is made for each keyword.
//
// Paths are compared lowercased and without a trailing slash.

const ORIGIN = 'https://city-suburban-service-pages.vercel.app';

// WordPress pages under /service/ that the app has no page for.
const KEEP_ON_WORDPRESS = new Set([
  '/service/air-quality',
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

    return fetch(request);
  },
};

export default worker;
