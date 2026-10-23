# OTG! v8.0.141 — Pick My Drive + Smart Car Finder (PHONE QA PENDING)

**Foundation:** Complete accepted v8.0.140 MAIN ZIP, not a partial patch. The existing 1,219-slot Evil Tournament and all normal result/record data formats are untouched.

## What has changed
- The existing Garage → Garage Intelligence → **SMART CAR FINDER** keeps search, make, class, decade, recorded activity and its **PICK ONE RANDOMLY** button. Below the filters it now has **DRAW A RACING EVENT**.
- This draws **2–10** random cars from **currently matching owned Garage cars**, maintaining the 5–10 random car range when at least five are available. A one-car/zero-car match disables the button. No catalogue-only or other-Space cars enter the draw.
- It hands the selected IDs to the established **Pick My Drive** preview, round setup, saved race setups and existing Festival raceflow. The draw itself is read-only; **START PICK MY DRIVE** is the only point at which a new run is saved.
- Original **Pick My Drive** on the dashboard still begins with an unrestricted random theme and car draw. Preview adds a **FILTER WITH SMART CAR FINDER** shortcut instead of a new page. Back returns to the existing pick; **CHOOSE AGAIN** keeps the same Smart Finder pool for filtered draws.
- Ordinary Garage Intelligence / Forgotten Cars / Manufacturer Participation / Car Comparison remain on their existing views.

## Deliberate limits and protections
- This is NOT an Evil Tournament picker and does not touch specialist exclusions, official Evil slots, random routes or Dave and Steve's sponsorship arrangements.
- Original run object, champion format, and saved Race Setups are unchanged. No new statistics, honour rules, storage keys, migrations or resets.
- Editing Garage cars or switching Spaces automatically invalidates missing entries for new filtered draws. Old saved results remain bound to existing permanent car IDs.
- Smart Finder's "recorded timed races" means OTG! saved results, not game AI finish positions, and no bogus AI championship victories are inferred.

## Phone QA — user PASS only
1. **Before installing: make an in-app Safety Backup and export a Portable Backup JSON.** Verify the export file exists.
2. Install update. Confirm **v8.0.141**, the current Space and your 1,219 Evil slots are intact; especially Slot 13 progress.
3. Open Garage → Smart Car Finder. Filter to a manufacturer/decade (or No recorded timed races). **PICK ONE RANDOMLY** should still show a single car. Tap **DRAW A RACING EVENT** and verify 2–10 displayed cars ALL match those filters.
4. **CHOOSE AGAIN**: new random order/cars, still from the same filtered pool. **FILTER WITH SMART CAR FINDER**: edit filters, build another draw. Use Back from Finder to return to your prior draw.
5. Pick **LET'S DRIVE**, add/rename rounds or load an existing race setup. Back works. **Do not START** unless you want to create a real permanent test run; preview/setup should leave existing racing data untouched.
6. Back to Dashboard → existing Pick My Drive: check old completely random surprise theme/draw and choosing again. Verify the new filter shortcut.
7. Smart Finder with one matching car: disabled button and helpful message. Check Forgotten Cars manufacturer rows, monthly/yearly Journey Reports and Car Comparison.
8. Confirm historical results/records, paint dice, Carlton visibility, Evil Slot 13 and Garage remain intact. Report any issue; v8.0.141 is not a phone PASS until you say so.

## VS / Git — mandatory 3 lines
```powershell
git add -A
git commit -m "OTG! v8.0.141 - Pick My Drive Smart Finder Integration"
git push
```
