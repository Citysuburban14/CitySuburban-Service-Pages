# Launching the new service pages on citysuburbanheating.com

Checked against the live site on 03/10/2026.

## The idea

- The app lives under **`/service/`**, the same directory as the live WordPress hub pages.
- The app's Heating, Cooling and Air Quality cluster pages take over the live hub URLs `/service/heating/`, `/service/cooling/` and `/service/air-quality/` **in place**.
- The 8 live service pages that target the same keyword as a new page move from `/services/...` to `/service/...` with **one 301 each**. Two more duplicate pages 301 to the same new pages.
- Pages with no matching new page stay on WordPress, unchanged.
- The app's header and footer mirror the live site. The only difference is that **Services** replaces **Service Areas**, and opens the collection, cluster and landing pages.

## URL map

| Live today | After launch |
| --- | --- |
| /service/heating/ (WordPress hub) | Same URL, new Heating & Hot Water cluster page |
| /service/cooling/ (WordPress hub) | Same URL, new Cooling cluster page |
| /service/air-quality/ (WordPress hub) | Same URL, new Air Quality cluster page |
| /service/commercial-hvac/ and the footer hub copies | Stay on WordPress |
| /service/ (301 to /service-areas/ today) | New collection page |

### The 10 redirects (`/services/` to `/service/`)

| Old WordPress URL | 301 to | Keyword |
| --- | --- | --- |
| /services/heating/heater-repair/ | /service/heating/heater-repair/ | heater repair |
| /services/heating/boiler-service/ | /service/heating/boiler-service/ | boiler service |
| /services/cooling/air-conditioning-installation/ | /service/cooling/air-conditioning-installation/ | ac installation |
| /services/cooling/ductless-hvac-service/ | /service/cooling/ductless-hvac-service/ | ductless ac service |
| /services/cooling/heat-pump-services/ | /service/cooling/heat-pump-services/ | heat pump repair |
| /services/air-quality/dehumidifier-installation/ | /service/air-quality/dehumidifier-installation/ | whole-home dehumidifier installation |
| /services/air-quality/indoor-air-quality-test/ | /service/air-quality/indoor-air-quality-test/ | indoor air quality testing |
| /services/air-quality/duct-repair/ | /service/air-quality/duct-repair/ | duct repair |
| /services/cooling/air-conditioning-repair/ | /service/cooling/air-conditioning-installation/ | duplicate of AC installation |
| /services/heating/heat-pump/ | /service/cooling/heat-pump-services/ | duplicate of heat pump |

### Stays on WordPress

Everything else under `/services/` (heater installation and maintenance, maintenance plans, hybrid heating, AC maintenance, duct maintenance, humidifier and air cleaner, all commercial pages), plus `/service-areas/` and `/service-area/...`.

## Steps, in order

### 1. Vercel

Production environment variables:
- `NEXT_SITE_URL` = `https://citysuburbanheating.com`
- `NEXT_SANITY_STUDIO_URL` = `/service/studio` (was `/services/studio`)

Redeploy after changing them. Production must not be behind Deployment Protection.

### 2. Cloudflare Worker

1. Workers & Pages, Create Worker, name it `citysuburban-services-proxy`.
2. Edit code: paste `cloudflare/services-proxy-worker.mjs`. Deploy.
3. Settings, Domains & Routes, add one route per host on zone `citysuburbanheating.com`:
   - `citysuburbanheating.com/service*`
   - `www.citysuburbanheating.com/service*`

   This one pattern covers `/service/`, `/services/` and `/service-areas/`. The Worker sends each to the right place.
4. Failure mode: **Fail open**.

### 3. Test

```bash
curl -sI https://citysuburbanheating.com/service/heating/heater-repair/
curl -sI https://citysuburbanheating.com/services/heating/heater-repair/
```

The first should return `200` with an `x-vercel-id` header. The second should return `301` to the first. Then check:
- `/service/heating/` shows the new cluster page.
- `/service/` shows the new collection page.
- `/services/heating/heater-installation/` and `/service-areas/` still show WordPress.

### 4. WordPress menu (Appearance, Menus)

The new pages already carry the updated menu. To make the WordPress pages match:
1. Replace **Service Areas** with **Services**, linking to `https://citysuburbanheating.com/service/`.
2. Point the 8 matched items, and the AC Repair and Heating > Heat Pump items, at their `/service/` URLs from the table above.

### 5. WordPress clean-up

1. Set the 10 redirected posts to **Draft**. Do not delete them.
2. Yoast robots.txt: add `Sitemap: https://citysuburbanheating.com/service/sitemap.xml`.
3. Search Console: submit that sitemap and inspect a few redirected URLs.

### 6. Sanity settings

1. CORS origins: `https://citysuburbanheating.com` and `https://www.citysuburbanheating.com`, with credentials.
2. Webhook URL: `https://citysuburbanheating.com/service/api/revalidate/`.

## Rollback

Remove the two Worker routes and set the WordPress posts back to Published. WordPress then answers every URL exactly as before.
