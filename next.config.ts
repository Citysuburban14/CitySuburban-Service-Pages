import type {NextConfig} from 'next'

// These values are intentionally public application configuration, but the
// Vercel variable names do not need a NEXT_PUBLIC_ prefix. Next.js injects only
// this explicit allowlist into the browser bundle for the embedded Studio.
const browserConfig = {
  NEXT_SANITY_PROJECT_ID: process.env.NEXT_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_SANITY_DATASET: process.env.NEXT_SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_SANITY_API_VERSION: process.env.NEXT_SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_SANITY_STUDIO_URL: process.env.NEXT_SANITY_STUDIO_URL || process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  NEXT_SITE_URL: process.env.NEXT_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL,
}

const nextConfig: NextConfig = {
  // The app is served under the /service subdirectory of the main site, the same
  // directory as the live WordPress hub pages (/service/heating/).
  // basePath is compiled into the client bundle and is applied automatically to
  // routes, <Link> hrefs, redirect source/destination, and public assets — but
  // NOT to fetch() calls or raw string asset paths, which are prefixed manually.
  basePath: '/service',
  // The live WordPress URLs end with a slash (/service/heating/). Matching that
  // exactly means a replaced page keeps its URL with no redirect.
  trailingSlash: true,
  env: browserConfig,
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    // Sources/destinations are base-relative; basePath re-adds the /service prefix.
    return [
      {
        // The bare origin root has no page under basePath. basePath:false keeps this
        // matching the literal "/" (not "/service") and redirecting to the literal
        // "/service/" collection. Only affects the direct Vercel URL; at the public
        // domain "/" is served by WordPress, not proxied here.
        source: '/',
        destination: '/service/',
        permanent: false,
        basePath: false,
      },
      // The app used /services before it moved to /service. Keep those Vercel URLs
      // working. On the public domain, /services/* is handled by the Cloudflare Worker.
      {source: '/services', destination: '/service/', permanent: true, basePath: false},
      {source: '/services/:path+', destination: '/service/:path+/', permanent: true, basePath: false},
      // Eight pages were renamed to the exact URLs of the live WordPress pages they
      // replace, and the air quality cluster now uses the live "air-quality" slug.
      // These keep the earlier preview URLs working. Specific rules come first.
      ...([
        ['/cooling/air-conditioner-repair-installation', '/cooling/air-conditioning-installation/'],
        ['/hvac-systems/heat-pump-repair-installation', '/cooling/heat-pump-services/'],
        ['/heating/space-heater-repair-installation', '/heating/heater-repair/'],
        ['/heating/boiler-repair-installation', '/heating/boiler-service/'],
        ['/cooling/ductless-mini-split-installation-repair', '/cooling/ductless-hvac-service/'],
        ['/indoor-air-quality-ventilation/air-duct-cleaning-repair', '/air-quality/duct-repair/'],
        ['/indoor-air-quality-ventilation/indoor-air-quality-testing-installation', '/air-quality/indoor-air-quality-test/'],
        ['/indoor-air-quality-ventilation/dehumidifier-installation-repair', '/air-quality/dehumidifier-installation/'],
      ] as const).map(([source, destination]) => ({source, destination, permanent: true})),
      {source: '/indoor-air-quality-ventilation', destination: '/air-quality/', permanent: true},
      {source: '/indoor-air-quality-ventilation/:slug', destination: '/air-quality/:slug/', permanent: true},
    ]
  },
}

export default nextConfig
