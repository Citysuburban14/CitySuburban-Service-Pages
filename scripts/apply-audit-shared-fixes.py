"""Apply the October 2026 audit's shared template corrections to every landing page.

These corrections come from the published-page audit (2026-10-05) and apply to all
41 pages, newer and retained:
- remove the "Licensed" and "Satisfaction guaranteed" credential cards (neither is a
  verified, registered fact)
- remove the "Reviewed by Rob" byline (no page-level approval record exists)
- retitle process steps 5 and 6 so a visit does not promise a repair or outcome
- remove the furnace/AC product strip from pages where it is unrelated
- use US spelling
- rebuild FAQPage structured data from the visible FAQ

Idempotent: running it twice changes nothing the second time.
Run after scripts/build-retained-service-pages.py and before
scripts/add-service-content-fields.py.
"""
from pathlib import Path
from html import unescape
import json
import re
from lxml import html

DEST = Path(__file__).resolve().parents[1] / 'src/reference-pages'
catalog = json.loads((DEST / 'catalog.json').read_text(encoding='utf-8')) + json.loads((DEST / 'retained-catalog.json').read_text(encoding='utf-8'))

# Pages whose service has nothing to do with replacing furnaces or air conditioners.
NO_PRODUCT_STRIP = re.compile(r'^(air-quality|commercial|commercial-specialty|indoor-air-quality-ventilation|fireplace-chimney)--|^heating--(boiler-service|hvac-maintenance-plans)$')
TEXT_FIXES = [
    ('Reviewed by Rob, owner of City &amp; Suburban · ', ''),
    ('Reviewed by Rob, owner of City &amp; Suburban', ''),
    ('>Repair and test<', '>Approved work<'),
    ('>Repair, test and clean up.<', '>Only the work you approve, then tested.<'),
    ('>Enjoy comfort<', '>Clear results<'),
    ('>A warm, safe home.<', '>Findings and next steps explained.<'),
    ('>Your equipment ready to use.<', '>Findings and next steps explained.<'),
    ('>Certified heating technicians<', '>Certified HVAC technicians<'),
]
SPELLING = {'neighbourhoods': 'neighborhoods', 'neighbourhood': 'neighborhood', 'Neighbourhoods': 'Neighborhoods',
    'Neighbourhood': 'Neighborhood', 'colour': 'color', 'centre': 'center', 'behaviour': 'behavior', 'labour': 'labor'}


def serialize(node):
    markup = html.tostring(node, encoding='unicode', method='html')
    return markup.replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio=')


def structural(module, markup, page_key):
    """Element-level removals, applied only when the target exists."""
    changed = False
    # Credential cards without an approved fact: the license (not verified) and a
    # satisfaction guarantee (not a registered company term).
    unapproved = ('Licensed heating specialists', 'City & Suburban backs its work')
    if module == 'reviews' and any(label in unescape(markup) for label in unapproved):
        node = html.fromstring(markup)
        for span in node.xpath('.//span[normalize-space(.)="Licensed heating specialists" or normalize-space(.)="City & Suburban backs its work"]'):
            card = span.getparent()
            card.getparent().remove(card)
            changed = True
        markup = serialize(node) if changed else markup
    if module == 'install' and NO_PRODUCT_STRIP.search(page_key) and 'data-role="product"' in markup:
        node = html.fromstring(markup)
        for grid in {product.getparent() for product in node.xpath('.//*[@data-role="product"]')}:
            grid.getparent().remove(grid)
            changed = True
        markup = serialize(node) if changed else markup
    return markup


def text(markup):
    value = re.sub(r'<[^>]*>', ' ', markup)
    return re.sub(r'\s+', ' ', unescape(value)).strip()


def visible_faq(markup):
    section = re.search(r'<section\b[^>]*data-module="faq"[\s\S]*?</section>', markup)
    if not section:
        return []
    questions = []
    for details in re.findall(r'<details\b[^>]*>([\s\S]*?)</details>', section[0]):
        summary = re.search(r'<summary\b[^>]*>([\s\S]*?)</summary>', details)
        if summary:
            questions.append({'@type': 'Question', 'name': text(summary[1]),
                'acceptedAnswer': {'@type': 'Answer', 'text': text(details[summary.end():])}})
    return questions


changed_pages = 0
for page in catalog:
    file = DEST / page['referenceFile']
    snapshot = json.loads(file.read_text(encoding='utf-8'))
    before = json.dumps(snapshot, ensure_ascii=False)
    page_key = f"{page['clusterSlug']}--{page['slug']}"
    for section in snapshot['sections']:
        original = section['html']
        markup = structural(section['module'], original, page_key)
        for find, replace in TEXT_FIXES:
            markup = markup.replace(find, replace)
        for british, american in SPELLING.items():
            markup = re.sub(rf'\b{british}\b', american, markup)
        if markup != original:
            if original not in snapshot['html']:
                raise SystemExit(f'Section not in full markup: {page_key}/{section["module"]}')
            snapshot['html'] = snapshot['html'].replace(original, markup, 1)
            section['html'] = markup
    if snapshot.get('schema'):
        graph = json.loads(snapshot['schema'])
        faq = visible_faq(snapshot['html'])
        for node in graph.get('@graph', []):
            if node.get('@type') == 'FAQPage' and faq:
                node['mainEntity'] = faq
        snapshot['schema'] = json.dumps(graph, ensure_ascii=False)
    after = json.dumps(snapshot, ensure_ascii=False)
    if after != before:
        changed_pages += 1
        file.write_text(after, encoding='utf-8')

print(f'Applied shared audit corrections; {changed_pages} of {len(catalog)} pages changed')
