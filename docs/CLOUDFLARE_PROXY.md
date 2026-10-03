# Cloudflare service-page proxy: updated rollout guide

Updated 3 October 2026. This guide supersedes the earlier instructions that kept
all `/services/...` pages on WordPress. The prepared Worker has not been activated
in Cloudflare by this update.

## Answer: which rules do we need?

Use one Worker with **two route patterns**, one for each public hostname. Its
routing list includes the exact 24 navbar URLs. The 17 extra keyword pages already
fall under `/service/`. Neither group needs a separate redirect rule per page.

| Request | Updated Worker behavior | Browser URL |
| --- | --- | --- |
| `/service/` | Vercel collection | Same URL |
| `/service/heating/`, `/service/cooling/`, `/service/air-quality/`, `/service/commercial/` | Vercel category collections | Same URL |
| `/service/commercial-hvac/` | Vercel Commercial category alias | Same URL; canonical points to `/service/commercial/` |
| Exact 24 `/services/{category}/{keyword}/` URLs | Vercel landing pages | Same exact live keyword URL |
| 17 retained `/service/{category}/{keyword}/` URLs | Vercel landing pages | Same URL |
| Eight consolidated old keyword URLs under `/service/` | Vercel returns its existing permanent 308 redirect | Changes to the matching canonical keyword URL |
| Other `/services/...` pages outside the 24-page list | WordPress | Same URL |
| `/service-areas/`, `/service-area/lincoln-park/` and other neighborhood pages | WordPress | Existing behavior |

The legacy footer hubs `/service/heating-services/`, `/service/cooling-services/`,
`/service/air-quality-service/`, `/service/commercial-hvac-service/` and the old
`/service/cooling-test/` stay on WordPress. The four current app category URLs
above are supported; the old exclusions for Air Quality and Commercial HVAC have
been removed from the prepared Worker.

See [the complete URL directory](service-url-directory.md) for all 41 paths and
all eight old-keyword mappings.

### Proxy versus redirect

The 24 navbar pages replace the content at their existing URLs. The Worker fetches
Vercel internally, so the visitor keeps the live domain and path. Vercel's Next
proxy handles its internal `/services/` to `/service/` mapping. Do not add a public
301 from each live keyword to Vercel or to the collection.

The eight merged old keywords already redirect inside the app. The Worker relays
the 308 and translates an absolute Vercel Location header to the visitor's public
host. Query strings are retained. No duplicate Cloudflare redirect is needed.
301 is an optional alternative only if you specifically choose a different
redirect policy later; the implemented status is 308.

Actual neighborhood pages are not part of the 41 service-page migration. If those
are migrated later, add their exact public-to-app mappings and route coverage
before switching them. Do not redirect all neighborhoods into a generic service
page.

