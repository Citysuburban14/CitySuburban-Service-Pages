# Live footer correction

The footer was inspected through the Chrome extension on the live heater repair
page on 3 October 2026 and matched to the supplied screenshot.

The shared snapshot in `src/reference-pages/shared-footer.json` preserves the
live logo, SVG icons, contact details, financing/social/legal links, 1170px
container, three-column flex layout, typography and responsive breakpoints.
The exact live logo is served locally as `public/images/live-footer-logo.png`.
CSS is scoped to `#live-site-footer`; collection and landing content retain
their existing styling. The Cloudflare-protected email uses the observed decoded
address directly. Social links have accessible names.

Both collection levels use the shared footer. All 41 landing snapshots and their
editable footer fields use it too. Older published CMS revisions adopt this
footer at render time; current revisions retain their editable footer content.

After regenerating service snapshots, run:

```text
python scripts/build-live-footer.py
python scripts/add-service-content-fields.py
```

`build-live-footer.py` can refresh from the saved public WordPress HTML in
`../.reference-preview/live-footer-source.html`; otherwise it uses the committed
shared snapshot. `scripts/update-live-footer.ts` updates only the footer section
and footer CSS in Sanity drafts and the standard template, saves local backups,
and checks document revisions. It does not publish documents or change other
service content.
