# OTG! v8.0.143 — Lifetime Career Heading Hotfix (PHONE QA PENDING)

## Why the header was missing
Andy’s phone screenshot showed the Lifetime Career stats and four game-space panels, but not their heading. Inspecting **v8.0.142’s actual source** identified a CSS collision: the original base stylesheet `style-v595.css` contains `.nav,header{display:none!important}`. The Lifetime Career script DID render `<h2>LIFETIME CAREER</h2>` inside a `<header>`, but v8.0.142 only used non-important `display:flex`, so the heading was hidden. This is a genuine bug, not an absent data block or YouTube overlay issue.

## What changed
- Added `style-v8143.css`: narrowly scoped `#more .otgLifetime8142 > header { display:flex!important; padding:0!important; ... }`, restoring visible heading, tagline and Space-count pill on STATS without exposing the intentionally hidden global app header.
- New entrypoints, version, service worker and updater are pinned to 8.0.143 for controlled safe deployment.
- **No changes** to Lifetime Career JavaScript, calculation or saved racing data; the existing lifetime script v8142 remains loaded.
- **No new page, storage keys, migrations or resets.** Everything from the complete v8.0.142 package is retained.

## Automated checks
- Reproduced the old `header{display:none!important}` cascade conflict in source.
- Verified the hotfix is scoped to `#more .otgLifetime8142 > header`, CSS loaded after v8142, preserved event/medal aggregation JS byte-for-byte.
- Node tests: `test-v8139.js`, `test-v8140.js`, `test-v8141.js`, `test-v8142.js`, `test-v8143.js`. Syntax checks for new bootstraps/update scripts/worker.
- Full ZIP integrity and file retention, new worker preload URLs and safe-update manifest verified.
- **Only real phone QA can determine PASS**; do not declare on-device pass until Andy verifies it.

## PHONE QA
1. **Make an in-app backup and export portable JSON before installing**; keep your existing accepted v8.0.141 build and v8.0.142 testing ZIP.
2. Replace files and deploy. Confirm displayed version v8.0.143. Open **STATS** and scroll just below original Space stats.
3. Check **ONE DRIVER · ALL SPACES** / **LIFETIME CAREER** and Space-count badge now appear **above Timed Results**. Header should not overlap or wrap awkwardly on a narrow phone.
4. Verify the same figures from v8.0.142 (e.g. the shown 144 timed results, 103 distinct per-Space cars, 1 completed Festival and podium totals) have not changed; expand FH5, GT7, A.C. Competizione and FH6.
5. Reopen STATS and Settings. Ensure there are no duplicate headers, stray logo, overlap or horizontal scroll. Check Evil Slot 13, existing 1,219-slot programme, Garage, history, random draws, Journey Reports and backups are undisturbed.

## Mandatory VS/Git lines
```powershell
git add -A
git commit -m "OTG! v8.0.143 - Lifetime Career Heading Hotfix"
git push
```
