# Implementation return checklist

The receiving developer should return all items below for review.

## Data contract

- [ ] All 14 equipment headers, 19 area headers, and 19 page-specific headers are accepted unchanged.
- [ ] Duplicate equipment slugs, area slugs, and page composite keys fail validation.
- [ ] Page foreign keys resolve to exactly one equipment row and one area row.
- [ ] All delimited fields are parsed by one tested utility.
- [ ] Blank page array overrides inherit the area array.
- [ ] Building-type notes containing `::` are preserved.
- [ ] FAQ order and deduplication match the contract.
- [ ] Photo-slot descriptions are not treated as image URLs.

## Sanity and rendering

- [ ] Separate document responsibility exists for equipment, area, service page, standard template, and site settings.
- [ ] A new service page defaults to the active versioned standard template.
- [ ] The Furnace Repair × Lincoln Park sample renders at `/services/furnace/lincoln-park`.
- [ ] The page follows the exact section sequence in `L4_SKELETON_SPEC.md`.
- [ ] Header/mobile actions use City & Suburban red for call and blue for scheduling.
- [ ] Desktop and mobile layouts have no unintended horizontal scrolling.
- [ ] Forms, phone links, schedule action, maps, internal links, and accordions are keyboard usable.
- [ ] SEO title/description/canonical and FAQ structured data are correct.
- [ ] A published Sanity page replaces the local fallback for the same route.

## Tests and evidence

- [ ] Unit tests cover parsing, joins, override inheritance, FAQ deduplication, route generation, and validation failures.
- [ ] A rendered-page test confirms all required sections and source-derived copy.
- [ ] Production build, typecheck, lint, and tests pass.
- [ ] Return desktop and mobile preview evidence plus the working preview URL.
- [ ] Return a short mapping report listing any intentional adapter names that differ from the required Sanity paths.
- [ ] No API tokens, `.env.local`, Vercel secrets, or Sanity write credentials are included.
