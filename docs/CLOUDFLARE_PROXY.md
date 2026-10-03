# Launching the new service pages on citysuburbanheating.com

Checked against the live site on 03/10/2026.

## The idea

- Where a live WordPress page targets the **same keyword** as one of our new pages, the new page takes over that **exact URL**, trailing slash included. No redirect.
- Where no live page has the keyword, the new page appears only through the new **Services** menu item: `/services/` (collection) > `/services/{cluster}/` > `/services/{cluster}/{page}/`.
- Everything else on WordPress keeps working as it is.

## How the live site is laid out

| URL shape | What it is | Example |
| --- | --- | --- |
| `/service/{cluster}/` | 4 WordPress hub pages | `/service/heating/` |
| `/services/{cluster}/{page}/` | 24 WordPress service pages | `/services/heating/heater-repair/` |

WordPress itself treats `/services/{cluster}/{page}/` as the real address of each service page: `/service/heating/heater-repair/` 301s there. So the app keeps `basePath: '/services'` and `trailingSlash: true`, which is what lets it serve those exact URLs.

## The 8 pages replaced in place

Same keyword on both sides. After launch each URL shows the new page, with no redirect.

| Live URL (unchanged) | Live keyword | New page (Sanity ID) |
| --- | --- | --- |
| /services/heating/heater-repair/ | heater repair | Space & Unit Heater (306) |
| /services/heating/boiler-service/ | boiler service | Boiler (308) |
| /services/cooling/air-conditioning-installation/ | ac installation | Central AC (302) |
| /services/cooling/ductless-hvac-service/ | ductless ac service | Ductless Mini-Split (310) |
| /services/cooling/heat-pump-services/ | heat pump repair | Heat Pump (305) |
| /services/air-quality/dehumidifier-installation/ | whole-home dehumidifier installation | Dehumidifier (320) |
| /services/air-quality/indoor-air-quality-test/ | indoor air quality testing | Indoor Air Quality (315) |
| /services/air-quality/duct-repair/ | duct repair | Air Duct (307) |

## The 2 redirects that cannot be avoided

Each points at a new page that already owns one of the URLs above. One page cannot live at two URLs without duplicate content.

| Old URL | 301 to |
| --- | --- |
| /services/cooling/air-conditioning-repair/ | /services/cooling/air-conditioning-installation/ |
| /services/heating/heat-pump/ | /services/cooling/heat-pump-services/ |

## The 14 pages that stay on WordPress

- Close but not the same keyword: heater installation, heater maintenance, HVAC maintenance plans, AC maintenance, duct maintenance, humidifier and air cleaner.
- No new page for the keyword: hybrid heating, cooling maintenance plans, and the six commercial pages.

The full list is in `KEEP_ON_WORDPRESS` in `cloudflare/services-proxy-worker.mjs`.

## Steps, in order

### 1. Sanity: give the 8 pages the live URLs

```bash
npx tsx scripts/apply-live-url-slugs.ts
npx tsx scripts/apply-live-url-slugs.ts --apply
```

The first command only reads and prints the plan. The second writes 10 patches to 9 documents in one transaction, then verifies them. Afterwards this should pass:

```bash
npx tsx scripts/test-service-navigation.ts
```

### 2. Vercel

1. Merge this branch so production has `trailingSlash: true` and the new slugs.
2. Settings, Deployment Protection: Production must be public.
3. Production environment variables: `NEXT_SITE_URL` = `https://citysuburbanheating.com` and `NEXT_SANITY_STUDIO_URL` = `/services/studio`. Redeploy.

### 3. Cloudflare Worker

1. Workers & Pages, Create Worker, name it `citysuburban-services-proxy`.
2. Edit code: paste `cloudflare/services-proxy-worker.mjs`. Deploy.
3. Settings, Domains & Routes, add two routes on zone `citysuburbanheating.com`:
   - `citysuburbanheating.com/services*`
   - `www.citysuburbanheating.com/services*`
4. Failure mode: **Fail open**.

### 4. Test

```bash
curl -sI https://citysuburbanheating.com/services/heating/heater-repair/
```

Expect `200` and an `x-vercel-id` header, which means the new page is served at the old URL. Then check:

- `/services/cooling/air-conditioning-repair/` returns `301` to `/services/cooling/air-conditioning-installation/`.
- `/services/heating/heater-installation/` still shows WordPress.
- `/services/` shows the new collection page.
- View source on a replaced page: the canonical tag is the same old URL.

### 5. WordPress menu (Appearance, Menus)

1. Replace **Service Areas** with **Services**, linking to `https://citysuburbanheating.com/services/`.
2. The 8 replaced items keep their links. They now open the new pages.
3. Remove **Air Conditioning Repair** and the Heating **Heat Pump** item, or point them at the URLs they redirect to.
4. Leave the 14 WordPress-only items as they are.

### 6. WordPress clean-up

1. For the 8 replaced pages and the 2 redirected pages, set the WordPress posts to **Draft**. Do not delete them. They leave the Yoast sitemap, while the Worker keeps serving their URLs.
2. Yoast robots.txt: add `Sitemap: https://citysuburbanheating.com/services/sitemap.xml`.
3. Search Console: submit that sitemap and inspect two replaced URLs.

### 7. Sanity settings

1. CORS origins: add `https://citysuburbanheating.com` and `https://www.citysuburbanheating.com` with credentials.
2. Webhook URL: `https://citysuburbanheating.com/services/api/revalidate/` (trailing slash).

## Rollback

Remove the two Worker routes and set the WordPress posts back to Published. WordPress answers every `/services/...` URL exactly as before.
