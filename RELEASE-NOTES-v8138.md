# OTG! v8.0.138 — Time-First Racing, Optional Advanced Position (QA)

- **Normal result entry:** time only (Festival, Evil Festival and Custom Groups). Position is no longer mandatory.
- **Advanced Timing enabled in Settings:** reveals **optional finishing position inside the Advanced Timing panel**, alongside lap-by-lap timing. Blank is stored as `null` — never treated as a win. Lap-completeness rules are unchanged.
- **AI race wins/podiums:** no longer create after-race honours. Only properly completed Festival/Race Off competitions earn titles and medals; a real car/track PB can still be highlighted after a race.
- **Historical racing data:** untouched, existing positions retained, and racing order/draws unchanged.

## Phone checks
1. Advanced Timing OFF: Evil and normal Festival, normal Custom and Custom Groups show TIME only and save without a position.
2. Advanced Timing ON: open the Advanced Timing panel and verify optional Finish Position exists inside it; lap fields still work and auto-total the race time. Leave position empty, enter laps, save. Test a value like `3` when convenient.
3. Verify that a blank position is `null` (not 1), preserves stored records, and does not create FIRST RECORDED RACE WIN or podium honours.
4. Check existing championship results and record screens are intact; existing old positions remain visible when reviewing historic results.

**Source:** v8.0.137 Main; syntax and package integrity checks. **Awaiting phone QA.**
