# Cloudflare service-page proxy: /services rollout

Updated 3 October 2026. **The application base is `/services`, plural.** This supersedes the earlier mixed-base instructions. The Worker is prepared; live Cloudflare and WordPress changes remain a separate rollout.

## URL behavior

| Request | Prepared behavior |
| --- | --- |
| `/services/` | Services collection, same public URL |
| `/services/heating/`, `/services/cooling/`, `/services/air-quality/`, `/services/commercial/` | Category collections, same public URL |
| All 24 exact navbar and 17 retained `/services/` landing pages | Vercel content, same public URL |
| Known old `/service/` page and collection URLs | Permanent 308 to matching plural canonical; query retained |
| Eight consolidated old keyword aliases | Permanent 308 to exact replacement keyword |
| Old footer hubs, e.g. `/service/heating-services/` | Permanent 308 to `/services/heating/` |
| `/services/` assets, APIs, Studio and sitemap | Vercel |
| Old `/service/` assets, APIs and Studio | Internal compatibility rewrite; current links use plural |
| Unknown service paths, `/service/cooling-test/`, neighborhood `/service-area/` and `/service-areas/` paths | Existing WordPress behavior |

See the [complete URL directory](service-url-directory.md). All current landing pages render natively under `/services`; there is no rewrite to a singular application base. **No individual Cloudflare redirect rule is needed for each service landing page.** The app handles known aliases with 308. The Worker relays redirects and changes absolute Vercel Location headers to the visitor's public hostname.

Neighborhood pages are outside this migration. If migrated later, add their exact mappings and coverage first.

