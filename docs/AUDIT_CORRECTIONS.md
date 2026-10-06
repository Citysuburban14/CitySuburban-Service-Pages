# Published-page audit corrections (October 2026)

The audit of the live service pages (5 October 2026) found two kinds of problems:

1. **Mixed templates.** The 17 retained pages (older service copy) were wrapped in the new section containers but rendered their content as simple generic cards, plus an old four-tab "library" guide. They looked different from the 24 newer pages.
2. **Content.** Unverified claims (license, satisfaction guarantee, company procedures), unsafe emergency wording, out-of-date legal claims, editor notes visible to customers, and British spelling.

## How the pages are regenerated

Run these five steps, in this order, from the repository root:

```bash
python scripts/build-retained-service-pages.py
python scripts/apply-page-text-corrections.py
python scripts/apply-audit-shared-fixes.py
python scripts/add-service-content-fields.py
npx tsx scripts/refresh-service-card-navigation.tsx
```

| Step | What it does |
| --- | --- |
| `build-retained-service-pages.py` | Rebuilds the 17 retained pages by cloning each section of the standard template (heater repair) and filling it with that page's copy. Drops the library guide and generic company cards. Removes editor-facing sentences. Applies `target: "source"` corrections. |
| `apply-page-text-corrections.py` | Applies `target: "html"` corrections to the 24 newer pages. Each find must match exactly once. `--check` validates without writing. |
| `apply-audit-shared-fixes.py` | Template-wide fixes on all 41 pages: unverified credential cards, reviewer byline, process steps 5–6, unrelated furnace/AC product strip, US spelling, FAQ structured data rebuilt from the visible FAQ. Idempotent. |
| `add-service-content-fields.py` | Re-adds the Sanity editing markers. |
| `refresh-service-card-navigation.tsx` | Sets each service's hand-picked card photo and stores the current shared header in every page. Always last. |

## Corrections files

`data/audit-corrections/<cluster>--<slug>.json`, one per page:

```json
{"target": "html", "fixes": [{"find": "...", "replace": "...", "why": "audit item"}]}
```

- `target: "html"` (newer pages): `find` is an exact fragment of the page markup.
- `target: "source"` (retained pages): `find` is an exact phrase of the Sanity export copy that the builder renders.

## Approved facts used in corrections

Founded 1952, family owned, second generation, owner Rob. 4.98 across 204 Google reviews (31 Aug 2026). NATE-certified technicians. Upfront written price before work, no hidden fees. Diagnosis before any quote. Same-day service when the schedule allows. Emergency HVAC service every day till midnight, except Sundays. Maintenance-plan members get priority dispatch. Wells Fargo Home Projects financing, subject to credit approval. 21 service areas (13 Chicago neighborhoods, 8 suburbs). Licenses are not verified.

Anything else about the company (procedures, deliverables, timeframes, plan terms) is written as what a good assessment or written quote should include.

## Not changed by code (owner decisions)

- The top bar deliberately matches the live WordPress header exactly ("Working Hours: 24/7" and the Google rating image). Owner decision, 6 October 2026. The audit flagged this against the registered emergency-hours fact (till midnight, except Sundays), which page copy still uses.

- Whether to keep, confirm or withdraw services whose scope is unconfirmed (refrigeration, generator, attic fan, ceiling fan, dryer vent, exhaust fan, chimney, wood/pellet stove and others with `scopeStatus` other than `core`). Their pages now ask customers to call and confirm before booking.
- Word-count, FAQ-depth and image targets from the audit's quality specification.
- Registering evidence for new claims, new photos, and the "installs American Standard" statement.
- Sanity: the 41 `referenceServicePage` documents are drafts and are not rendered. If they are ever published, re-import them from these files first (`scripts/import-reference-pages.ts`) so the corrections are not lost.
