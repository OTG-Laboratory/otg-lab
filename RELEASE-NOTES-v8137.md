# OTG! v8.0.137 — Evil Tournament Time-Only + Competition Highlights (phone QA)

- **Evil Tournament Festival/Groups**: Enter Result asks for total time only. Finishing Position input is omitted. Time validation, advanced lap timing, live draw, result audit, group queue and records continue working. `position: null` is saved for new Evil results; historical saved positions are untouched.
- **Normal Festival and Custom Events**: position entry and mandatory-position validation retained. **Race Off** already uses time-only match results and is unchanged.
- **Evil post-race screens**: suppress repetitive AI race-win/podium/milestone highlight card. Existing record banners, averages and current leaderboard remain. Non-Evil results retain original v8.0.135 highlights.
- **Competition finish**: Existing completed Festival/group final/Race Off champion screens acquire a compact read-only honours summary. The full-screen standard Festival Final Standings page gains a small HIGHLIGHTS button which expands *on that same page* (no navigation). Final group standings are read from their frozen final, **not** prelim group totals. Race Off honours use confirmed champion and final result, **not** AI position. Award history counts only earlier completed events in the current Space.
- No new saved-data fields, migrations, reset or tournament slot redraw. Back up live FH5 before updating.

## Phone checks

1. In a live Evil Festival preliminary group, Enter Result must show **TIME and SAVE only**. Save without any position, see original leaderboard/record flow and return to next race.
2. Next Evil race should **not** show FIRST RECORDED RACE WIN, even if the car wins against AI. No lost average, records, Top 3, dice or position-required message.
3. When a Festival is **truly complete**, open the Group FINAL standings or standard Final Standings **CHAMPIONSHIP HIGHLIGHTS** button: gold/silver/bronze must reflect actual **OTG times**.
4. On a completed Race Off champion page, highlights must show confirmed champion and final runner-up; unfinished prelims show no medals.
5. Check non-Evil Festival or Custom result: position entry remains available; old saved results still open.

**Status:** syntax, asset and unit regression checks passed; real-device QA pending.
