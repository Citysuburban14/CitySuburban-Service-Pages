"""Apply the approved standard design to distinct existing keyword pages.

Existing copy, FAQs, media and keyword research come from the Sanity export.
No service is deleted or published by this script.
"""
from pathlib import Path
from html import escape
from copy import deepcopy
import json
import re
from lxml import html

REPO = Path(__file__).resolve().parents[1]
DEST = REPO / 'src/reference-pages'
documents = json.loads((REPO.parent / '.reference-preview/existing-service-content.json').read_text(encoding='utf-8'))
migrations = json.loads((REPO / 'data/service-url-migrations.json').read_text(encoding='utf-8'))
catalog = json.loads((DEST / 'catalog.json').read_text(encoding='utf-8'))
prototype = json.loads((DEST / 'heating--heater-repair.json').read_text(encoding='utf-8'))
nodes = {section['module']: html.fromstring(section['html']) for section in prototype['sections']}
by_id = {}
for doc in sorted(documents, key=lambda doc: doc['_id'].startswith('drafts.')):
    by_id[doc['_id'].removeprefix('drafts.')] = doc
settings = by_id['siteSettings']
area = next(doc for doc in by_id.values() if doc['_type'] == 'serviceArea')
pages = [doc for doc in by_id.values() if doc['_type'] == 'servicePage']
services = [doc for doc in by_id.values() if doc['_type'] == 'serviceDefinition']
H2 = "margin:0 0 28px;font-family:'Ubuntu',sans-serif;font-weight:700;font-size:clamp(28px,2.2vw + 12px,44px);line-height:1.2;color:#09263A"
H3 = "margin:0 0 12px;font-family:'Ubuntu',sans-serif;font-size:22px;color:#09263A"
CARD = 'background:#FFFFFF;border-radius:10px;box-shadow:0 4px 16px 1px rgba(0,0,0,.12);overflow:hidden;padding:24px'
WRAP = 'max-width:1180px;margin:0 auto;padding:0 24px;box-sizing:border-box'
GRID = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:18px'
def e(value):
    return escape(str(value or ''), quote=True)
def paragraph(value, style=''):
    return f'<p style="{style}">{e(value)}</p>' if value else ''
def heading(value):
    return f'<h2 style="{H2}">{e(value)}</h2>'
def cards(items):
    return '<div style="' + GRID + '">' + ''.join(f'<article style="{CARD}"><h3 style="{H3}">{e(item.get("title", item.get("name")))}</h3>{paragraph(item.get("body", item.get("description")), "margin:0;font-size:15px;line-height:1.55")}</article>' for item in items) + '</div>'
def section(module, content):
    node = deepcopy(nodes.get(module, nodes['systems']))
    attrs = dict(node.attrib)
    attrs['data-module'] = module
    node.clear()
    node.attrib.update(attrs)
    if module == 'faq':
        content = '<div style="color:#FFFFFF">' + content.replace('color:#09263A', 'color:#FFFFFF') + '</div>'
    for child in html.fragments_fromstring(f'<div style="{WRAP}">{content}</div>'):
        node.append(child)
    return node
def set_text(node, value):
    for child in list(node):
        node.remove(child)
    node.text = str(value or '')
def resolve_image(image):
    return (image or {}).get('resolvedUrl') or (image or {}).get('externalUrl')
def serialize(node):
    # Normalize SVG names that HTML parsers lowercase during cloning.
    markup = html.tostring(node, encoding='unicode', method='html')
    return markup.replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio=')

