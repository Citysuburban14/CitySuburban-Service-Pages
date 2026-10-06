"""Apply reviewed, page-specific text corrections to the newer landing pages.

Corrections live in data/audit-corrections/<cluster>--<slug>.json:

    {"target": "html", "fixes": [{"find": "...", "replace": "...", "why": "..."}]}

"find" is an exact fragment of the page markup (text as it appears in the HTML,
for example "&amp;" for "&"). Each find must occur exactly once in the page, or
already be replaced. Retained pages use target "source" and are applied by
scripts/build-retained-service-pages.py instead.

Usage:
    python scripts/apply-page-text-corrections.py            # apply
    python scripts/apply-page-text-corrections.py --check    # validate only

Run after scripts/build-retained-service-pages.py and before
scripts/apply-audit-shared-fixes.py.
"""
from pathlib import Path
import json
import re
import sys

REPO = Path(__file__).resolve().parents[1]
DEST = REPO / 'src/reference-pages'
check_only = '--check' in sys.argv
FIELD = re.compile(r' data-content-(?:field|image)="[^"]*"')
problems, applied, already = [], 0, 0
for file in sorted((REPO / 'data/audit-corrections').glob('*.json')):
    entry = json.loads(file.read_text(encoding='utf-8'))
    if entry.get('target') != 'html':
        continue
    page = DEST / f'{file.stem}.json'
    if not page.exists():
        problems.append(f'{file.name}: no page {page.name}')
        continue
    snapshot = json.loads(page.read_text(encoding='utf-8'))
    # Editing markers never form part of a correction; compare without them.
    snapshot['html'] = FIELD.sub('', snapshot['html'])
    for section in snapshot['sections']:
        section['html'] = FIELD.sub('', section['html'])
    for number, fix in enumerate(entry['fixes'], 1):
        find, replace = fix['find'], fix['replace']
        count = snapshot['html'].count(find)
        # Already applied: the find is gone (deletion or rewrite), or the fix only
        # adds text around the find and its full replacement is already present.
        if (count == 0 and (not replace or replace in snapshot['html'])) or (replace and find in replace and replace in snapshot['html']):
            already += 1
            continue
        if count != 1:
            problems.append(f'{file.stem} fix {number}: find occurs {count} times: {find[:90]!r}')
            continue
        holders = [section for section in snapshot['sections'] if find in section['html']]
        if len(holders) != 1 or holders[0]['html'].count(find) != 1:
            problems.append(f'{file.stem} fix {number}: not inside exactly one section: {find[:90]!r}')
            continue
        snapshot['html'] = snapshot['html'].replace(find, replace, 1)
        holders[0]['html'] = holders[0]['html'].replace(find, replace, 1)
        applied += 1
    if not check_only:
        page.write_text(json.dumps(snapshot, ensure_ascii=False), encoding='utf-8')

print(f'{"Checked" if check_only else "Applied"} {applied} corrections; {already} already applied; {len(problems)} problems')
for problem in problems:
    print('  -', problem)
if problems:
    sys.exit(1)
