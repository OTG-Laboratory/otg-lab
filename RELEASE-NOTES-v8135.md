# OTG! v8.0.135 — After-Race Highlights (QA)

This release adds a **compact RACE HIGHLIGHTS** panel to the **existing** result/record screens *only when there is a meaningful, verifiable highlight.* No new page, pop-up, rating, XP, additional race entry, or changes to existing result handling.

## Highlights

- Faster repeat result by the **same car on the same named course/layout**; shows the previous personal best and actual time saved. A first-ever attempt is a baseline, not a falsely claimed improvement.
- First or milestone recorded race win **for that car**, only where a first-place race position has actually been entered.
- 3rd/10th/25th/etc. recorded race podium, derived from explicitly recorded positions (not tournament medals).
- Per-car recorded race milestones (10/25/50/100/etc.) and Space-wide timed race milestones (25/100/250/etc.).
- Maximum three genuine highlights per save, otherwise **no additional UI**.

Works read-only from the **current Space** using Festival, Custom Racing and official Race Off results (deduped). Advanced Timing results are ignored when evaluating comparable timed laps. Existing record celebrations and current standings stay exactly as they were; the record celebration already shows time improvement, so a duplicate PB card is suppressed there. Existing group result, generic result summary, approved record and Race Off transition screens can display highlights when meaningful. If a result flow returns immediately to a competition without an existing result screen, no additional screen is introduced.

## Phone QA

1. **Make your usual portable backup** before deploying the ZIP.
2. Record an ordinary Festival/Group result: existing summary, Top 3 and Next action must look/behave unchanged. If no actual milestone, no RACE HIGHLIGHTS card appears.
3. When a car beats its earlier time on exactly the same track/layout, verify the personal-best improvement on the existing result page. First attempts must not be labelled *improvements*.
4. Enter a recorded position 1 for a car's first actual race victory; confirm the win text clearly means individual race, not championship gold. Test a position 3 does not create a race-win claim.
5. Continue through a new record page and confirm its navigation/rosette remains intact. Test custom event/Race Off on a disposable backup if convenient.
6. Check Garage/records/backups, dice, Slot 13 Top 3 and live tournament progress are unchanged.

**Not included:** monthly/yearly reports, new persistent achievement state, editable track IDs, the catalogue upgrade, revised race-off navigation. No racing data is written by this feature. This is a code/syntax-tested QA build, **not yet a phone PASS**.
