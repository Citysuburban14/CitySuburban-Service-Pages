import {NextResponse, type NextRequest} from 'next/server'
import catalog from './reference-pages/catalog.json'
import migrations from '../data/service-url-migrations.json'

const landingPaths = new Set(catalog.map((page) => page.livePath))
const overlaps: Record<string, string> = migrations.overlaps

// The collections retain /service and their existing redirects. These exact
// public landing paths are served internally without changing the browser URL.
// No matcher: Next prefixes configured matchers with the collection basePath.
export function proxy(request: NextRequest) {
  const url = new URL(request.url)
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0] === 'service' && parts.length === 2) {
    const page = catalog.find((item) => item.slug === parts[1] || item.legacySlug === parts[1])
    if (page) {
      const destination = new URL(page.livePath, url)
      destination.search = url.search
      return NextResponse.redirect(destination, 308)
    }
  }
  if (parts[0] === 'service' && parts.length >= 2 && parts.length <= 4) {
    const oldKeyword = parts.find((part) => overlaps[part])
    if (oldKeyword) {
      // Server-component redirects add the app basePath. Use an origin-relative
      // URL here so /services remains exact rather than /service/services.
      const destination = new URL(overlaps[oldKeyword], url)
      destination.search = url.search
      return NextResponse.redirect(destination, 308)
    }
  }
  if (!landingPaths.has(url.pathname)) return NextResponse.next()
  url.pathname = url.pathname.replace(/^\/services\//, '/service/')
  return NextResponse.rewrite(url)
}