Cloudflare's dashboard **URL Rewrite Rules** can change a path/query but cannot
change the hostname. The prepared reverse proxy uses a **Worker Route** to fetch
the external Vercel origin. [Cloudflare URL Rewrite documentation](https://developers.cloudflare.com/rules/transform/url-rewrite/)

## What the checks found

Read-only public HTTP checks on 3 October 2026 found:

- All 41 Vercel service landing URLs returned 200, the updated footer/design, and
  the expected live-domain canonical URL.
- All 41 returned `noindex, follow`.
- Live `/services/heating/heater-repair/` still served the original WordPress page.
- Live `/service/` returned 301 to `/service-areas/`.
- Live `/service-area/lincoln-park/` still served WordPress.

These checks do not reveal the Cloudflare account's installed Worker code or the
source of the `/service/` redirect. Verify those in the dashboard before rollout.
The existing repository Worker was outdated: it passed all `/services/...` URLs
through to WordPress.

## Step-by-step setup

### 1. Save the current routing setup

Save the existing Worker code, route patterns, and any matching redirect/rewrite
rules. Keep the existing WordPress service pages for rollback. If the service
Worker already exists, update that Worker rather than creating a duplicate.

Inspect Cloudflare **Rules** (Single/Bulk Redirects, Page Rules and URL rewrites)
and existing Worker Routes for `/service*`. Locate the `/service/` →
`/service-areas/` redirect. If a Cloudflare rule intercepts the collection before
it reaches the Worker, remove that specific match or exclude the collection.
If WordPress produces it, correctly proxying `/service/` to Vercel bypasses it.
Do not remove unrelated WordPress redirects. Cloudflare Trace can help identify
matching rules. [Cloudflare redirect execution and troubleshooting](https://developers.cloudflare.com/rules/url-forwarding/)

### 2. Confirm Vercel production is ready

Use the stable production origin:

```text
https://city-suburban-service-pages.vercel.app
```

It must serve the latest main deployment without a login/protection challenge.
In Vercel Production environment variables, verify:

```text
NEXT_SITE_URL=https://citysuburbanheating.com
NEXT_SANITY_STUDIO_URL=/service/studio
```

Keep the app's `basePath` as `/service`. Redeploy if these values change. Sanity
and lead-delivery credentials stay in Vercel; no Sanity token belongs in the
Cloudflare Worker.

Run the read-only origin check from the repository:

```text
node cloudflare/verify-service-origin.mjs
```

Expect `checked: 41`, `failures: []`. The `noindex` count is reported separately;
it is not a proxy failure.

### 3. Review and publish approved Sanity content

Review the finalized landing-page drafts and shared standard template, then
publish the approved changes. The template and footer changes were saved as
drafts in the preceding updates.

For pages intended for search indexing, complete content/fact/photo approval,
set **factChecksComplete** to true and publish that page. The app deliberately
uses that field as its indexing gate. Publishing a design alone does not clear
`noindex`. Recheck the public robots meta tag afterward. Do not enable this field
on unapproved pages simply to finish the routing step.

### 4. Confirm Cloudflare DNS

In the `citysuburbanheating.com` zone, ensure apex and `www` DNS records are
**Proxied** (orange cloud). Retain the existing WordPress origin records; do not
point the entire website at Vercel or replace the site's origin with a Worker
Custom Domain. Worker Routes run in front of the existing origin.
[Cloudflare Worker Route prerequisites](https://developers.cloudflare.com/workers/configuration/routing/routes/)

### 5. Install the updated Worker

In **Workers & Pages**, open the existing service Worker, or create
`citysuburban-services-proxy` if there is none. Open its code editor and paste the
complete contents of:

```text
cloudflare/services-proxy-worker.mjs
```

Deploy the Worker code. It is standalone: no imports, build step, bindings or
secret tokens are needed when pasting it into the dashboard. Its upstream
`ORIGIN` is already the stable Vercel production URL.

The 24 paths are generated from the directory. If that directory changes later,
regenerate and test before pasting again:

```text
node cloudflare/build-services-proxy-worker.mjs
node cloudflare/services-proxy-worker.test.mjs
```

### 6. Attach two Worker Routes

Open the Worker → **Settings → Domains & Routes → Add → Route**. Choose zone
`citysuburbanheating.com` and attach both patterns to this Worker:

```text
citysuburbanheating.com/service*
www.citysuburbanheating.com/service*
```

`service*` intentionally covers both `/service/` and `/services/`, including the
slashless collection URL. It also matches neighborhood paths, which the code
passes through to WordPress. You do not need 41 individual routes. Check that a
more specific existing route does not override this Worker.
[Cloudflare route setup and matching](https://developers.cloudflare.com/workers/configuration/routing/routes/)

If the dashboard exposes a route failure mode, the previous setup's **Fail open**
choice allows WordPress fallback when the Worker is bypassed at its request
limit. This can show old pages or 404s for app-only paths; it is not automatic
recovery from a Vercel outage. Check Worker limits for the account before launch.
[Cloudflare Worker limits](https://developers.cloudflare.com/workers/platform/limits/)

No additional hostname/path Transform Rule or per-page Redirect Rule is needed
for the exact 24 navbar URLs. Keep normal HTTPS and canonical-host rules if they
preserve the intended path.

### 7. Check caching and test the live URLs

Purge cached responses for the affected collection/landing URLs after activation.
If a site-wide Cache Everything rule covers app HTML, Studio or API responses,
exclude those responses before rollout. Preserve normal static-asset caching;
this Worker adds no HTML cache override. Test in a private browser window to
avoid the previously cached `/service/` 301.

Windows command examples:

```text
curl.exe -I https://citysuburbanheating.com/service/
curl.exe -I https://citysuburbanheating.com/services/heating/heater-repair/
curl.exe -I https://citysuburbanheating.com/service/heating/water-heater-repair-installation/
curl.exe -I "https://citysuburbanheating.com/service/heating/furnace-repair-installation/?utm=check"
curl.exe -I https://citysuburbanheating.com/service-area/lincoln-park/
node cloudflare/verify-service-origin.mjs https://citysuburbanheating.com
```

Expected results:

- Collection, exact navbar page and retained extra: 200, new design, and
  `X-CitySuburban-Proxy: vercel`. The address bar stays on the live website.
- Old furnace keyword: 308 to the public-domain heater-repair URL, preserving
  `?utm=check`; no Vercel hostname or doubled `/service/services/` prefix.
- Neighborhood page: original WordPress page, no app proxy header.
- Full checker: all 41 landing URLs succeed with correct canonicals.

Also verify `/service/air-quality/`, `/service/commercial-hvac/`, `www` host
behavior, mobile navigation, logo/images, JS/CSS/fonts, and the browser console.
For the service form, submit one controlled test yourself and verify the expected
notification delivery. The Worker tests validate POST forwarding using a mock;
no real lead was submitted during this audit.

### 8. Set the WordPress navigation

The top-level **Services** link is:

```text
https://citysuburbanheating.com/service/
```

Heating, Cooling, Air Quality and Commercial dropdown items retain the exact
24 live keyword URLs from the directory. Those links now receive the new app
content through the Worker. Individual landing keywords should not point to the
collection or the Vercel hostname.

### 9. Verify CMS refresh and search indexing

Confirm Sanity CORS permits the live apex/`www` origins where Studio/preview needs
credentials. Confirm the signed content webhook points to:

```text
https://citysuburbanheating.com/service/api/revalidate/
```

Check that a published content edit refreshes the page. Recheck `noindex` on
approved landing pages and the app sitemap at `/service/sitemap.xml`. This
subdirectory sitemap must be linked from the main sitemap or submitted separately
to Search Console; the site's root WordPress sitemap is outside this Worker route.

## Rollback

Restore the saved Worker version and route configuration. If there was no Worker
before launch, remove only these two newly added routes. Existing WordPress
pages then answer again. App-only extra keyword pages may be unavailable until
the proxy is restored. Undo only the menu/rule changes made for this rollout and
purge affected cached responses. Do not delete the retained WordPress pages.
