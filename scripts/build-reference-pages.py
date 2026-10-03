"""Build the finalized designs using the directory's exact live paths and names."""
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json
import re
from lxml import html

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / '.reference-preview'
DEST = Path(__file__).resolve().parents[1] / 'src' / 'reference-pages'
BASE = 'https://maximuslabs-ai.github.io/city-suburban-service-pages-preview/'
index = html.fromstring((SOURCE / 'index.html').read_text(encoding='utf-8'))
previous = json.loads((DEST / 'catalog.json').read_text(encoding='utf-8'))
# Retain original document identities and redirect destinations as URL names change.
old_by_preview = {node.get('href'): node.getparent().get('data-slug') for node in index.xpath('//li[@data-slug]/a')}
legacy_aliases = {'ductless': 'ductless-hvac', 'humidifiers-air-cleaners': 'humidifier-air-cleaner',
    'iaq-testing': 'indoor-air-quality-test', 'commercial-ductwork': 'ductwork-design-repair-services',
    'commercial-hvac-installation': 'commercial-hvac-system-installation',
    'commercial-hvac-repair': 'emergency-routine-commercial-hvac-repairs',
    'commercial-hvac-replacement': 'commercial-hvac-system-replacement',
    'commercial-maintenance-plans': 'custom-hvac-maintenance-plan',
    'energy-efficient-upgrades': 'energy-efficient-hvac-upgrades'}
rows = index.xpath('//section[contains(@class,"cat")]//tbody/tr[td/a[@class="open"]]')
if len(rows) != 24:
    raise SystemExit(f'Expected 24 landing pages, found {len(rows)}')
catalog = []
for row in rows:
    preview_path = row.xpath('string(.//a[@class="open"]/@href)')
    live_url = row.xpath('string(.//a[@class="url"]/@href)')
    live_path = urlparse(live_url).path
    parts = live_path.strip('/').split('/')
    if len(parts) != 3 or parts[0] != 'services' or preview_path.strip('/') != live_path.strip('/'):
        raise SystemExit(f'Unexpected URL mapping: {preview_path} -> {live_url}')
    _, cluster, slug = parts
    old_slug = old_by_preview[preview_path]
    old_slug = legacy_aliases.get(old_slug, old_slug)
    existing = next((entry for entry in previous if entry['clusterSlug'] == cluster and
        (entry['slug'] == slug or entry.get('legacySlug', entry['slug']) == old_slug)), None)
    legacy_slug = existing.get('legacySlug', existing['slug']) if existing else old_slug
    parsed = html.fromstring((SOURCE / f'{cluster}--{slug}.html').read_text(encoding='utf-8'))
    status = row.xpath('string(.//td[@data-l="Status"])').strip()
    catalog.append({'clusterSlug': cluster, 'slug': slug, 'legacySlug': legacy_slug,
        'name': row.xpath('string(./td[@class="nav"])').strip(),
        'livePath': live_path, 'canonicalUrl': live_url, 'previewUrl': urljoin(BASE, preview_path),
        'title': parsed.xpath('string(//title)'),
        'description': parsed.xpath('string(//meta[@name="description"]/@content)'),
        'h1': parsed.xpath('string(//main//h1)').strip(),
        'qcStatus': 'PASS' if status == 'Passes all checks' else 'NEEDS-PHOTO',
        'photoStatus': status, 'referenceFile': f'{cluster}--{slug}.json'})

live_paths = {entry['livePath'] for entry in catalog}
collection_map = {'/service/': '/services/', '/services/': '/services/', '/service/commercial-hvac/': '/services/commercial/', '/services/commercial-hvac/': '/services/commercial/'}
for category in ('heating', 'cooling', 'air-quality', 'commercial'):
    collection_map['/service/' + category + '/'] = '/services/' + category + '/'
for old, new in {'heating-services': 'heating', 'cooling-services': 'cooling', 'air-quality-service': 'air-quality', 'commercial-hvac-service': 'commercial'}.items():
    collection_map['/service/' + old + '/'] = '/services/' + new + '/'
    collection_map['/services/' + old + '/'] = '/services/' + new + '/'
assets = {}

class ModuleParser(HTMLParser):
    """Capture editable modules verbatim, including case-sensitive SVG attributes."""
    def __init__(self, markup):
        super().__init__(convert_charrefs=False)
        self.markup = markup
        self.starts = [0]
        for line in markup.splitlines(keepends=True):
            self.starts.append(self.starts[-1] + len(line))
        self.stack, self.sections, self.current = [], [], None
        self.feed(markup)
    def source_offset(self):
        line, column = self.getpos()
        return self.starts[line - 1] + column
    def handle_starttag(self, tag, attrs):
        if tag in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            return
        self.stack.append(tag)
        module = dict(attrs).get('data-module')
        if module and self.current is None:
            self.current = (module, self.source_offset(), len(self.stack))
    def handle_startendtag(self, tag, attrs):
        pass
    def handle_endtag(self, tag):
        if tag not in self.stack:
            return
        depth = len(self.stack) - self.stack[::-1].index(tag)
        if self.current and self.current[2] == depth:
            module, start, _ = self.current
            end = self.markup.index('>', self.source_offset()) + 1
            self.sections.append({'_key': f'module-{len(self.sections)+1}', 'module': module, 'html': self.markup[start:end]})
            self.current = None
        self.stack = self.stack[:depth - 1]

