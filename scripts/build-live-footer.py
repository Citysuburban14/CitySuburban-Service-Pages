"""Capture the public WordPress footer and apply it to every service snapshot.

Run after page generators and before add-service-content-fields.py. CSS is scoped
to this footer so the approved page and collection designs retain their styling.
"""
from pathlib import Path
from lxml import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'src/reference-pages'
source = ROOT.parent / '.reference-preview/live-footer-source.html'
shared_file = DEST / 'shared-footer.json'

def scope(css):
    output = ''
    while css.strip():
        start = css.index('{')
        prelude = css[:start].strip()
        depth, end = 1, start + 1
        while depth:
            depth += (css[end] == '{') - (css[end] == '}')
            end += 1
        body = css[start + 1:end - 1]
        if prelude.startswith('@'):
            output += prelude + '{' + scope(body) + '}'
        else:
            selectors = []
            for selector in prelude.split(','):
                selector = selector.strip()
                selectors.append('#live-site-footer' + (selector[6:] if selector.startswith('footer ') else ' ' + selector))
            output += ','.join(selectors) + '{' + body + '}'
        css = css[end:]
    return output

if source.exists():
    document = source.read_text(encoding='utf-8')
    parsed = html.fromstring(document)
    footer = re.search(r'<footer>.*?</footer>', document, re.S).group(0)
    footer = footer.replace('<footer>', '<footer id="live-site-footer" data-module="site-footer">', 1)
    footer = footer.replace('https://citysuburbanheating.com/wp-content/uploads/2025/05/city-suburban-transparent-logo.png', '/services/images/live-footer-logo.png')
    for old, new in {'heating-services': 'heating', 'cooling-services': 'cooling', 'air-quality-service': 'air-quality', 'commercial-hvac-service': 'commercial'}.items():
        footer = footer.replace('/service/' + old + '/', '/services/' + new + '/')
        footer = footer.replace('/services/' + old + '/', '/services/' + new + '/')
    footer = re.sub(r'<!--.*?-->', '', footer, flags=re.S)
    # WordPress's Cloudflare email protection decodes this in the live browser.
    # Our pages use the observed decoded address and do not need its script.
    footer = re.sub(r'<a href="/cdn-cgi/l/email-protection[^>]*>.*?</a>', '<a href="mailto:service@citysuburbanheating.com">service@citysuburbanheating.com</a>', footer, flags=re.S)
    footer = re.sub(r'<script\b[^>]*>.*?</script>', '', footer, flags=re.S)
    for label in ('Facebook', 'Instagram', 'Yelp'):
        domain = {'Facebook': 'www.facebook.com', 'Instagram': 'www.instagram.com', 'Yelp': 'www.yelp.com'}[label]
        footer = re.sub(r'(<a href="https://' + re.escape(domain) + r'[^>]+)', r'\1 aria-label="' + label + '"', footer)
    footer = footer.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
    footer_css = next(style for style in parsed.xpath('//style/text()') if '.footer-columns' in style)
    footer_css = re.sub(r'/\*.*?\*/', '', footer_css, flags=re.S)
    base = '''#live-site-footer{--primary-color:#09263A;--secondary-color:#DD382B;font-family:var(--font-noto-sans),"Noto Sans",sans-serif;font-size:16px;line-height:normal;color:#0C1E35;background:#fff}
#live-site-footer *,#live-site-footer *::before,#live-site-footer *::after{box-sizing:border-box;margin:0;padding:0}
#live-site-footer .container{max-width:1170px;width:100%;padding:0 15px;margin:0 auto}
#live-site-footer img{height:auto;object-fit:cover;display:block;max-width:100%;border-radius:0}
#live-site-footer h4{font-family:var(--font-ubuntu),Ubuntu,sans-serif;font-size:clamp(20px,3.5vw,28px);line-height:clamp(28px,4.5vw,36px);font-weight:600;margin-bottom:12px;letter-spacing:normal;color:#0C1E35}
#live-site-footer p{font-size:clamp(16px,2.5vw,18px);line-height:clamp(24px,3vw,26px)}
#live-site-footer a{font-size:18px;line-height:26px;text-decoration:none;letter-spacing:normal}
#live-site-footer li{font-size:18px;line-height:26px}
#live-site-footer strong{font-family:inherit;font-weight:700}
#live-site-footer svg{flex-shrink:0}
#live-site-footer .footer-bottom a{color:#fff}
'''
    css = base + scope(footer_css)
    # Allow the long contact text to wrap at narrow widths without overflow.
    css += '\n#live-site-footer .links a{overflow-wrap:anywhere}#live-site-footer :focus-visible{outline:3px solid #DD382B;outline-offset:3px}\n'
    shared_file.write_text(json.dumps({'html': footer, 'style': css, 'sourceUrl': 'https://citysuburbanheating.com/services/heating/heater-repair/'}, ensure_ascii=False), encoding='utf-8')

shared = json.loads(shared_file.read_text(encoding='utf-8'))
catalog = json.loads((DEST / 'catalog.json').read_text()) + json.loads((DEST / 'retained-catalog.json').read_text())
for item in catalog:
    file = DEST / item['referenceFile']
    snapshot = json.loads(file.read_text(encoding='utf-8'))
    section = next(section for section in snapshot['sections'] if section['module'] == 'site-footer')
    snapshot['html'] = snapshot['html'].replace(section['html'], shared['html'], 1)
    section['html'] = shared['html']
    section.pop('contentFields', None)
    marker = '\n/* Live WordPress footer */\n'
    snapshot['style'] = snapshot['style'].split(marker)[0] + marker + shared['style']
    file.write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')
print(f'Applied the exact shared live footer to {len(catalog)} service pages')
