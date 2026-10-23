# OTG! LAB v0.4 — frozen FH5 route IDs

**Scope:** Isolated OTG Laboratory GitHub Pages only. MAIN v8.0.143 is not modified. No user backups, race history, routing plans, shuffle bags, custom Spaces, Garage data, or ownership records are changed by this patch.

## Existing track data, not new tracks
The active v8.0.70 OTG! taxonomy contains **145** distinct route records (56 ROAD, 40 OFFROAD, 28 RALLY, 18 HOT_WHEELS, 3 DRAG). This includes 3 protected Rally Adventure specials, finale races and Drag; Winter Wonderland is deliberately excluded. These numbers count OTG! routes, not independently verified official FH5 all-route completion.

## Identity contract
- Each existing route is assigned a permanently reserved explicit ID `fh5-track-v1-0001` to `fh5-track-v1-0145`; the IDs are enumerated in `data/fh5-track-ids-frozen-v1.json` with original canonical name, world, discipline, eligibility flags.
- `js/fh5-track-ids-lab-v04.js` applies the frozen identity **by name**, not by array index. On loading it validates the taxonomy is exactly the expected 145; duplicates, missing entries or unexpected metadata prevent the registry installing (the existing racing taxonomy remains in place).
- The public taxonomy route metadata now contains an unchangeable `trackId`, including results of `track(name)` and the list snapshot. Lookup via `window.rhFH5TrackIdsLab04.idFor(nameOrId)`, `.nameFor(nameOrId)` and `.info(nameOrId)`; pre-existing names and aliases still resolve through the original catalogue.
- A future pack may **add** extra routes only with new never-reused IDs and explicit, reviewed migration. Current v0.4 validation intentionally rejects unregistered changes. Any route relabeling must preserve its permanent ID and old label as a resolvable alias before code is released.

## Why saved race results remain names for now
Many OTG! features persist names (and rely on spelling in existing event plans, history, lookup and Track Directory). Replacing those names in user data before a complete migration audit risks breaking records. v0.4 adds a stable read-only identity layer **without rewriting or deleting saved data**; future pack logic will need an audited dual-ID/legacy-name migration before moving storage to IDs.

## Tests
- Automated Node VM: canonical name and alias IDs, full 145 registry bijection, directory compatibility, random pool invariance, mutation-free historical race fixtures, mismatched registry refusal, order independence, owned-car patch untouched.
- Phone: Andy must confirm LAB v0.4 after installing, 3 owned cars remain, Track Directory loads (145 routes), no source/Main change. **Do not claim phone PASS until reported.**

## Files in patch
`index.html`, `update-manifest.json`, `otg-lab-worker-v1.js`, `js/fh5-track-ids-lab-v04.js`, `data/fh5-track-ids-frozen-v1.json`, `docs/LAB-FH5-TRACK-ID-LOCK-v0.4.md`, `tests/fh5-track-ids-lab-v04.test.cjs`, and release notes. The earlier LAB v0.3 `js/otg-lab-updates-v03.js` is deliberately unchanged and remains installed.
