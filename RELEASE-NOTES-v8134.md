# OTG! v8.0.134 — Return of the Random Paint Dice (QA)

**Slot 13 — 1970s Festival Groups**: the user verified the live Top 3 leaderboard works. The random-number dice seemed to disappear when opening the event. The legacy dice module only targeted older #festival/#raceoff templates and not the #evilcampaign slot/Open Event screen.

This update uses the same existing dice dialog (minimum fixed at 1, remembered configurable maximum up to 9,999, uniform draw) and extends visibility to the Tournament slot screen and active Festival/Race Off event and entry pages. It does not add a dice to the Dashboard, campaign overview, Garage, Records or setup list.

Read-only UI patch: no changes to draw logic, painted colour choice state, event results, slot count (1,219), Top 3, Carlton fix, Car History, Hubbs, Swiss or backups. Phone QA pending.
