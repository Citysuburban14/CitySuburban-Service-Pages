# Launching the new service pages on citysuburbanheating.com

## Current decision (03/10/2026)

- The app is served under **`/service/`**. That is the only URL change.
- Service landing pages keep their **original slugs**, for example `/service/heating/space-heater-repair-installation/`.
- There are **no redirects**. Every live WordPress page under `/services/...` keeps working as it is.
- Which live keyword URLs, if any, the new pages should take over is still being decided. Nothing is replaced until that decision is made.
- The header and footer mirror the live site, with the same links. The only change is that **Services** replaces **Service Areas**. It is a single link to the collection page at `/service/`.

## Who answers which URL once the Worker is live

| Path | Served by |
| --- | --- |
| `/service/`, `/service/{cluster}/`, `/service/{cluster}/{page}/` | The new app |
| `/service/air-quality/`, `/service/commercial-hvac/` and the footer hub copies | WordPress |
| `/services/...` (every existing service page) | WordPress, unchanged |
| `/service-areas/`, `/service-area/...` | WordPress, unchanged |

**Overlap to decide before launch.** The live hub pages `/service/heating/` and `/service/cooling/` use the same URLs as the app's Heating & Hot Water and Cooling cluster pages. With the Worker as written, the app's cluster pages answer those two URLs. To keep the WordPress hubs instead, add both paths to `KEEP_ON_WORDPRESS` in the Worker. The cluster pages then cannot be reached on the public domain.

## Steps, in order

### 1. Sanity

The slugs were briefly renamed to match live URLs. Restore the originals:

```bash
npx tsx scripts/apply-live-url-slugs.ts --revert
npx tsx scripts/apply-live-url-slugs.ts --revert --apply
npx tsx scripts/test-service-navigation.ts
```

The first command is a read-only dry run.

### 2. Vercel

Production environment variables:
- `NEXT_SITE_URL` = `https://citysuburbanheating.com`
- `NEXT_SANITY_STUDIO_URL` = `/service/studio`

Redeploy after changing them. Production must not be behind Deployment Protection.

### 3. Cloudflare Worker

1. Workers & Pages, Create Worker, name it `citysuburban-services-proxy`.
2. Edit code: paste `cloudflare/services-proxy-worker.mjs`. Deploy.
3. Settings, Domains & Routes, add one route per host on zone `citysuburbanheating.com`:
   - `citysuburbanheating.com/service*`
   - `www.citysuburbanheating.com/service*`
4. Failure mode: **Fail open**.

### 4. Test

```bash
curl -sI https://citysuburbanheating.com/service/
curl -sI https://citysuburbanheating.com/services/heating/heater-repair/
```

The first should return `200` with an `x-vercel-id` header. The second should return `200` from WordPress, with no redirect.

### 5. WordPress menu

Replace **Service Areas** with **Services**, linking to `https://citysuburbanheating.com/service/`. Nothing else changes.

### 6. Sanity settings

1. CORS origins: `https://citysuburbanheating.com` and `https://www.citysuburbanheating.com`, with credentials.
2. Webhook URL: `https://citysuburbanheating.com/service/api/revalidate/`.

## Rollback

Remove the two Worker routes. WordPress then answers every URL exactly as before.
