# OTG! v8.0.142 — Lifetime Career Across Spaces (PHONE QA PENDING)

**Based on:** complete user-accepted v8.0.141 MAIN ZIP. This is a complete installable package, not a partial patch. No existing files were deleted. Read-only calculations; zero data migrations.

## Feature
- On the **existing STATS screen**, beneath the current Space's familiar Stats cards, find **LIFETIME CAREER**. This is not a new top-level page or an XP/level system.
- Lifetime totals combine all Spaces belonging to the current Driver: **timed race results**, **recorded driving time** (the SUM of official time values, not real-world playing time), **cars raced per Space**, and **finished competitions**.
- Finished competitions are broken down into **Festival**, **Race Off** and **Custom Racing**. Only `status:'complete'` counts. Active/abandoned tournaments do not become finished events.
- **Verified podiums**: gold/silver/bronze are derived only from COMPLETE Festival final standings with distinct unambiguous times, and from the confirmed final Race Off bracket (plus two bronze semifinalists only when confirmed). No game-AI finishing positions, incomplete competitions, ties, or guessed Custom Racing podiums. A bronze count of TWO from one Race Off is correct for two proven semifinalists.
- Each Space has a collapsible breakdown and the active Space is identified. Results/records stay in their original Spaces. The same car present in FH5 and GT7 counts as two separate car/Space identities; **no cross-game track PB comparison** is attempted.
- Unlike monthly/yearly reports, career timed-results totals **include undated saved race results**. Advanced lap/FL rows (`advancedTiming`) are excluded. Drift Zone score-only activity lives in another data structure and is not misreported as timed driving.
- Legacy data that does not exist inside current official Festival/Custom/Race Off result containers is NOT extrapolated or fabricated. No new storage keys; no saves invoked; no Evil R1 programme edits.

## Untouched
- FH5 Evil Tournament: all 1,219 slots, progress and specialist exclusions; random order; track pools; live Lotus Carlton eligibility; Hubbs/Swiss events; paint dice.
- Garage/car IDs, catalogue data, stored race results/positions, record book, PBs, Car History, Journey Reports, Forgotten Cars, Pick My Drive, Smart Car Finder, safety/portable backups, all game Space boundaries.
- Current individual-Space Stats cockpit and cards remain unchanged.

## Computer checks
- `node --check` on new script/bootstrap/updater/worker.
- Automated `tests/test-v8142.js`: full and partial competitions; genuine Festival and Race Off podiums; two genuine Race Off bronze semifinalists; tied champions; incorrect finals; AI positions; advanced lap exclusion; duplicate race results; other game Spaces with overlapping car IDs; read-only computation; opening Stats vs Settings; empty Space.
- Previous `test-v8139.js`, `test-v8140.js`, `test-v8141.js` rerun unchanged; all passed.
- Complete ZIP file retention and ZIP CRC validation, manifest, index and service-worker asset wiring checked.
- **Real device phone QA is still pending.** Browser screenshot was not produced: headless Chromium stalled in this environment; no browser visual PASS is claimed.

## PHONE QA — DON'T MARK PASS UNTIL ACTUALLY TESTED
1. **BEFORE ANY INSTALL:** Make in-app Safety Backup and export your Portable Backup JSON; confirm the downloaded JSON exists. Preserve the accepted v8.0.141 ZIP separately.
2. Deploy v8.0.142; confirm the new version and existing selected Space. Check your Evil Slot 13/1,219 campaign state remains intact.
3. Dashboard → **STATS**. Keep the original current-Space cards; beneath them, check **LIFETIME CAREER**. The total from one Space should agree with that Space's breakdown when only one has any results.
4. Expand FH5 and GT7 (and any other Space): verify each is individually named. Verify complete/active events are separated; a current active championship must not count as finished.
5. Compare two Spaces: combined race count should equal their valid official timed-result counts, and combined car count should be the sum of unique raced cars **within each Space**, not global deduplication. Driving time is recorded race time, not hours spent in the game.
6. If there is a completed Festival or Race Off, check the genuine podium counters. AI position 1 from an ordinary timed race must **never** add a gold medal. If there are not yet verified finished competitions, zeros are correct.
7. Return to Dashboard; re-open STATS and then Settings — no extra duplicates, wrong tab, or lingering Lifetime section on Settings. Check mobile narrow screen for sideways scrolling or clipped names.
8. Check current-Space PB/record screens, monthly/yearly Racing Reports, Forgotten Cars, Pick My Drive/Smart Finder and live Evil tournament. No old results or ownership should have changed.
9. Only after real phone checks, declare PASS or report a screenshot/problem; v8.0.141 remains the latest *accepted* MAIN until then.

## VS / Git — the mandatory three lines
```powershell
git add -A
git commit -m "OTG! v8.0.142 - Lifetime Career Across Spaces"
git push
```
