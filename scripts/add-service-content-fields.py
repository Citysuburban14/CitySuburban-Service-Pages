"""Expose the finalized page's copy and images as native Sanity content fields.

Only data attributes are added to the supplied markup; layout and styling remain
unchanged. The HTML field is retained for structural edits and untagged content.
"""
from pathlib import Path
from html import unescape
import json
import re

DEST = Path(__file__).resolve().parents[1] / 'src/reference-pages'
catalog = json.loads((DEST / 'catalog.json').read_text(encoding='utf-8')) + json.loads((DEST / 'retained-catalog.json').read_text(encoding='utf-8'))
total = 0
for page in catalog:
    file = DEST / page['referenceFile']
    snapshot = json.loads(file.read_text(encoding='utf-8'))
    for position, section in enumerate(snapshot['sections']):
        original = section['html']
        markup = re.sub(r' data-content-(?:field|image)="[^"]*"', '', original)
        fields = []
        def copy(match):
            if len(unescape(match[3]).strip()) < 2:
                return match[0]
            key = f's{position+1}-copy-{len(fields)+1}'
            value = unescape(match[3])
            label = ' '.join(value.split())[:90]
            fields.append({'_key': key, 'target': key, 'kind': 'text', 'label': f'{match[1].upper()}: {label}', 'value': value})
            return f'<{match[1]} data-content-field="{key}"{match[2]}>{match[3]}</{match[1]}>'
        markup = re.sub(r'<(h1|h2|h3|p|li|span|strong|option|a|summary|blockquote|figcaption)(\s[^>]*|)>([^<>]+)</\1>', copy, markup)
        def image(match):
            tag = match[0]
            src = re.search(r'\bsrc="([^"]*)"', tag)
            if not src:
                return tag
            key = f's{position+1}-image-{len(fields)+1}'
            alt = re.search(r'\balt="([^"]*)"', tag)
            label = unescape(alt[1]) if alt and alt[1] else src[1].rsplit('/', 1)[-1]
            fields.append({'_key': key + '-src', 'target': key, 'kind': 'image', 'label': f'Image: {label}', 'value': unescape(src[1])})
            if alt:
                fields.append({'_key': key + '-alt', 'target': key, 'kind': 'alt', 'label': f'Alt text: {label}', 'value': unescape(alt[1])})
            return tag.replace('<img', f'<img data-content-image="{key}"', 1)
        markup = re.sub(r'<img\b[^>]*>', image, markup)
        section['html'] = markup
        section['contentFields'] = fields
        if original not in snapshot['html']:
            raise SystemExit(f"Section not in full markup: {page['slug']}/{section['module']}")
        snapshot['html'] = snapshot['html'].replace(original, markup, 1)
        total += len(fields)
    file.write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')
print(f'Added {total} editable copy/image fields across {len(catalog)} pages without changing the layout')