def localize_url(value, page_url):
    if not value or value.startswith(('#', 'data:', 'tel:', 'sms:', 'mailto:')):
        return value
    resolved = urljoin(page_url, value)
    if resolved.startswith(BASE):
        parsed_url = urlparse(resolved)
        path = '/' + parsed_url.path[len(urlparse(BASE).path):]
        if path.startswith('/assets/'):
            assets[resolved] = path.rsplit('/', 1)[-1]
            return '/services/reference-assets/' + assets[resolved]
        suffix = ('?' + parsed_url.query if parsed_url.query else '') + ('#' + parsed_url.fragment if parsed_url.fragment else '')
        return collection_map.get(path, path) + suffix
    if urlparse(resolved).netloc in ('citysuburbanheating.com', 'www.citysuburbanheating.com'):
        parsed_url = urlparse(resolved)
        if parsed_url.path in live_paths or parsed_url.path in collection_map or parsed_url.path in ('/services/heating/', '/services/cooling/', '/services/air-quality/'):
            return collection_map.get(parsed_url.path, parsed_url.path) + ('#' + parsed_url.fragment if parsed_url.fragment else '')
    return value

for entry in catalog:
    document = (SOURCE / f"{entry['clusterSlug']}--{entry['slug']}.html").read_text(encoding='utf-8')
    parsed = html.fromstring(document)
    main = parsed.xpath('//main')[0]
    def localize(markup):
        markup = re.sub(r'\b(src|href|poster)=("|\')(.*?)(\2)',
            lambda match: match[1] + '=' + match[2] + localize_url(unescape(match[3]), entry['previewUrl']).replace('&', '&amp;') + match[2], markup)
        markup = re.sub(r'url\(([^)]+)\)', lambda match: 'url(' + localize_url(match[1].strip('\"\''), entry['previewUrl']) + ')', markup)
        # Keep the approved header styling while providing the requested Services
        # entry to the collection. WordPress's live navigation is not modified.
        def collection_entry(match):
            nav = match[0]
            return re.sub(r'<a\b([^>]*?)href="https://citysuburbanheating.com/service-areas/"([^>]*?)>Service areas</a>',
                r'<a\1href="/services/"\2>Services</a>', nav, flags=re.I)
        markup = re.sub(r'<nav aria-label="Primary"[^>]*>.*?</nav>', collection_entry, markup, flags=re.S)
        # Only the booking button submits. Carousel buttons retain type=button.
        return re.sub(r'<button\b([^>]*?)type="button"([^>]*?)>(\s*REQUEST SERVICE)', r'<button\1type="submit"\2>\3', markup, flags=re.I)
    nodes = main.xpath('./div[1]/*[@data-module]')
    if not nodes:
        raise SystemExit(f"No editable sections in {entry['slug']}")
    raw_main = re.search(r'<main\b[^>]*>.*?</main>', document, re.S).group(0)
    sections = [{**section, 'html': localize(section['html'])} for section in ModuleParser(raw_main).sections]
    if len(sections) != len(nodes):
        raise SystemExit(f"Editable section extraction mismatch in {entry['slug']}")
    styles = localize(re.search(r'<style>(.*?)</style>', document, re.S).group(1))
    hero_image = main.xpath('string(.//section[@data-module="hero"]//img[1]/@src)')
    entry['cardImage'] = localize_url(hero_image, entry['previewUrl']) if hero_image else None
    structured = parsed.xpath('string(//script[@type="application/ld+json"])')
    for old, new in collection_map.items():
        structured = structured.replace('https://citysuburbanheating.com' + old + '"', 'https://citysuburbanheating.com' + new + '"')
    snapshot = {'style': styles, 'html': localize(raw_main), 'schema': structured,
        'mainAttributes': dict(main.attrib), 'wrapperAttributes': dict(main.xpath('./div[1]')[0].attrib), 'sections': sections}
    (DEST / entry['referenceFile']).write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')

(DEST / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(SOURCE / 'assets-manifest.json').write_text(json.dumps(assets, indent=2), encoding='utf-8')
retained_file = DEST / 'retained-catalog.json'
all_pages = catalog + (json.loads(retained_file.read_text(encoding='utf-8')) if retained_file.exists() else [])
(DEST / 'index.ts').write_text("import type {ReferenceSnapshot} from './types'\n" +
    ''.join(f"import page{i} from './{entry['referenceFile']}'\n" for i, entry in enumerate(all_pages)) +
    "\nexport const referenceSnapshots: Record<string, ReferenceSnapshot> = {\n" +
    ''.join(f"  '{entry['clusterSlug']}/{entry['slug']}': page{i},\n" for i, entry in enumerate(all_pages)) + "}\n", encoding='utf-8')
print(f'Built {len(catalog)} finalized pages; {len(assets)} reference assets')
