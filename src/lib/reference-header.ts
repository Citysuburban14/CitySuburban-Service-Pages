/** Remove the imported header so every landing page uses the shared live menu. */
export function withoutReferenceHeader(html: string): string {
  const start = /<div\b[^>]*\bdata-module="site-header"[^>]*>/i.exec(html)
  if (!start) return html
  const tags = /<\/?div\b[^>]*>/gi
  tags.lastIndex = start.index
  let depth = 0
  for (let tag = tags.exec(html); tag; tag = tags.exec(html)) {
    depth += /^<\//.test(tag[0]) ? -1 : 1
    if (depth === 0) return html.slice(0, start.index) + html.slice(tags.lastIndex)
  }
  return html
}
