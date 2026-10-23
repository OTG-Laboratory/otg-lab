# OTG! v8.0.140 — Forgotten Cars: Manufacturer Participation (PHONE QA)

**Source:** Complete, accepted v8.0.139 Main ZIP. Read-only presentation update.

## Change
- Existing Garage → Garage Intelligence → Forgotten Cars now includes a manufacturer participation summary and a ranked list of manufacturers. No extra page.
- A maker counts as participating if **at least one of its owned cars has a saved timed result**. Coverage is the fraction of its cars with at least one such result, not number of race wins or medals.
- Manufacturers with no recorded timed results appear first; the list sorts by lowest recorded-car coverage, and can expand from 12 to all makers.
- Each row shows cars with timed results / manufacturer cars, share (%), never-recorded count, dated-dormant count, and results whose dates are entirely unknown.
- Tap a maker row or choose from the manufacturer dropdown to restrict existing Never Recorded / Gathering Dust / Date Unknown sections to that maker. Clear selection to see all cars again.
- Dormancy threshold remains 30 / 60 / 90 / 180 days and refreshes maker totals without touching storage.
- Existing Smart Car Finder, Car Comparison, Festival, Race Off, Evil Campaign, portable backups and stats are unchanged.

## Honest definitions
- 'Without a recorded timed race' does not mean it was never used in-game.
- If a car has timed results but no valid timestamps it counts as *participating*, under Date Unknown, not Gathering Dust.
- If a car's latest dated timed result is older than the selected threshold it counts as Gathering Dust; undated new results cannot reliably infer recency.
- Counts depend on the same existing Space-local result reader as v8.0.122, so a manufacturer-specific count will be consistent with Forgotten Cars itself.
- No new permanent data model, storage keys, result migrations, or automatic saves.

## Phone QA (not yet PASS)
1. **Make an in-app Safety Backup and export your Portable Backup JSON before replacing files / installing.**
2. Install via normal GitHub process; check version 8.0.140 and confirm your current Space and 1,219 Evil slots.
3. Garage → Garage Intelligence → Forgotten Cars: verify the new participation section, summary counts, and that an empty/never-used manufacturer shows 0 recorded cars.
4. Tap a manufacturer, check the car list only contains that manufacturer, then Clear. Test the manufacturer dropdown and Show All / Show Fewer.
5. Change 30 ↔ 180 days. Participation-with-results counts should remain the same; dormant count can change. Check Date Unknown remains distinct.
6. Back to Garage; open Smart Car Finder and Car Comparison. Confirm no visual changes or broken controls.
7. Open Journey → Racing Reports (Sessions, Monthly, Yearly), and Evil Slot 13: no new issue.
8. Confirm saved Garage and existing racing results unchanged; report any discrepancies before declaring PASS.

## Delivery VS/Git lines
```powershell
git add -A
git commit -m "OTG! v8.0.140 - Forgotten Cars Manufacturer Participation"
git push
```
