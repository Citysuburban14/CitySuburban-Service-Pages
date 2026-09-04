# Sample L4 page: Furnace Repair × Chicago

Review route: `/services/heating/furnace-repair-installation/chicago`

This page follows the published Sanity content for the furnace service and Chicago area while using the shared standard template.

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

The sample uses the shared L4 section order, City & Suburban red/blue/navy presentation, and the service and area imagery stored in Sanity.
