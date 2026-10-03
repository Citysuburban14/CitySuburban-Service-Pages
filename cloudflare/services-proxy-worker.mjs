// Cloudflare Worker for citysuburbanheating.com/services*
//
// Routes: citysuburbanheating.com/services*  and  www.citysuburbanheating.com/services*
//
// For every request under /services it does exactly one of three things, in this order:
//   1. REDIRECTS: two old WordPress pages whose keyword belongs to a new page that
//      already lives at another old URL -> 301 there (one page cannot have two URLs).
//   2. KEEP_ON_WORDPRESS: old WordPress pages whose keyword no new page targets
//      -> passed through untouched, WordPress keeps answering them.
//   3. Everything else -> the Vercel + Sanity app. That includes the 8 old URLs whose
//      keyword matches a new page exactly: the app now serves those exact URLs
//      (same path, same trailing slash), so they are replaced in place, no redirect.
//
// Paths are compared lowercased and without a trailing slash.

const ORIGIN = 'https://city-suburban-service-pages.vercel.app';

const REDIRECTS = {
  '/services/cooling/air-conditioning-repair': '/services/cooling/air-conditioning-installation/',
  '/services/heating/heat-pump': '/services/cooling/heat-pump-services/',
};

const KEEP_ON_WORDPRESS = new Set([
  // Close to a new page but not the same keyword (decide later: keep or 301)
  '/services/heating/heater-installation',
  '/services/heating/heater-maintenance',
  '/services/heating/hvac-maintenance-plans',
  '/services/cooling/air-conditioning-maintenance',
  '/services/air-quality/duct-maintenance',
  '/services/air-quality/humidifier-air-cleaner',
  // No new page targets this keyword
  '/services/heating/hybrid-heating-systems',
  '/services/cooling/cooling-maintenance-plans',
  '/services/commercial/commercial-hvac-system-installation',
  '/services/commercial/commercial-hvac-system-replacement',
  '/services/commercial/emergency-routine-commercial-hvac-repairs',
  '/services/commercial/energy-efficient-hvac-upgrades',
  '/services/commercial/custom-hvac-maintenance-plan',
  '/services/commercial/ductwork-design-repair-services',
]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const publicHost = url.host;
    const key = url.pathname.toLowerCase().replace(/\/+$/, '') || '/';

    // 1. Old WordPress page with a new equivalent: one permanent redirect.
    const target = REDIRECTS[key];
    if (target) {
      return Response.redirect(`https://${publicHost}${target}${url.search}`, 301);
    }

    // 2. Old WordPress page with no new equivalent: let WordPress answer it.
    //    A same-zone subrequest goes to the origin server and does not re-run this Worker.
    if (KEEP_ON_WORDPRESS.has(key)) {
      return fetch(request);
    }

    // 3. Everything else under /services: the Vercel app (basePath is /services).
    const originUrl = new URL(url.pathname + url.search, ORIGIN);
    const headers = new Headers(request.headers);
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-Forwarded-Proto', 'https');

    const res = await fetch(originUrl.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const out = new Headers(res.headers);
    const loc = out.get('Location');
    if (loc && loc.startsWith(ORIGIN)) out.set('Location', loc.replace(ORIGIN, `https://${publicHost}`));

    return new Response(res.body, {status: res.status, statusText: res.statusText, headers: out});
  },
};