Use a Worker Route for this reverse proxy: dashboard URL Rewrite Rules change paths/queries but cannot change a hostname to the external Vercel origin. [Cloudflare URL Rewrite documentation](https://developers.cloudflare.com/rules/transform/url-rewrite/)

## Step-by-step setup

### 1. Save and inspect existing routing

Save the existing Worker code, routes and matching redirect/rewrite rules. Keep WordPress pages for rollback. Update the existing service Worker if one is installed.

Inspect Single/Bulk Redirects, Page Rules, URL rewrites and Worker Routes for `/services*` and `/service*`. Exclude migrated paths from rules that intercept them before the Worker. Check more specific routes that could select another Worker. Cloudflare Trace can identify matching rules.

An earlier public audit found live `/service/` returning 301 to `/service-areas/`; its source was not identified in the account. The new menu uses `/services/`. For old singular bookmarks, remove that exact conflicting Cloudflare redirect match if present. A WordPress redirect is bypassed when the Worker sends the known old path to Vercel. Keep unrelated redirects.

### 2. Confirm Vercel production

Stable origin:

```text
https://city-suburban-service-pages.vercel.app
```

Use the latest main deployment with `basePath: '/services'`. A base-path change requires a rebuild. Confirm Vercel Production variables:

```text
NEXT_SITE_URL=https://citysuburbanheating.com
NEXT_SANITY_STUDIO_URL=/services/studio
```

The app normalizes a previously saved singular Studio setting for compatibility. Save the plural setting for future deployments. Keep credentials in Vercel; the Worker needs no Sanity token. Confirm production access without a login/protection challenge.

From the repository, run:

```text
node cloudflare/verify-service-origin.mjs
```

Expect `checked: 41`, `failures: []`. `noindex` is reported separately.

### 3. Review and publish approved Sanity drafts

The migration saves URL/design fields as drafts, preserving copy, key phrases and approval flags. Review/publish approved pages and the standard template. Studio is `/services/studio/`; saved paths, images, section fields, CSS, canonicals and JSON-LD use the plural base.

For pages intended for indexing, complete content/fact/photo approval, set `factChecksComplete` to true and publish. This field controls indexing. Design or URL changes alone do not clear `noindex`. Published older URL fields are normalized at render time while drafts await review.

### 4. Confirm Cloudflare DNS

Apex and `www` records in the zone must be **Proxied** (orange cloud). Keep the WordPress origin records. Worker Routes run in front of the existing origin. [Worker Route prerequisites](https://developers.cloudflare.com/workers/configuration/routing/routes/)

### 5. Deploy the prepared Worker

In **Workers & Pages**, open the existing service Worker or create `citysuburban-services-proxy`. Paste the complete contents of:

```text
cloudflare/services-proxy-worker.mjs
```

Deploy the code. It is standalone, with no imports, bindings or secrets. `ORIGIN` already points to stable Vercel production. Its allowlist includes all 41 pages, collections and known aliases; technical paths are routed separately. Unknown service and neighborhood paths pass to WordPress.

After later directory changes, regenerate and test before pasting again:

```text
node cloudflare/build-services-proxy-worker.mjs
node cloudflare/services-proxy-worker.test.mjs
```

### 6. Attach Worker Routes

Open **Settings → Domains & Routes → Add → Route**, select the zone, and attach these primary patterns to the same Worker:

```text
citysuburbanheating.com/services*
www.citysuburbanheating.com/services*
```

These cover the collection, all current landing pages, assets, APIs and Studio, including slashless `/services`. No individual page routes are needed.

To support old singular bookmarks/aliases and technical compatibility, also attach:

```text
citysuburbanheating.com/service*
www.citysuburbanheating.com/service*
```

The broader compatibility patterns also match plural and neighborhood paths. Attach all patterns to the **same Worker**; its code passes neighborhoods through. If that Worker already has the two broad `service*` routes, they cover both prefixes and may be retained alone. The canonical app base remains `/services`. Check more specific existing routes for conflicts. [Cloudflare route matching](https://developers.cloudflare.com/workers/configuration/routing/routes/)

If available, select a route failure mode based on account limits. Fail open permits WordPress fallback when Cloudflare bypasses an over-limit Worker; old pages or app-only 404s may appear. It does not recover automatically from a Vercel outage. [Worker limits](https://developers.cloudflare.com/workers/platform/limits/)

### 7. Update navigation and CMS integrations

The top-level **Services** link is:

```text
https://citysuburbanheating.com/services/
```

Category links use `/services/heating/`, `/services/cooling/`, `/services/air-quality/`, `/services/commercial/`. The 24 dropdown keyword links retain their exact directory paths.

Confirm Sanity CORS permits the required live apex/`www` origins. Update the signed webhook to:

```text
https://citysuburbanheating.com/services/api/revalidate/
```

The revalidation handler covers reference landing pages. Confirm an approved published edit refreshes its page. The app sitemap is `/services/sitemap.xml`; link it from the main sitemap or submit it separately to Search Console.

### 8. Purge affected caches and verify

Purge affected page/collection responses. Exclude app HTML, Studio and APIs from conflicting site-wide Cache Everything rules. Keep normal static-asset caching. Test old redirects in a private window.

```text
curl.exe -I https://citysuburbanheating.com/services/
curl.exe -I https://citysuburbanheating.com/services/heating/heater-repair/
curl.exe -I https://citysuburbanheating.com/services/heating/water-heater-repair-installation/
curl.exe -I "https://citysuburbanheating.com/service/heating/water-heater-repair-installation/?utm=check"
curl.exe -I "https://citysuburbanheating.com/service/heating/furnace-repair-installation/?utm=check"
curl.exe -I https://citysuburbanheating.com/service-area/lincoln-park/
node cloudflare/verify-service-origin.mjs https://citysuburbanheating.com
```

Expected:

- Current collections and all 41 pages: 200, new design, correct canonical and `X-CitySuburban-Proxy: vercel`; visitor stays on the live domain.
- Old singular retained page: 308 to its plural equivalent with `?utm=check`.
- Old furnace keyword: 308 to `/services/heating/heater-repair/?utm=check`.
- Neighborhood: WordPress behavior, no app proxy header.
- Full checker: 41 successful pages and no failures.

Check both hosts, mobile navigation, logo/images, JS/CSS/fonts, Studio, console and robots tags. Submit a controlled service-form test yourself and verify delivery. Automated Worker tests use a mocked POST.

## Rollback

Restore saved Worker code/routes. If newly installed, remove only routes added for this rollout. Restore affected navigation/rules and purge caches. WordPress pages answer again; app-only extras may be unavailable until the proxy returns. Keep the retained WordPress content.
