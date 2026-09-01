# Exact L4 skeleton and sheet mapping specification

Version: `city-suburban-l4@1.0.0`

Reference page: Furnace Repair × Lincoln Park at `/services/furnace/lincoln-park`.

## 1. Source collections

### Equipment collection — 14 exact source headers

`slug`, `display_name`, `display_name_lower`, `category_group`, `category_slug`, `symptom_word`, `permit_fee`, `price_min`, `price_max`, `seasonal_advice`, `common_problems`, `price_table`, `faqs_generic`, `contractor_questions`

One row is reusable across all areas for the same equipment.

### Area collection — 19 exact source headers

`slug`, `display_name`, `zip`, `lat`, `lon`, `distance_minutes`, `distance_miles`, `example_cross_streets`, `map_query`, `housing_stock_paragraph_1`, `housing_stock_paragraph_2`, `landmark_note`, `boundary_description`, `parking_note`, `population_note`, `building_types`, `subareas`, `nearby_area_links`, `faqs_generic`

One row is reusable across all equipment pages for the same location.

### Page-specific collection — 19 exact source headers

`equipment_slug`, `area_slug`, `meta_description_hook`, `opening_paragraph`, `quick_answer`, `typical_finds`, `permit_total`, `permit_equip_count`, `permit_brands`, `permit_commentary`, `guide_intro`, `contractor_question_custom_label`, `contractor_question_custom`, `photo_slots`, `reviews`, `faqs_custom`, `subareas`, `nearby_area_links`, `faqs_generic`

One row is the equipment × area intersection. The composite key must be unique.

## 2. Required collections in Sanity

Keep these document responsibilities separate:

1. `serviceDefinition` — normalized equipment-sheet row.
2. `serviceArea` — normalized area-sheet row.
3. `servicePageSource` or imported page fields on `servicePage` — normalized page-specific row.
4. `servicePageTemplate` — versioned standard L4 section order and presentation rules.
5. `servicePage` — references one service, one area, and one template; holds page-specific copy, SEO, reviews, and media.
6. `siteSettings` — company identity, phone, scheduling action, global ratings, trust content, navigation, and footer.

The detailed source-to-target paths are in the mapping workbook. If the implementation uses different internal names, provide a typed adapter that emits the exact normalized contract in `MERGE_CONTRACT.json`.

## 3. Merge algorithm

Run this in one tested parser/merger module, not inside presentation components.

1. Find exactly one page-specific row by `(equipment_slug, area_slug)`.
2. Join `equipment_slug` to `equipment.slug` and `area_slug` to `area.slug`; each must resolve exactly once.
3. Load the active versioned L4 template and `siteSettings`.
4. Parse every delimited field according to the rules below.
5. Apply page overrides. A nonblank page value for `subareas`, `nearby_area_links`, or `faqs_generic` replaces the equivalent area array; a blank value inherits the area array.
6. Compose reusable equipment facts, reusable area facts, and page-intersection copy without mutating the source objects.
7. Derive the route `/services/{equipment.slug}/{area.slug}` and stable page ID `servicePage.{equipment.slug}.{area.slug}`.
8. Build SEO: explicit system override first; otherwise combine service, area, and `meta_description_hook`. Enforce title ≤ 65 characters and description ≤ 170 characters.
9. Merge FAQs in the order equipment generic → effective area generic → page custom. Deduplicate by lowercase trimmed question.
10. Merge contractor guidance in the order equipment questions → complete page custom question/answer pair.
11. Attach approved Sanity image assets to editorial photo-slot keys; never treat a slot description as a URL.
12. Validate the complete batch before publishing. Invalid rows remain drafts; do not partially publish a matrix batch.

Precedence is: explicit page/system override → page-specific source → reusable area/equipment source → standard template → site settings.

## 4. Parsing rules

