# City & Suburban L4 developer handoff

Use this package to reproduce the reviewed City & Suburban service landing-page skeleton and connect it to the three supplied content sheets.

## Start here

1. Read `L4_SKELETON_SPEC.md` for the fixed page structure and merge behavior.
2. Open `City-Suburban-L4-Field-Mapping.xlsx` for the field-by-field human-readable crosswalk.
3. Consume `MERGE_CONTRACT.json` as the machine-readable source contract.
4. Use the three `sample_*.xlsx` files as the authoritative source-header and sample-content fixtures.
5. Compare the result with the included React renderer and Furnace Repair × Lincoln Park sample.
6. Complete every item in `RETURN_CHECKLIST.md` before returning the work.

`sample-l4-landing-page-template.html` is the canonical Highlight Chicago L4 markup, CSS, responsive behavior, and JavaScript. Its layout has not been redesigned. Only the template color tokens have been changed to the approved City & Suburban navy, schedule blue, and call red palette.

## Contract boundary

- Do not rename, remove, reorder by assumption, or silently reinterpret any of the 52 original sheet headers.
- The three sheets remain three source collections: equipment, area, and page-specific.
- A page is identified by `(equipment_slug, area_slug)` and renders at `/services/{equipment_slug}/{area_slug}`.
- Shared business data and shared layout settings belong in `siteSettings` and `servicePageTemplate`; do not duplicate them into every generated page.
- The current repository schemas are included as a renderer reference. They predate this exact 52-field workbook contract. Implement the paths in the mapping workbook/JSON, or add an explicit adapter that produces the same normalized page model.
- Blank page-level overrides mean “inherit the area value.” They do not mean “clear the array.”
- `photo_slots` contains editorial requirements, not image URLs. Actual approved media remains separate.

## Required output from the implementer

Return the implemented parser/merger, matching Sanity schemas or adapter, the sample route, automated tests, and preview evidence. Do not return API tokens, `.env.local`, Vercel secrets, or Sanity write credentials.