retained = []
for service in sorted(services, key=lambda doc: doc['serviceId']):
    slug = service['slug']['current']
    if slug in migrations['overlaps']:
        continue
    page = next(doc for doc in pages if doc['service']['_ref'].removeprefix('drafts.') == service['_id'].removeprefix('drafts.'))
    cluster = service['cluster']['_ref'].removeprefix('cluster-')
    category = migrations['directoryCategories'][cluster]
    name = service['name']
    h1 = f"{service['h1Prefix']} in {area['name']}"
    live_path = f'/services/{cluster}/{slug}/'
    canonical = 'https://citysuburbanheating.com' + live_path
    gallery = page.get('gallery') or []
    hero_image = resolve_image(page.get('coverImage')) or next((resolve_image(image) for image in gallery if resolve_image(image)), None)
    modules = []
    header = deepcopy(nodes['site-header'])
    last_link = header.xpath('.//nav[@aria-label="Primary"]/a')[-1]
    last_link.set('href', '/services/')
    set_text(last_link, 'Services')
    modules.append(header)
    hero = deepcopy(nodes['hero'])
    background = hero.xpath('./img')[0]
    if hero_image:
        background.set('src', hero_image)
    else:
        hero.remove(background)
    breadcrumb = hero.xpath('.//nav[@aria-label="Breadcrumb"]')[0]
    breadcrumb.clear()
    breadcrumb.set('aria-label', 'Breadcrumb')
    breadcrumb.set('style', 'font-size:13px;color:rgba(255,255,255,.75)')
    breadcrumb.append(html.fromstring(f'<span><a style="color:inherit" href="https://citysuburbanheating.com/">Home</a> › <a style="color:inherit" href="/services/">Services</a> › <a style="color:inherit" href="/services/{category}/">{e(category.replace("-", " ").title())}</a> › {e(name)}</span>'))
    column = hero.xpath('.//div[@class="r-cols"]/div[1]')[0]
    set_text(column.xpath('./span')[0], f'{area["name"]} {name}')
    set_text(hero.xpath('.//h1')[0], h1)
    set_text(column.xpath('./p')[0], service.get('heroLede') or page['seo']['description'])
    bullets = column.xpath('./ul')[0]
    bullets.clear()
    bullets.set('style', 'margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px 22px;font-size:15px;font-weight:600')
    for line in settings.get('trustLines', [])[:3]:
        bullets.append(html.fromstring(f'<li style="display:inline-flex;gap:8px;align-items:center"><span style="color:#E8574B" aria-hidden="true">✓</span>{e(line)}</li>'))
    for node in column.xpath('./p')[1:]:
        set_text(node, 'Updated October 2026')
    form = hero.xpath('.//form')[0]
    form.set('aria-label', f'Request {name.lower()}')
    set_text(form.xpath('./h2')[0], f'Request {name.lower()}')
    set_text(form.xpath('./p')[0], page.get('formSubtitle') or settings.get('formSubtitle') or 'Describe what the system is doing.')
    set_text(form.xpath('./p')[-1], page.get('formNote') or settings.get('formNote') or 'Call (773) 238-3838 to discuss your service request.')
    select = form.xpath('.//select')[0]
    label = select.getparent()
    label.text = (service.get('issueQuestion') or 'What is happening?') + '\n'
    select.clear()
    select.set('name', 'issue')
    select.set('style', 'min-height:46px;border:0;border-radius:6px;padding:10px 12px;font:inherit;font-weight:400;color:#09263A;background:#FFFFFF')
    for issue in service.get('issueOptions') or ['Request service']:
        option = html.Element('option')
        option.text = issue
        select.append(option)
    modules.append(hero)
    modules.append(deepcopy(nodes['trust']))
    metrics = page.get('trustMetrics') or settings.get('trustMetrics') or []
    modules.append(section('quick-facts', '<div style="' + GRID + '">' + ''.join(f'<div style="border-right:1px solid #D2D2D2;padding:12px;text-align:center"><strong style="font-family:Ubuntu,sans-serif;font-size:30px;color:#09263A">{e(metric.get("value"))}</strong><p style="margin:0">{e(metric.get("label"))}</p></div>' for metric in metrics) + '</div>'))
    if service.get('whyItems'):
        modules.append(section('problems', heading(service.get('whyHeading') or f'About {name.lower()}') + paragraph(service.get('whyLede')) + cards(service['whyItems'])))
    pricing = service.get('pricing') or {}
    if pricing:
        content = heading(pricing.get('heading') or f'What determines {name.lower()} cost?') + paragraph(pricing.get('lede'))
        content += cards([{'title': row['job'], 'body': ' '.join(filter(None, [row.get('driver'), row.get('permit')]))} for row in pricing.get('rows', [])])
        content += paragraph(pricing.get('note'), 'margin:24px 0 0;font-size:14px')
        # Preserve the approved shared written-price/offer/financing block.
        policy = nodes['pricing'].xpath('.//*[@data-module="pricing-block"]')
        if policy:
            content += serialize(policy[0])
        modules.append(section('pricing', content))
    if service.get('types'):
        systems = heading(service.get('typesHeading') or f'{name} equipment') + paragraph(service.get('typesLede'))
        systems += '<div style="' + GRID + '">' + ''.join(f'<article style="{CARD};padding:0"><div style="background:linear-gradient(110deg,#0A4265 6%,#09263A 100%);color:#FFFFFF;font-family:Ubuntu,sans-serif;font-size:20px;padding:14px 18px">{e(item["name"])}</div>{paragraph(item.get("description"), "margin:0;padding:18px;font-size:15px;line-height:1.55")}</article>' for item in service['types']) + '</div>' + paragraph(service.get('typesFootnote'), 'font-size:14px')
        modules.append(section('systems', systems))
    if service.get('brands'):
        content = heading(service.get('brandsHeading') or 'Equipment brands') + paragraph(service.get('brandsLede')) + '<div style="display:flex;flex-wrap:wrap;gap:12px">'
        for brand in service['brands']:
            brand_slug = re.sub(r'[^a-z0-9]+', '-', brand.lower().replace('&', ' and ')).strip('-')
            logo = REPO / 'public/images/brands' / f'{brand_slug}.png'
            image = f'<img src="/services/images/brands/{brand_slug}.png" alt="{e(brand)}" style="max-height:44px;max-width:140px;object-fit:contain">' if logo.exists() else e(brand)
            content += f'<figure style="margin:0;background:#FFFFFF;border:1px solid #E3E7EA;border-radius:10px;padding:14px;min-width:120px;height:72px;display:flex;align-items:center;justify-content:center">{image}</figure>'
        modules.append(section('brands', content + '</div>' + paragraph(service.get('brandsNote'))))
    process = deepcopy(nodes['process'])
    for node in process.xpath('.//*[not(*)]'):
        if node.text and 'A warm, safe home.' in node.text:
            node.text = node.text.replace('A warm, safe home.', 'Your equipment ready to use.')
    modules.append(process)
    if page.get('reviews'):
        review_cards = ''.join(f'<article style="{CARD};min-width:min(100%,310px);max-width:390px;flex:0 0 auto"><blockquote style="margin:0 0 20px;font-size:17px;line-height:1.6">{e(review["quote"])}</blockquote><strong>{e(review.get("author"))}</strong>{paragraph(review.get("summary"), "font-size:14px;color:#606060")}<a href="{e(review.get("sourceUrl", ""))}" style="font-size:13px;color:#186AA4">Read the original review ↗</a></article>' for review in page['reviews'])
        modules.append(section('reviews', heading(settings.get('reviewsHeading') or 'Customer reviews') + paragraph(settings.get('reviewsDisclaimer')) + '<div data-carousel style="position:relative"><div data-track style="display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:8px 0 20px">' + review_cards + '</div><div style="display:flex;justify-content:center;gap:12px"><button type="button" data-prev aria-label="Previous reviews" style="border:0;border-radius:50%;background:#09263A;color:white;width:40px;height:40px">←</button><button type="button" data-next aria-label="Next reviews" style="border:0;border-radius:50%;background:#09263A;color:white;width:40px;height:40px">→</button></div></div>'))
    places = area.get('subAreas') or []
    area_content = heading(area.get('areasHeading') or f'{name} across {area["name"]}') + paragraph(area.get('areasLede'))
    area_content += '<div class="r-cols" style="display:grid;grid-template-columns:1fr 1fr;gap:32px"><div><div style="' + GRID + '">' + ''.join(f'<div style="padding:14px;border:1px solid #D2D2D2;border-radius:10px"><strong>{e(place["name"])}</strong>{paragraph(place.get("note"), "margin:6px 0 0;font-size:14px")}</div>' for place in places) + '</div>' + paragraph(area.get('areasNote')) + '</div><iframe class="gmap" loading="lazy" title="Service coverage" src="https://maps.google.com/maps?q=' + e(area.get('mapQuery') or area['name']) + '&amp;output=embed"></iframe></div>'
    modules.append(section('service-areas', area_content))
    faqs = (service.get('faqs') or []) + (page.get('localFaqOverrides') or area.get('localFaqs') or [])
    if faqs:
        faq_content = heading(f'{name} questions') + ''.join(f'<details style="border-bottom:1px solid rgba(255,255,255,.25);padding:18px 0"><summary style="cursor:pointer;font-family:Ubuntu,sans-serif;font-weight:500;font-size:20px">{e(faq["question"])}</summary><p style="font-size:16px;line-height:1.65">{e(faq["answer"])}</p></details>' for faq in faqs)
        modules.append(section('faq', faq_content))
    guides = page.get('guides') or []
    if guides:
        content = heading(area.get('libraryHeading') or 'Service guides')
        for guide in guides:
            blocks = guide.get('body') or []
            body = ''.join(paragraph(''.join(child.get('text', '') for child in block.get('children', []))) for block in blocks)
            if not body and guide.get('legacyHtml'):
                body = paragraph(html.fromstring('<div>' + guide['legacyHtml'] + '</div>').text_content())
            content += f'<details style="padding:18px 24px;margin:0 0 12px;border:1px solid #D2D2D2;border-radius:10px"><summary style="font-family:Ubuntu,sans-serif;font-size:22px;cursor:pointer">{e(guide["title"])}</summary>{body}</details>'
        modules.append(section('guide', content))
    related = [entry for entry in catalog if entry['clusterSlug'] == category][:4]
    related_content = heading('Related services') + '<div style="' + GRID + '">' + ''.join(f'<a href="{entry["livePath"]}" style="{CARD};text-decoration:none;color:#09263A"><strong style="font-family:Ubuntu,sans-serif;font-size:22px">{e(entry["name"])}</strong>{paragraph(entry["description"], "font-size:15px")}<span style="color:#C9302A;font-weight:600">Explore →</span></a>' for entry in related) + '</div>'
    modules.append(section('related', related_content))
    cta = deepcopy(nodes['cta'])
    set_text(cta.xpath('.//h2')[0], service.get('ctaHeading') or f'Book {name.lower()}')
    for node in cta.xpath('.//p'):
        set_text(node, service.get('ctaBody') or page['seo']['description'])
    modules.append(cta)
    modules.append(deepcopy(nodes['site-footer']))
    sections = [{'_key': f'module-{i+1}', 'module': node.get('data-module'), 'html': serialize(node)} for i, node in enumerate(modules)]
    attrs = {**prototype['mainAttributes'], 'data-page': slug}
    def attributes(values):
        return ' '.join(f'{key}="{e(value)}"' for key, value in values.items())
    markup = f'<main {attributes(attrs)}><div {attributes(prototype["wrapperAttributes"])}>' + ''.join(section['html'] for section in sections) + '</div></main>'
    graph = [
        {'@type': settings.get('schemaBusinessType') or 'HVACBusiness', '@id': 'https://citysuburbanheating.com/#business', 'name': settings['companyName'], 'url': 'https://citysuburbanheating.com', 'telephone': settings.get('phoneE164')},
        {'@type': 'Service', 'name': h1, 'serviceType': name, 'url': canonical, 'provider': {'@id': 'https://citysuburbanheating.com/#business'}, 'areaServed': {'@type': 'City', 'name': area['name']}},
        {'@type': 'WebPage', '@id': canonical + '#webpage', 'url': canonical, 'name': h1, 'description': page['seo']['description']},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://citysuburbanheating.com/'}, {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': 'https://citysuburbanheating.com/services/'}, {'@type': 'ListItem', 'position': 3, 'name': name, 'item': canonical}]},
    ]
    if faqs:
        graph.append({'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': faq['question'], 'acceptedAnswer': {'@type': 'Answer', 'text': faq['answer']}} for faq in faqs]})
    filename = f'{cluster}--{slug}.json'
    snapshot = {'style': prototype['style'], 'html': markup, 'schema': json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False), 'mainAttributes': attrs, 'wrapperAttributes': prototype['wrapperAttributes'], 'sections': sections}
    (DEST / filename).write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')
    retained.append({'clusterSlug': cluster, 'directoryClusterSlug': category, 'slug': slug, 'legacySlug': slug, 'name': name,
        'livePath': live_path, 'canonicalUrl': canonical, 'previewUrl': '', 'title': page['seo']['title'], 'description': page['seo']['description'],
        'h1': h1, 'qcStatus': 'RETAINED', 'photoStatus': 'Existing service copy and media retained', 'referenceFile': filename, 'cardImage': hero_image,
        'keyPhrases': list(dict.fromkeys((service.get('primaryKeywords') or []) + (service.get('secondaryKeywords') or []))),
        'sourceServiceId': service['_id'].removeprefix('drafts.'), 'sourcePageId': page['_id'].removeprefix('drafts.'), 'scopeStatus': service.get('scopeStatus', 'confirm')})

(DEST / 'retained-catalog.json').write_text(json.dumps(retained, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
all_pages = catalog + retained
(DEST / 'index.ts').write_text("import type {ReferenceSnapshot} from './types'\n" + ''.join(f"import page{i} from './{entry['referenceFile']}'\n" for i, entry in enumerate(all_pages)) + "\nexport const referenceSnapshots: Record<string, ReferenceSnapshot> = {\n" + ''.join(f"  '{entry['clusterSlug']}/{entry['slug']}': page{i},\n" for i, entry in enumerate(all_pages)) + "}\n", encoding='utf-8')
print(f'Built {len(retained)} retained keyword pages in the approved standard design; {len(all_pages)} total pages')
