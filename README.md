## Latest QA: v8.0.127 — Navigation return buttons

Historic Moments, Racing Reports, Closest Battles and Garage Intelligence now have bottom returns; top returns remain, and historic cross-links go back to the archive. Does not touch saved data or any racing logic.

## Current MAIN build: v8.0.120 (2026-10-19)

Current race Top 3 and head-to-head opponent time on Enter Result, with track record moved beside LOCATION. PB remains in history and post-race screens. Read-only result-entry feature. **Pending phone QA; v8.0.119 remains accepted.** Make a portable backup first.

---

## Current Main: v8.0.96
Mobile-safe Portable Backup hotfix on top of accepted v8.0.93. Settings can export/share all OTG! Spaces, Garage and racing history to a portable JSON file and import that file on another device; export no longer loses the phone browser user gesture before Share/Save.

Evil Campaign two-way event bridge on top of accepted v8.0.83. DONE slots can open their exact results and completed Evil events can return directly to their campaign slot.

> Current Main build: **v8.0.83** — updater boot-shell hotfix + v8.0.81 Corrections polish.

# OTG! Main v8.0.83

Main-only reliability build on top of the accepted Evil Campaign foundation. Standard Festival / Pick My Drive Championships now expose a Results / Corrections editor during active racing and from completed final standings. A saved result can be edited in place or deleted to reopen exactly that missing car/round race.

The standard Festival result-save path is also guarded against stale targets, duplicate/double saves and inconsistent writes. Evil Campaign order/progress is unchanged. Groups, Swiss and Race Off correction logic is intentionally left alone for dedicated later work. rh-guide is untouched.

Main-only **Evil Campaign foundation** build.

The authoritative `v8.0.70 FULL-TRACK-CLEANUP CONTROLLED SHAKE-UP R2` campaign is now embedded directly into OTG! as a private FH5 campaign: 697 cars, 708 slots, clean 0/708 progress, controlled reshuffle of the regular season, preserved multi-visit ordering, and preserved Finals / Final Boss sequence.

On the FH5 Dashboard the former full-width Festival row becomes:

`FESTIVAL | EVIL CAMPAIGN`

The rest of the approved Dashboard remains in place. Evil Campaign uses a dark-crimson treatment and shows only progress + next slot.

Supported Festival slots open the normal OTG! setup flow and use the existing persistent shuffle bags / fixed-track rules. The campaign's own pool metadata is authoritative where it deliberately differs from a normal preset. Supported Race Off slots open or continue the normal Race Off flow and existing live auto-routes, with R2 protected Finals enforced. Manual slot completion is used in this first build so parked multi-visit programmes cannot advance accidentally.

Reset Racing Data / Full Reset also resets Evil Campaign progress. Garage/catalogue behaviour is unchanged. rh-guide is untouched.

## v8.0.80 correction workflow

Standard Festival championships now expose **RESULTS / CORRECTIONS** during an active run and from completed Final Standings / Festival History. A saved time can be edited in place, or deleted to reopen exactly that car/round for a clean rerun. Evil Campaign progress is deliberately independent and is not moved backwards by a correction.

The standard Festival save path also validates the exact expected car/round before accepting data and rolls back any inconsistent multi-write. This is the reliability guard for the phantom-result defect observed during Evil Slot 001.

Deployment:
```powershell
git add .
git commit -m "OTG v8.0.83 updater boot shell hotfix"
git push origin main
```
