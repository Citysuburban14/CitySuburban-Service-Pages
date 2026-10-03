import {NextResponse, type NextRequest} from 'next/server'
import {serviceRouteAliases} from './lib/service-route-aliases'

const aliases = serviceRouteAliases()
const technicalPaths = /^\/services\/(?:api|_next|images|reference-assets|studio)(?:\/|$)/

// All pages are native /services routes. Singular /service is compatibility only.
// No matcher: redirects must also run outside the configured app basePath.
export function proxy(request: NextRequest) {
  const url = new URL(request.url)
  const legacy = /^\/service(?:\/|$)/.test(url.pathname)
  const upgraded = url.pathname.replace(/^\/service(?=\/|$)/, '/services')
  const key = upgraded.replace(/\/+$/, '') || '/'
  const destination = aliases.get(key)
  if (destination && url.pathname !== destination) {
    const target = new URL(destination, url)
    target.search = url.search
    return NextResponse.redirect(target, 308)
  }
  if (legacy && technicalPaths.test(upgraded)) {
    url.pathname = upgraded
    return NextResponse.rewrite(url)
  }
  if (legacy && key === '/services/sitemap.xml') {
    url.pathname = upgraded
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}
