# OTG! v8.0.139 — Monthly & Yearly Racing Reports (PHONE QA PENDING)

**Source:** Exact full v8.0.138 OPTIONAL ADVANCED POSITION QA ZIP. All existing files, Garage, Evil 1,219-slot tournament, saved results, history and backup formats preserved.

## New, inside Journey → Racing Reports
- SESSIONS (existing report), MONTHLY and YEARLY tabs. No extra pages, no new result-entry fields and no auto-generated reports stored in your save.
- Monthly/yearly reports derive from the existing Space's dated timed race results: number of timed results, unique cars, sum of recorded racing time, days with racing, sessions touched, improved repeat car/track times, flagged records and genuine completed events.
- Most driven car, most raced course and busiest day (monthly) / busiest month (yearly).
- Individual reports expand on tap; finished-events list stays folded until requested.
- Sessions crossing midnight/month/year have each result assigned to its actual local date. Unique cars in a period are deduplicated — NEVER calculated by summing day/session car totals. A session spanning two months counts once in each as a *session touched*, not as two different sessions.
- No AI race position is counted as an event win, title or medal. Competition honours remain on the existing completion screens.
- Existing daily session display and manual FINISH SESSION behaviour preserved; no new storage keys.
- Legacy results with no date cannot appear in calendar reports. Drift scores with no timestamp/timed value are not counted.

## Release integrity / limits
- Version updated to 8.0.139 in index, version.json, update-manifest, bootloader and worker.
- Existing v8.0.138 update files and previous versioned assets retained.
- Pre-install checks: JS parse, critical worker references, unchanged saved-data architecture, synthetic aggregate scenarios.
- **Phone QA is still required.** Functional v8.0.138 optional-position QA and v8.0.137 competition-completion QA remain pending too.

## Phone QA
1. **Make an in-app backup AND export a Portable Backup JSON from your current phone before installing**. Keep both copies somewhere safe.
2. Install v8.0.139, check Settings shows correct version and your FH5 Space/Garage/Evil slot 13/results remain unchanged.
3. Journey → Racing Reports: SESSIONS displays existing daily reports; tap MONTHLY, YEARLY; expand cards to check times, cars, completed events. Test BACK TO JOURNEY and re-entry.
4. Check a session crossing midnight/month boundary: results belong to their actual recorded dates; no duplicated car totals or AI wins.
5. Save a legitimate new result and reopen reports: counts update without extra action. Confirm blank Advanced Timing position stays optional/time-only.
6. Test FINISH SESSION in SESSIONS, confirm the reports still show historical sessions correctly.
7. Verify older event results, record pages, random draws, paint dice and other Evil Tournament screens before phone PASS.

## VS / Git — all three lines
```powershell
git add -A
git commit -m "OTG! v8.0.139 - Monthly and Yearly Racing Reports"
git push
```
