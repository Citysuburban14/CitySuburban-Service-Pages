"""Rebuild the 17 retained service pages from the approved standard template.

Every section is cloned from the finalized heater-repair page and then filled with
the retained page's own copy, so retained and newer pages share one layout and one
set of styles. Retained pages follow the guide-free landing format: the repeated
four-tab "library" guide and the generic company-fact cards are not rendered.

Copy comes from the Sanity export. Sentences written for editors (source files,
drafts, keyword research, CMS notes) are removed before rendering, and
data/audit-corrections/ applies reviewed text corrections.
No service is deleted or published by this script.

Run order: this script, scripts/apply-page-text-corrections.py,
scripts/apply-audit-shared-fixes.py, scripts/add-service-content-fields.py, then
npx tsx scripts/refresh-service-card-navigation.tsx (see docs/AUDIT_CORRECTIONS.md).
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
# Reviewed text corrections, one file per page (data/audit-corrections/<cluster>--<slug>.json).
# Retained pages use target "source": exact phrases of the Sanity export copy.
corrections = {}
for file in sorted((REPO / 'data/audit-corrections').glob('*.json')):
    entry = json.loads(file.read_text(encoding='utf-8'))
    if entry.get('target') == 'source':
        corrections[file.stem] = entry['fixes']
catalog = json.loads((DEST / 'catalog.json').read_text(encoding='utf-8'))
prototype = json.loads((DEST / 'heating--heater-repair.json').read_text(encoding='utf-8'))
STRIP_FIELDS = re.compile(r' data-content-(?:field|image)="[^"]*"')
nodes = {section['module']: html.fromstring(STRIP_FIELDS.sub('', section['html'])) for section in prototype['sections']}
by_id = {}
for doc in sorted(documents, key=lambda doc: doc['_id'].startswith('drafts.')):
    by_id[doc['_id'].removeprefix('drafts.')] = doc
settings = by_id['siteSettings']
area = next(doc for doc in by_id.values() if doc['_type'] == 'serviceArea')
pages = [doc for doc in by_id.values() if doc['_type'] == 'servicePage']
services = [doc for doc in by_id.values() if doc['_type'] == 'serviceDefinition']
CATEGORY_NAMES = {'heating': 'home heating', 'cooling': 'home cooling', 'air-quality': 'air quality', 'commercial': 'commercial HVAC'}

# --- Copy hygiene -----------------------------------------------------------
# Sentences that describe the content pipeline rather than the service.
INTERNAL = re.compile(
    r'\b(sanity|workbook|source pack|source file|search file|source workbook|content set|'
    r'remains a draft|stays in draft|is a draft|page is a draft|draft until|unpublished|before publication|'
    r'publishes chicago only|scope flags?|keywords?|monthly searches|search volume|search result|'
    r'the page does not invent|this page|an editor|editors?\b|canvas|not verified in the source|'
    r'verified core hvac scope|adjacent (?:attachment )?service|owner confirms|public profile and source|'
    r'source shows|in the source|the source|permit-count theatre|city file|brand-specific demand)\b', re.I)
SPELLING = {'neighbourhoods': 'neighborhoods', 'neighbourhood': 'neighborhood', 'Neighbourhoods': 'Neighborhoods',
    'Neighbourhood': 'Neighborhood', 'draught': 'draft', 'colour': 'color', 'centre': 'center', 'favour': 'favor',
    'behaviour': 'behavior', 'metres': 'meters', 'labour': 'labor', 'organise': 'organize', 'programme': 'program',
    'licence': 'license', 'licences': 'licenses', 'façade': 'facade'}

# Editor-facing phrasings that carry a useful fact: reword instead of dropping.
PHRASES = {'in the city source': "in Chicago's permit records", 'The city source classifies': "Chicago's permit records classify",
    'in the city permit source': "in Chicago's permit records", 'the city source': "Chicago's permit records",
    'The city source': "Chicago's permit records"}

def us_spelling(text):
    for phrase, plain in PHRASES.items():
        text = text.replace(phrase, plain)
    for british, american in SPELLING.items():
        text = re.sub(rf'\b{british}\b', american, text)
    return text

def clean(text, slug=''):
    """Drop editor-facing sentences, apply page corrections and US spelling."""
    if not text:
        return ''
    text = str(text)
    for fix in corrections.get(slug, []):
        text = text.replace(fix['find'], fix['replace'])
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9“"])', text.strip())
    kept = [sentence for sentence in sentences if sentence and not INTERNAL.search(sentence)]
    return us_spelling(' '.join(kept)).strip()

def e(value):
    return escape(str(value or ''), quote=True)

def set_text(node, value):
    for child in list(node):
        node.remove(child)
    node.text = str(value or '')

def fill_heading(section_node, eyebrow, before, accent, lede=None):
    """Fill the standard eyebrow, two-tone H2 and lede of a cloned section."""
    paragraphs = section_node.xpath('./div/p')
    if eyebrow is not None and paragraphs:
        set_text(paragraphs[0], eyebrow)
    h2 = section_node.xpath('.//h2')[0]
    span = h2.xpath('./span')
    span = deepcopy(span[0]) if span else None
    set_text(h2, before)
    if span is not None and accent:
        set_text(span, accent)
        h2.text = before.rstrip() + ' '
        h2.append(span)
    if lede is not None:
        lede_node = next((p for p in paragraphs[1:] if p.getprevious() is not None and p.getprevious().tag == 'h2'), None)
        if lede_node is not None:
            if lede:
                set_text(lede_node, lede)
            else:
                lede_node.getparent().remove(lede_node)

def replace_items(container, template, values, fill):
    for child in list(container):
        container.remove(child)
    container.text = '\n'
    for index, value in enumerate(values):
        item = deepcopy(template)
        fill(item, value, index)
        item.tail = '\n'
        container.append(item)

def resolve_image(image):
    return (image or {}).get('resolvedUrl') or (image or {}).get('externalUrl')

def serialize(node):
    markup = html.tostring(node, encoding='unicode', method='html')
    return markup.replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio=')

def month_label(date):
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    match = re.match(r'(\d{4})-(\d{2})', date or '')
    return f'{months[int(match[2]) - 1]} {match[1]}' if match else ''

# --- Approved shared facts (same wording as the newer landing pages) ---------
QUICK_FACTS = [('NATE-certified', 'Technicians'), ('Upfront pricing', 'No hidden fees'),
    ('When the schedule allows', 'Same-day service'), ('1952', 'Family-owned since'), ('4.98', '204 Google reviews')]
LOCATION_FAQ = ('Which areas does City & Suburban serve?',
    'City & Suburban serves 21 areas: 13 Chicago neighborhoods and 8 suburbs. Each area appears in the service areas list '
    'above, with a link to its local page. For an address outside those 21 areas, call (773) 238-3838 to check whether '
    'a visit is possible.')
UNCONFIRMED_NOTE = ('Call (773) 238-3838 before booking. City & Suburban confirms whether this work fits its current service '
    'scope at your address before scheduling a visit.')

retained = []
for service in sorted(services, key=lambda doc: doc['serviceId']):
    slug = service['slug']['current']
    if slug in migrations['overlaps']:
        continue
    page = next(doc for doc in pages if doc['service']['_ref'].removeprefix('drafts.') == service['_id'].removeprefix('drafts.'))
    cluster = service['cluster']['_ref'].removeprefix('cluster-')
    category = migrations['directoryCategories'][cluster]
    name = service['name']
    lower = ' '.join(word if word.isupper() and len(word) > 1 else word.lower() for word in name.split())
    h1 = f"{service['h1Prefix']} in {area['name']}"
    live_path = f'/services/{cluster}/{slug}/'
    canonical = 'https://citysuburbanheating.com' + live_path
    scope = service.get('scopeStatus', 'confirm')
    confirmed = scope == 'core'
    c = lambda value: clean(value, f'{cluster}--{slug}')
    gallery = page.get('gallery') or []
    hero_image = resolve_image(page.get('coverImage')) or next((resolve_image(image) for image in gallery if resolve_image(image)), None)
    modules = []

    # Header (replaced at render time by the shared live menu) and hero.
    header = deepcopy(nodes['site-header'])
    primary_links = header.xpath('.//nav[@aria-label="Primary"]/a')
    if primary_links:
        primary_links[-1].set('href', '/services/')
        set_text(primary_links[-1], 'Services')
    modules.append(header)
    hero = deepcopy(nodes['hero'])
    background = hero.xpath('./img')[0]
    if hero_image:
        background.set('src', hero_image)
        background.set('alt', '')
    else:
        hero.remove(background)
    breadcrumb = hero.xpath('.//nav[@aria-label="Breadcrumb"]')[0]
    breadcrumb.clear()
    breadcrumb.set('aria-label', 'Breadcrumb')
    breadcrumb.set('style', 'font-size:13px;color:rgba(255,255,255,.75)')
    label = category.replace('-', ' ').title()
    breadcrumb.append(html.fromstring(f'<span><a style="color:inherit" href="https://citysuburbanheating.com/">Home</a> › <a style="color:inherit" href="/services/">Services</a> › <a style="color:inherit" href="/services/{category}/">{e(label)}</a> › {e(name)}</span>'))
    column = hero.xpath('.//div[@class="r-cols"]/div[1]')[0]
    set_text(column.xpath('./span')[0], f'{area["name"]} {name}')
    set_text(hero.xpath('.//h1')[0], h1)
    set_text(column.xpath('./p')[0], c(service.get('heroLede')) or c(page['seo']['description']))
    bullets = column.xpath('./ul')[0]
    bullets.clear()
    bullets.set('style', 'margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px 22px;font-size:15px;font-weight:600')
    for line in settings.get('trustLines', [])[:3]:
        bullets.append(html.fromstring(f'<li style="display:inline-flex;gap:8px;align-items:center"><span style="color:#E8574B" aria-hidden="true">✓</span>{e(line)}</li>'))
    for node in column.xpath('./p')[1:]:
        set_text(node, 'Updated October 2026')
    form = hero.xpath('.//form')[0]
    form.set('aria-label', f'Request {lower}')
    set_text(form.xpath('./h2')[0], f'Request {lower}')
    set_text(form.xpath('./p')[0], c(page.get('formSubtitle')) or 'Describe what the equipment is doing.')
    form_note = UNCONFIRMED_NOTE if not confirmed else (c(page.get('formNote')) or 'Call (773) 238-3838 to discuss your service request.')
    set_text(form.xpath('./p')[-1], form_note)
    select = form.xpath('.//select')[0]
    select.getparent().text = (c(service.get('issueQuestion')) or 'What is happening?') + '\n'
    select.clear()
    select.set('name', 'issue')
    for issue in service.get('issueOptions') or ['Request service']:
        option = html.Element('option')
        option.text = c(issue) or issue
        select.append(option)
    modules.append(hero)
    modules.append(deepcopy(nodes['trust']))

    # Quick facts: the approved company facts, in the standard blue band.
    facts = deepcopy(nodes['quick-facts'])
    band = facts.xpath('.//div/div/div')[0].getparent()
    def fill_fact(item, value, _index):
        spans = item.xpath('./span')
        set_text(spans[0], value[0])
        set_text(spans[1], value[1])
    replace_items(band, band[0], QUICK_FACTS, fill_fact)
    modules.append(facts)

    # Pricing: standard numbered driver cards beside the shared written-price block.
    pricing = service.get('pricing') or {}
    if pricing.get('rows'):
        section = deepcopy(nodes['pricing'])
        fill_heading(section, 'Pricing', 'What determines', f'{lower} cost?', c(pricing.get('lede')) or None)
        grid = section.xpath('.//div[contains(@class,"r-cols")]/div[1]')[0]
        def fill_driver(item, row, index):
            set_text(item.xpath('./span[1]')[0], str(index + 1))
            body = item.xpath('./span[2]')[0]
            set_text(body.xpath('./strong')[0], c(row['job']))
            detail = '. '.join(filter(None, [c(row.get('driver')), c(row.get('permit'))]))
            set_text(body.xpath('./span')[0], detail.rstrip('.') + '.')
        replace_items(grid, grid[0], pricing['rows'], fill_driver)
        note = c(pricing.get('note'))
        if note:
            lede_style = section.xpath('./div/p')[1].get('style') if len(section.xpath('./div/p')) > 1 else 'margin:24px auto 0;max-width:760px;text-align:center;color:rgba(255,255,255,0.88)'
            note_node = html.fromstring(f'<p style="{e(lede_style)}">{e(note)}</p>')
            note_node.set('style', note_node.get('style').replace('0 auto 36px', '28px auto 0'))
            section.xpath('./div')[0].append(note_node)
        modules.append(section)

    # Systems: standard image cards (legacy line icons on a tinted panel), the
    # standard brand strip, and the service-specific checklist as a callout.
    if service.get('types'):
        section = deepcopy(nodes['systems'])
        fill_heading(section, 'Equipment and configurations', name, 'by configuration', None)
        lede = c(service.get('typesLede'))
        h2 = section.xpath('.//h2')[0]
        if lede:
            h2.addnext(html.fromstring(f'<p style="margin: 0 auto 32px; max-width: 760px; text-align: center; font-size: 17px; line-height: 1.6;">{e(lede)}</p>'))
        card_template = section.xpath('.//div[@data-role="card"]')[0]
        grid = card_template.getparent()
        def fill_card(item, value, _index):
            image = item.xpath('./img')[0]
            icon = value.get('legacyIconSvg') or ''
            panel = html.fromstring(f'<div aria-hidden="true" style="aspect-ratio: 4 / 3; background: #E3EEF7; display: flex; align-items: center; justify-content: center;"><svg viewBox="0 0 48 48" width="104" height="104" fill="none" stroke="#0A4265" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></div>')
            image.addprevious(panel)
            image.getparent().remove(image)
            set_text(item.xpath('./div')[-1], c(value['name']))
            set_text(item.xpath('./p')[0], c(value.get('description')))
        replace_items(grid, card_template, service['types'], fill_card)
        brands_block = section.xpath('.//div[@data-module="brands"]')
        if brands_block:
            block = brands_block[0]
            if service.get('brands'):
                set_text(block.xpath('./h3')[0], 'Equipment names we see')
                logos = block.xpath('.//figure[@data-role="brand-logo"]')[0].getparent()
                logo_template = logos.xpath('./figure')[0]
                def fill_logo(item, brand, _index):
                    brand_slug = re.sub(r'[^a-z0-9]+', '-', brand.lower().replace('&', ' and ')).strip('-')
                    image = item.xpath('.//img')[0]
                    if (REPO / 'public/images/brands' / f'{brand_slug}.png').exists():
                        image.set('src', f'/services/images/brands/{brand_slug}.png')
                        image.set('alt', brand)
                    else:
                        text = html.fromstring(f'<span style="font-family: \'Ubuntu\', sans-serif; font-weight: 500; font-size: 16px; color: #09263A;">{e(brand)}</span>')
                        image.addprevious(text)
                        image.getparent().remove(image)
                replace_items(logos, logo_template, service['brands'], fill_logo)
                note = ' '.join(filter(None, [c(service.get('brandsLede')), c(service.get('brandsNote'))]))
                if note:
                    block.append(html.fromstring(f'<p style="margin: 14px auto 0; max-width: 760px; text-align: center; font-size: 14px; color: #606060;">{e(note)}</p>'))
            else:
                block.getparent().remove(block)
        why = (service.get('whyItems') or [])[-1:]
        footnote = c(service.get('typesFootnote'))
        callout_items = [(c(item['title']), c(item['body'])) for item in why if c(item.get('body'))]
        if footnote:
            callout_items.append(('Before the visit', footnote))
        for title, body in callout_items:
            section.xpath('./div')[0].append(html.fromstring(
                f'<div style="margin-top: 28px; background: #F6F8FA; border-left: 4px solid #C9302A; border-radius: 10px; padding: 20px 24px;">'
                f'<h3 style="margin: 0 0 8px; font-family: \'Ubuntu\', sans-serif; font-weight: 500; font-size: 20px; color: #09263A;">{e(title)}</h3>'
                f'<p style="margin: 0; font-size: 16px; line-height: 1.65;">{e(body)}</p></div>'))
        modules.append(section)

    # Process (shared six steps; tailored by the shared-fix script).
    modules.append(deepcopy(nodes['process']))

    # Reviews: standard star cards with exact excerpts and Google links.
    reviews = [review for review in page.get('reviews') or [] if review.get('quote')]
    if reviews:
        section = deepcopy(nodes['reviews'])
        fill_heading(section, 'Reviews', f'{name}', "in customers' words",
            'Short excerpts from verified Google reviews of City & Suburban. Each card links to the full review.')
        figure_template = section.xpath('.//figure[@data-role="review"]')[0]
        track = figure_template.getparent()
        def fill_review(item, review, _index):
            quote = review['quote'].strip()
            set_text(item.xpath('./blockquote')[0], f'“{quote}”')
            caption = item.xpath('./figcaption')[0]
            set_text(caption.xpath('./strong')[0], review.get('author') or 'Google reviewer')
            link = caption.xpath('./a')[0]
            link.set('href', review.get('sourceUrl') or 'https://www.google.com/maps/place/City+%26+Suburban+Heating+%26+Cooling')
            set_text(link, f'Google · {month_label(review.get("date"))} ↗')
        replace_items(track, figure_template, reviews, fill_review)
        # The work-photo strip shows heater-specific jobs; it is not repeated here.
        gallery_heading = section.xpath('.//h3[contains(., "City & Suburban work")]')
        if gallery_heading:
            node = gallery_heading[0]
            for sibling in list(node.itersiblings()):
                node.getparent().remove(sibling)
            node.getparent().remove(node)
        modules.append(section)

    # Service areas: the standard 21-area registry and map.
    section = deepcopy(nodes['service-areas'])
    fill_heading(section, None, f'{name} across', 'Chicago and nearby suburbs', None)
    # The cloned module carries heater-repair wording; make it service-neutral.
    for node in section.iter():
        for attribute in ('text', 'tail'):
            value = getattr(node, attribute)
            if value and ('heater symptom' in value or 'Heater repair coverage' in value):
                value = value.replace('A repair request should include the address, heater symptom, and whether the home has lost heat completely.',
                    'A request should include the address and a short description of what the equipment is doing.')
                value = value.replace('Heater repair coverage includes', f'{name} coverage includes')
                setattr(node, attribute, value)
    modules.append(section)

    # FAQ: standard accordion. Service FAQs first, then one area FAQ.
    faqs = []
    for item in service.get('faqs') or []:
        question, answer = c(item['question']), c(item['answer'])
        if not answer and not confirmed:
            answer = UNCONFIRMED_NOTE
        if question and answer:
            faqs.append((question, answer))
    faqs.append(LOCATION_FAQ)
    section = deepcopy(nodes['faq'])
    set_text(section.xpath('.//h2')[0], f'{name} questions')
    faq_template = section.xpath('.//details[@data-role="faq"]')[0]
    container = faq_template.getparent()
    def fill_faq(item, value, index):
        if index:
            item.attrib.pop('open', None)
        else:
            item.set('open', '')
        set_text(item.xpath('./summary')[0], value[0])
        set_text(item.xpath('./p')[0], value[1])
    replace_items(container, faq_template, faqs, fill_faq)
    modules.append(section)

    # Related: standard photo cards from the same directory.
    related = [entry for entry in catalog if entry['clusterSlug'] == category][:4]
    if related:
        section = deepcopy(nodes['related'])
        fill_heading(section, None, 'Other', f'{CATEGORY_NAMES.get(category, "HVAC")} services', None)
        card_template = section.xpath('.//a[@data-role="card"]')[0]
        grid = card_template.getparent()
        def fill_related(item, entry, _index):
            item.set('href', entry['livePath'])
            image = item.xpath('./img')[0]
            if entry.get('cardImage'):
                image.set('src', entry['cardImage'])
            image.set('alt', entry['name'])
            spans = item.xpath('./span')
            set_text(spans[0], entry['name'])
            set_text(spans[1], entry.get('description') or '')
        replace_items(grid, card_template, related, fill_related)
        modules.append(section)

    cta = deepcopy(nodes['cta'])
    set_text(cta.xpath('.//h2')[0], f'Book {lower} in {area["name"]}' if confirmed else f'Ask about {lower} in {area["name"]}')
    for node in cta.xpath('.//p'):
        set_text(node, (c(service.get('ctaBody')) or c(page['seo']['description'])) if confirmed else UNCONFIRMED_NOTE)
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
        {'@type': 'WebPage', '@id': canonical + '#webpage', 'url': canonical, 'name': h1, 'description': c(page['seo']['description'])},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://citysuburbanheating.com/'}, {'@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': 'https://citysuburbanheating.com/services/'}, {'@type': 'ListItem', 'position': 3, 'name': name, 'item': canonical}]},
        {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': question, 'acceptedAnswer': {'@type': 'Answer', 'text': answer}} for question, answer in faqs]},
    ]
    filename = f'{cluster}--{slug}.json'
    snapshot = {'style': prototype['style'], 'html': markup, 'schema': json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False), 'mainAttributes': attrs, 'wrapperAttributes': prototype['wrapperAttributes'], 'sections': sections}
    (DEST / filename).write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')
    retained.append({'clusterSlug': cluster, 'directoryClusterSlug': category, 'slug': slug, 'legacySlug': slug, 'name': name,
        'livePath': live_path, 'canonicalUrl': canonical, 'previewUrl': '', 'title': page['seo']['title'], 'description': c(page['seo']['description']),
        'h1': h1, 'qcStatus': 'RETAINED', 'photoStatus': 'Existing service copy and media retained', 'referenceFile': filename, 'cardImage': hero_image,
        'keyPhrases': list(dict.fromkeys((service.get('primaryKeywords') or []) + (service.get('secondaryKeywords') or []))),
        'sourceServiceId': service['_id'].removeprefix('drafts.'), 'sourcePageId': page['_id'].removeprefix('drafts.'), 'scopeStatus': scope})

(DEST / 'retained-catalog.json').write_text(json.dumps(retained, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
all_pages = catalog + retained
(DEST / 'index.ts').write_text("import type {ReferenceSnapshot} from './types'\n" + ''.join(f"import page{i} from './{entry['referenceFile']}'\n" for i, entry in enumerate(all_pages)) + "\nexport const referenceSnapshots: Record<string, ReferenceSnapshot> = {\n" + ''.join(f"  '{entry['clusterSlug']}/{entry['slug']}': page{i},\n" for i, entry in enumerate(all_pages)) + "}\n", encoding='utf-8')
print(f'Rebuilt {len(retained)} retained pages on the standard template; {len(all_pages)} total pages')
