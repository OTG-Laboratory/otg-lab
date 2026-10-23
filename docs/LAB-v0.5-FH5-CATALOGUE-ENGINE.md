OTG! LAB v0.5 — FH5 catalogue pack engine (LAB ONLY)
23 October 2026

PURPOSE
A controlled, fail-closed starting point for downloadable FH5 catalogue packs. This
is an ENGINE/QA release, not a newly researched car/route content release.

IMPLEMENTED
- A pack is a JSON object with schema = otg-lab-fh5-catalogue-pack-v1,
  catalogueKey = fh5-catalogue-v1, game = Forza Horizon 5, packVersion = x.y.z,
  cars = complete list, tracks = complete list.
- Compare every ORIGINAL 902 car and 145 route against frozen source registries
  using immutable IDs and protected metadata (NOT list positions).
- Reject missing/changed baseline rows, collisions, duplicate IDs and unsafe
  new identity families. Sorting/reordering the pack is safe.
- Only append NEW car rows under never-used fh5-v2-xxxx identities.
- Refuse removal/editing of any already installed pack addition and any downgrade.
- Refuse any new route additions for now; random track programmes and 145-route
  registry have NOT yet been safely adapted for new route entries.
- Persist approved additive car entries only to a NEW LAB-specific localStorage
  key, not to saved racing state. On next reload insert additional entries BEFORE
  legacy deterministic catalogue repair runs.
- Require successful verification of all LAB Space Safety Backups before install.
- Includes an unmodified BASELINE test pack with 902 cars + 145 routes and
  zero changes, so we can exercise preview/apply without risking test Garage data.
- Fix first-render Settings updater inherited version 8.0.143 status. The new
  updater status should say LAB v0.5 immediately (before pressing CHECK).

NOT YET IMPLEMENTED
- New track installation/track-pool participation: strict blocker (not silent).
- Catalogue edits/replacements/removals; this is append-only for new cars.
- Digital signing or payment/entitlement verification of downloaded packs.
- Pack recovery via Portable Backup alone. A user must also retain the catalogue
  pack if migrating data containing newly added pack cars to another device.
- Multi-game packs or a full public release. MAIN remains frozen.
- Automatic import to an entirely new blank Space: use the app's existing game
  Space creation; this test operates on an existing FH5 catalogue Space.

SAFETY
Keep existing LAB FH5 TEST Space; do NOT reset or restore the original MAIN.
This release intentionally does not edit Space objects, owned flags, records,
runs, championships, GT7 data, or the v8.0.143 MAIN application.

INSTALLATION
From accepted LAB v0.4.1, extract patch ZIP and overwrite its relative paths
under the separate OTG-Laboratory/otg-lab repository. Leave all other files.
Check `git remote -v` shows OTG-Laboratory/otg-lab.
    git add -A
    git commit -m "OTG! LAB v0.5 - Protected FH5 catalogue pack engine"
    git push

PHONE QA
1. Open LAB on phone; amber banner says LAB v0.5.
2. Settings immediately says "Installed LAB v0.5", not 8.0.143.
3. Under FH5 LAB TEST Settings: "FH5 CATALOGUE PACK LAB" panel appears.
4. Tap "PREVIEW INCLUDED FH5 BASELINE"; it should say VERIFIED, 902 + 145,
   and 0 new cars.
5. Optionally tap "APPLY VERIFIED LAB PACK"; the app should create and verify
   its Safety Backups and reload, and still show 902 + 145, 3 owned cars.
6. The existing three LAB test cars (Carlton, Nissan R390, BMW Forza Edition)
   must remain checked, not duplicated, and MAIN must still be unchanged.
7. Update checker future-release detect/install still needs real-world QA.

TESTS
Run `node tests/fh5-lab-pack-v05.test.cjs` and
`node tests/lab-update-initial-status-v05.test.cjs`.
12 importer/safety scenarios and one updater initial-render scenario are covered.
The Chromium smoke was attempted locally but browser navigation was blocked
by administrator policy; therefore do NOT report a browser or phone PASS yet.
