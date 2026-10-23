OTG! LAB v0.6 — HOSTED DOWNLOADABLE CATALOGUE TEST

What is implemented:
- An independently published GitHub Pages JSON pack (full FH5 catalogue: 902 cars, 145 routes), listed in a separate library-v1.json manifest.
- Browse catalogue library in FH5 Settings and preview a pack fetched from the hosted site, without writing user state.
- Same-origin only, tightly restricted path/ID, maximum size 2 MB, strict manifest schema, required WebCrypto SHA-256 against the manifest before JSON parse.
- The downloaded pack is fed into the APPROVED v0.5 preflight, including all frozen car/track ID checks and the guarded Safety-Backup-gated APPLY step.
- No new cars, no changed tracks, no custom Space edits, no paid checkout, no entitlement system.
- Remote catalogue assets are NOT pre-cached by service worker (optional on-demand network download).

SHA-256 exact pack: 78203708193b4880e0a27b4f9b594fc66fda0be7df091360f47564900d00b90e

NOT YET:
- This still retains the existing built-in FH5 catalogue. It tests separate hosting/download and pack integrity, NOT true first-time catalogue-free game installation.
- Real new catalogue data or installation for GT7/Assetto/ACC/FH6.
- Digital signatures or secure payment/entitlement verification, licensing review.
- Installing new track layouts (still blocked).
- Actual phone acceptance of LAB's install-via-update-button for v0.6.

Installation:
- ONLY repository OTG-Laboratory/otg-lab; DO NOT touch Main.
- Overwrite only the files in this incremental ZIP; preserve catalogue-packs/ folder.
- git add -A
- git commit -m "OTG! LAB v0.6 - Hosted FH5 catalogue library"
- git push

Phone QA:
- LAB Settings should show v0.6 immediately; original owned three cars still present.
- In FH5 LAB TEST Settings, select CHECK ONLINE FH5 CATALOGUE LIBRARY.
- Confirm directory lists complete FH5 (902 cars, 145 routes), v1.0.0, and does not auto-install.
- Select DOWNLOAD & PREVIEW; fetch must succeed and v0.5 PREVIEW engine should say VERIFIED: 902 original cars + 145 routes unchanged, 0 new cars.
- DO NOT APPLY until preview checked. For online safety failure, show error and STOP. MAIN is never involved.

Automated tests:
node tests/lab-remote-catalogues-v06.test.cjs
node tests/fh5-lab-pack-v05.test.cjs (run from assembled full LAB)
node tests/lab-update-initial-status-v05.test.cjs (run from assembled full LAB)
