# Sample L4 page: Furnace Repair × Lincoln Park

Review route: `/services/furnace/lincoln-park`

This page is a pre-Sanity review sample. It merges the first complete HVAC combination in the supplied workbooks and falls back to local typed data only when the matching Sanity page does not exist. Once a published Sanity document exists for the same service and area, Sanity becomes the source automatically.

## Merge map

| Page purpose | Equipment sheet | Area sheet | Page-specific sheet |
| --- | --- | --- | --- |
| URL and identity | `slug` | `slug`, `display_name`, `zip` | `equipment_slug`, `area_slug` |
| SEO and hero | `display_name`, `category_group` | `display_name`, distance and cross streets | `meta_description_hook`, `opening_paragraph`, `quick_answer` |
| Intake form | `symptom_word`, `common_problems` | `building_types`, `example_cross_streets` | combination identity |
| Problems and seasonal guidance | `common_problems`, `seasonal_advice` | housing context | `typical_finds` |
| Brand and permit proof | equipment category | local map context | `permit_total`, `permit_equip_count`, `permit_brands`, `permit_commentary` |
| Contractor guidance | `contractor_questions` | `landmark_note` | custom contractor question and answer |
| Local work and coverage | service identity | map, boundaries, subareas, nearby areas, parking | `photo_slots`, `typical_finds` |
| Pricing | `price_min`, `price_max`, `price_table`, `permit_fee` | access and housing context | `quick_answer` |
| Reviews and FAQs | equipment FAQ | area FAQ | reviews and custom FAQ |
| Guide library | seasonal and pricing detail | housing, landmarks, boundaries, parking, population | guide introduction and permit commentary |

## Approval scope

The sample intentionally uses the shared L4 section order, City & Suburban red/blue/navy presentation, authentic company furnace imagery, and visible placeholders for the two photo slots that still need final Sanity media. No content has been written to the Sanity dataset.