- Record delimiter: `||`
- Field delimiter inside a record: `::`
- Trim every token and discard empty records.
- `permit_brands`: comma-delimited; trim values, remove blanks, preserve capitalization.
- `common_problems`: `title::summary::detail`
- `price_table`: `repair::range::context`
- FAQ fields: `question::answer`
- `contractor_questions`: `question::answer`
- `subareas`: `name::note`
- `nearby_area_links`: `slug::label`
- `photo_slots`: `alt_or_slot_label::editorial_note`
- `reviews`: `quote::author::location::date`; source URL and source ID are separately managed production metadata.
- `building_types`: split records on `||`. The first token is `name`. If the final token is numeric, store it as `legacyMediaKey`. Join all middle tokens as `note`; this avoids breaking notes containing `::`.
- ZIP codes are strings, not numbers. Latitude and longitude are numbers. Prices and permit counts are numbers except the authored display string `permit_fee`.

## 5. Exact page skeleton

The content changes; the section sequence and presentation contract remain standard.

| Order | Section | Primary inputs | Required behavior |
| ---: | --- | --- | --- |
| 0 | Shared header + mobile action strip | `siteSettings` | Global logo, phone, schedule action, navigation. Red call action and blue schedule action. |
| 1 | Breadcrumbs | equipment + area + settings | Derived links; never hand-authored per page. |
| 2 | Hero + lead form + gallery | all three sheets | H1, local opening, quick answer, intake fields, approved media/slot labels. |
| 3 | Common problems / equipment strip | equipment + page | Problem cards, seasonal advice, quick answer, typical local findings. |
| 4 | Brands + permit context | page-specific | Permit brands/counts/commentary; wordmark fallback when a logo is unavailable. |
| 5 | Company trust proof | `siteSettings` | Shared trust metrics and cards. |
| 6 | Reviews | page + settings | Equal-height cards; source metadata required before publishing. |
| 7 | Questions to ask / why us | equipment + page | Equipment questions first, page-specific custom question last. |
| 8 | Work in the area | page + area | Typical findings and approved work photos; labeled placeholders only in review. |
| 9 | Coverage map + local rail | effective area | Map before subarea/nearby rail; page arrays may override area arrays. |
| 10 | Other services | category + published page index | Prefer live internal routes; category links are fallback. |
| 11 | Pricing | equipment + page | Price range, repair table, permit note; responsive horizontal table. |
| 12 | FAQs | equipment + effective area + page | Merge, deduplicate, and emit FAQ structured data. |
| 13 | Closing CTA | settings + equipment + area | Shared design with dynamic service/location copy. |
| 14 | Guide library | all three sheets | Housing, permits, boundaries, seasonal advice, typical finds; tabs desktop, accordions mobile. |
| 15 | Mobile fixed call bar | `siteSettings` | Persistent red call action and blue schedule action. |
| 16 | Shared footer | `siteSettings` | Global company/contact/navigation and lead form. |

The template-managed internal section order is:

`hero`, `types`, `brands`, `trust`, `reviews`, `why`, `workingArea`, `coverage`, `otherServices`, `pricing`, `faq`, `closingCta`, `guides`

Header, breadcrumbs, mobile action bar, and footer are global chrome outside that internal list.

## 6. Presentation contract

- Primary navy: `#09263A`
- Dark navy: `#061B29`
- Call/red accent: `#DD382B`
- Red hover: `#B92E23`
- Schedule-service blue: `#0A4265`
- Light surface: `#EEF4F7`
- Equal-height review cards.
- Rating appears after the review text.
- Coverage map appears before neighborhood/subarea content.
- Neighborhood rail does not introduce a horizontal scrollbar at supported breakpoints.
- Pricing heading renders as a question.
- Brand-logo cards fall back to accessible text when no approved logo exists.

## 7. Required system metadata outside the sheets

Do not add these columns to the source workbooks unless the sheet owner approves a contract change:

- Service intent and optional H1 grammar override.
- Meta-title and canonical-URL overrides.
- Editorial status and template version.
- Review source URL, source ID, and verification date.
- Stable photo-slot key, Sanity image reference, alt text, and credit/license record.
- Last source-sync timestamp.

## 8. Guardrails

- No secrets in source control or returned ZIPs.
- No unverified review text or unsourced ratings in production.
- No image is published without alt text and an approved usage record.
- Permit/census-style numbers must carry their source date and scope; do not present them as live totals.
- A published Sanity page for the same service/area route must replace any local sample fallback.
- Validate duplicate keys, missing joins, invalid slugs, numeric ranges, SEO length, and unsafe links before publish.
