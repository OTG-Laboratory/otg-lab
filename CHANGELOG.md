## v8.0.143 — Lifetime Career heading visibility hotfix (PHONE QA PENDING)
- Fixed global CSS `header{display:none!important}` hiding Lifetime Career title; scoped override only.
- Preserves v8.0.142 Lifetime totals/medals and all saved data. See RELEASE-NOTES-v8143.md.

## v8.0.142 — Lifetime Career Across Spaces (PHONE QA PENDING)
- Read-only cross-Space lifetime totals and genuine competition podiums on existing Stats. Individual Space records and historical racing remain separate.
- See RELEASE-NOTES-v8142.md.

## v8.0.141 — Pick My Drive + Smart Car Finder (phone QA pending)
- Smart Finder filters now feed Pick My Drive's existing random draw and race setup; PMD dashboard offers a filter shortcut. No storage model modifications.
- Full regression / phone checklist in RELEASE-NOTES-v8141.md.

## v8.0.140 — Forgotten Cars: Manufacturer Participation (phone QA pending)
- Existing Forgotten Cars adds Space-local read-only manufacturer participation and a tap-to-filter manufacturer view; no new page.
- No changes to race results, Garage ownership, Evil slots, medals, portable backups, or older code.
- See RELEASE-NOTES-v8140.md for details and phone checklist.

## v8.0.138 — QA
- Time-first racing; optional Advanced Timing position. Retains previous results.

## v8.0.137 — Evil time-only results and competition honours (QA)
- Evil Festival/group race entries require TIME only; existing saved positions remain untouched.
- Suppress per-race AI honours in Evil; display factual winner/podium notes only on completed competitions.
- Add read-only completion highlights to existing Group final, standard Festival final and Race Off champion screens.
- Preserve other game/Space position recording.

## v8.0.136 — After-Race Highlights CSS loading hotfix (QA)
- Correct malformed 8.0.134/8.0.135 stylesheet links swallowed by a missing closing quote in v8.0.135 HTML.
- Restore styling to factual after-race milestone rows and the v8.0.134 dice; no data or racing logic changed.

## v8.0.134 — Random-number dice restore (QA)
- Restore the original random-colour dice on the Evil Tournament slot/Open Event view and active event screens; no results or draw logic touched.

## v8.0.133 — Closest Battles ↑ TOP navigation hotfix (QA)

- Repaired scroll-to-top for nested mobile page scrolling; preserved all racing logic and previous features. Phone QA pending.

## v8.0.132 — Same Car History button as Garage (QA)

- Tournament drawn/visible cars now use the exact Garage-style **▤** history icon (same 38 × 38 square and cyan finish), not large text-labelled HISTORY chips.
- Kept existing one-tap Car History and return-to-draw behaviour. Buttons retain an accessible name and tooltip.
- New draw-screen-specific placement keeps small icons beside car names rather than leaving large gaps.
- No gameplay, Garage, live Carlton eligibility, Career Rivals, medal, draw order, saved results, or 1,219-slot campaign changes. Mobile approval pending.

## v8.0.131 — CAR COMPARISON: CAREER RIVALS & ONE-TAP HISTORY (QA)

- One-tap read-only CAR HISTORY chip beside identifiable, owned car names in the Evil slot eligible roster and the Festival/Race Off drawn lineup/current-car views. Opens the existing Car History overlay without leaving the draw; Back restores the previous scroll position. Cannot change entrants or results.
- Car Comparison gains two-car career cards (timed results, distinct recorded competitions, existing honours, Evil Tournament car medals) and verified head-to-head stats and recent meetings; existing same-route PB comparison is preserved.
- Uses the existing Racing Legends same-competition meeting de-duplication; no fictional wins or fabricated data. Active Space only.
- Carries complete v8.0.130 (live-draw Carlton correction, approved penguin hero, normal-sized friendly-logo tile), 1,219 campaign slots and Hubbs/Swiss unchanged.
- **QA status:** static/code checks; install and mobile usability still need verification. No reset, no backup restore.

## v8.0.130 — Tournament Crash & Logo Tile Height Hotfix (QA, 2026-10-21)

- Fixed runaway hero DOM mutation loop that caused browser unresponsiveness/crash in v8.0.129.
- Logo-only sponsor Dashboard tile returned to normal row height; all v8.0.129 artwork and v8.0.128 Carlton draw logic retained.
- No racing results, saved Spaces, Garage ownership or Tournament schedule changes. See RELEASE-NOTES-v8130.md.

## v8.0.129 — Carlton and Penguin Tournament Hero (QA, 2026-10-21)
- Kept the entire v8.0.128 eligible late-car drawing fix.
- Sponsor logo-only Evil Tournament dashboard button, approved penguin workshop hero, two-line plaque and 1,219 slot hero count.
- Read-only branding; no Space or result migration. See RELEASE-NOTES-v8129.md.

## v8.0.128 — Draw-time late arrivals, 21 October 2026
See LIVE-DRAW-ELIGIBILITY-QA-v8128.md.

## v8.0.127 — The Bloody BACK Buttons (2026-10-20)

- Historic Moments: visible Back to Journey / Back to Racing Legends at the hero top AND at the bottom; Top shortcut for long archives.
- Racing Reports and Closest Battles: keep their existing header return and add a clearly labelled return at the foot. A link opened from Historic Moments now returns to Historic Moments; a normal entry returns to Journey or Records.
- Racing Legends: keep the existing top and bottom Back to Stats buttons; when visited directly from Historic Moments, both return to the archive instead.
- Garage Intelligence: each of Forgotten Cars, Smart Car Finder and Car Comparison gets a bottom Back to Garage button without changing its existing top button.
- No changes to results, Garage, Spaces, saves, the 1,219-slot Tournament, Hubbs Memorial, Swiss, timing, medals, or other racing algorithms. No reset or import required.
- QA: JavaScript parsing, data-file hashes, archive integrity and simulated navigation checked. Live-phone check still required.

## v8.0.120 — Current Race Top 3 & Pairing Pace (2026-10-19)

- Move the existing per-track RECORD target beside LOCATION on Enter Result, remove the PB figure only from result entry (PB history and post-race flags are unchanged).
- Festivals and multicar Custom Racing display up to 3 fastest individual times in the exact current event, round, and current group; never cumulative championship standings or different routes. Empty rounds say SET THE PACE.
- Race Off and head-to-head Custom Knockout/Swiss show SET THE PACE for racer one, then racer one's saved time and identity for racer two.
- Read-only display; no changes to saving, stored results, Evil Campaign progress or other Spaces. Live-phone verification needed; v8.0.119 remains accepted until then.

## v8.0.119 — Distinct Rival Meetings & Back Navigation (2026-10-19)

- Arch-Rivals now treats a Festival championship/group as one head-to-head meeting, however many routes it contains. A two-track championship does not make the cars two-time rivals. Festival head-to-head winner uses the sum of the same shared timed races. Knockout and Swiss matches still count as individual encounters.
- Add a prominent BACK TO STATS button at the foot of Racing Legends in addition to the existing small header button; both reset the view and return to Stats.
- Read-only calculation/display update; no stored racing results, medals, Evil Campaign state, or saved Space settings modified. Live phone QA required.

## v8.0.118 — Racing Legends / Arch-Rivals, Dynasties & Comebacks (2026-10-19)

- New RACING LEGENDS button in STATS, opening five expandable Top 5 tables: Arch-Rivals, Car Dynasties, Manufacturer Dynasties, Festival Comebacks and Swiss Comebacks. Each shows its current leader (or an honest empty state).
- Rivals: repeated head-to-head races on matching routes only. Race Off, Custom Knockout, Swiss, and valid standard Festival races qualify; group heats are excluded unless comparable. A minimum of two encounters is required.
- Dynasties use existing Evil R1 Olympic medal tables without adjusting their exclusions. Three golds establish a dynasty; lesser totals are clearly labelled contenders. Other Spaces do not inherit FH5 medals.
- Comebacks: position gained from first-round ranking to completed cumulative-time final ranking in multi-round Festival, or Swiss Round 1 to final Swiss-stage rank based on wins/opponent wins/total time. No standalone knockout comebacks.
- New read-only UI module; no saved racing data is changed. Version-pinned service worker and updater preserved. Live phone QA required.

## v8.0.117 — Closest Battles mobile layout + Evil Campaign dashboard icon (2026-10-19)

- Fixed the v8.0.116 regression: generated record cards carried `8115` class names, but their stylesheet used `8116`, leaving the whole page unstyled on phones. The v8.0.117 JS and CSS now use matching `8117` selectors.
- Updated the active Evil R1 dashboard tile icon from `!` to 😈 without changing the campaign or dashboard counters.
- Preserved the v8.0.116 `sourceCarId` fix, current results, Journey, other record categories, and all existing app data.
- Version-pinned all new assets in the service worker, and kept the Safety Backup update gate. Live phone QA still required.

## v8.0.116 — Race Off Closest Battle snapshot fix (2026-10-19)

- FIX: A Race Off entrant stores the Garage car identifier in `sourceCarId` (not `id`); the v8.0.115 Closest Battles scanner discarded otherwise valid pairings as the same car.
- Race Off Top 5 now derives the correct two car IDs from each saved pairing immediately after both race times are recorded. Full tournament completion is **not** required.
- No stored results, Evil Campaign progress, record/medal history, Journey, or session reports are modified.
- Read-only QA verified from representative Race Off snapshots; live phone PASS is still required.

## v8.0.115 — Expandable closest-battle record book (2026-10-19)

- 10 expandable category cards, #1 always visible and five closest entries on expansion. Empty categories stay visible.
- Festival winner/runner-up versus other final adjacent places are separated; read-only from completed championships.
- Adds Race Off and Custom Knockout, Swiss timed pairings and Swiss tied-standings time-breaks, plus route-classified FH5 Road, Off-Road, Rally Adventure, Hot Wheels and Drag records.
- Classification uses the existing FH5 track taxonomy; unknown routes are not guessed.
- Saved results are never changed; v8.0.114 Journey historic moments and all older features preserved.

## v8.0.114 — Closest Battles & Historic Moments (2026-10-19)

- READ-ONLY: Closest Battles tile under Records, with three lists for finishes, podium, and adjacent standings.
- Only completed time-based Festival and Custom Racing competitions count. Excludes knockouts, Swiss and drift scores.
- My OTG! Journey automatically recalls first mixed-manufacturer golds, exceptional battles ≤1.500 seconds, and Evil R1 landmark slots (13, 25, 50, 100, 250, 500, 1177).
- Space-local, reflects corrections. No racing result saves, resets, or stored duplicates.
- Previous Reports, Evil tile fix and v8.0.113 state preserved.

## v8.0.113 — Racing Reports + Evil Tile Polish (2026-10-19)
- My OTG! Journey: dedicated Racing Reports tile above the special-moments timeline.
- Read-only reports generated from timestamped Festival, Race Off and Custom Racing results per Space; 3-hour inactivity sessions cross midnight naturally.
- Result counts, distinct cars, sum of recorded race times, event completions, record flags, and faster repeat car/track results; optional FINISH SESSION records a small boundary in the current Space.
- Fixed cramped EVIL CAMPAIGN dashboard NEXT line on phone.
- All existing Spaces, event results, Garage, medals and Evil Campaign state preserved. No reset.
- QA pending: mobile reports/history, manual Finish, cross-day and next EVIL tile.

## 8.0.112 — Event paint dice

- Added quick 🎲 number roll on open event screens. Fixed min 1, remembered configurable max, inclusive draws, no racing data impact.
- v8.0.111 features unchanged; live QA of slot confirmation remains pending.

### OTG! v8.0.108 — FH6 Garage-Adaptive Racing (QA)
Owned-car Festival/Race Off preview. Specialist-First eligibility; Event START locked pending FH6 tracks and result engine. Evil List 2 deferred.

## 8.0.102 — Evil R1 reset integration + Legacy retirement

- FIX: Reset Racing Data now clears `evilCampaignR18098` after the approved reset-confirm button replacement, so R1 returns to 0 / 1165 and Slot 0001.
- FIX: direct Reset/Full Reset final actions also clear R1 as a fallback.
- CLEANUP: retired Legacy 708 campaign state is cleared by Reset/Full Reset and its UI tile/button has been removed from Evil Campaign.
- PRESERVED: Garage/catalogue ownership, portable backup, PMD, Results/Corrections, Car History and LOCATION behaviour remain unchanged.

## 8.0.101 — Evil R1 main-page NEXT UP launchpad
- Added **NEXT UP** directly to the main Evil Campaign page, immediately below the progress/next-slot summary.
- Shows the current slot number, event name, mode/format, visit, workload and DO THIS NEXT instruction.
- Added **GO TO NEXT EVENT** and **VIEW SLOT** directly on the campaign page; partially-started slots show **CONTINUE CURRENT EVENT** and banked progress.
- Existing completed-slot NEXT UP handoff and RANDOMISE CAR ORDER behaviour are retained.
- R1 progress/state key, Legacy 708, Garage, Results/Corrections, Car History, PMD, LOCATION and Portable Backup are unchanged.

## 8.0.100 — Evil R1 NEXT UP + car-order usability
- Restored the post-slot **NEXT UP** handoff with **GO TO NEXT EVENT**.
- Added **RANDOMISE CAR ORDER** for untouched R1 Groups; same cars and tracks, order only.
- Car order locks after the first result is banked.
- Existing R1 QA progress and Legacy 708 remain preserved.

## 8.0.99 — Evil R1 Festival Launch + Compact Back Hotfix
- Fixed R1 START/CONTINUE FESTIVAL from Evil Campaign: the app now switches to the Festival screen before the Groups renderer opens the run.
- Existing R1 run/state is reused; no duplicate Slot 1 run is intentionally created by this hotfix.
- R1 Back control changed from the pill/airship to the accepted compact circular control.
- Legacy 708 campaign, Garage, Results/Corrections, Car History, PMD, LOCATION and Portable Backup remain untouched.


## v8.0.97 — FH5 Evil Specialist-First R1 Preview (2026-10-14)
- Added a read-only in-app preview of the new 1,165-slot FH5 Evil Campaign Specialist-First R1.
- Embedded the exact 697-car classification and 228 event definitions/eligible fields generated from the v8.0.96 portable phone backup.
- Added in-app Setup Guide, car-classification browser and R1 audit.
- Preserved the legacy 708-slot campaign and progress; no reset/migration is performed.
- R1 launchers are deliberately locked pending live QA/approval.
- No changes to Garage ownership, Results/Corrections, Car History, PMD, LOCATION clues or rh-guide.

## v8.0.96 — Portable Backup mobile export hotfix
- EXPORT BACKUP now creates and hands off the JSON file synchronously from the user tap so mobile browsers do not revoke the Share/Download permission while waiting for an async hash.
- Replaced pre-export SHA-256 with a synchronous integrity checksum; imports remain backward-compatible with v8.0.94/v8.0.95 portable files.
- Relaxed export validation so older valid OTG! Spaces cannot block the backup simply because their internal car arrays differ.
- Export failures now show the actual browser error while leaving OTG! data untouched.
- No racing, Garage, Evil Campaign, Car History, PMD, LOCATION, Results/Corrections or rh-guide behaviour changed.

## v8.0.95 — Portable Backup Settings UI hotfix
- Replaced fragile Settings renderer wrapping with a direct DOM observer.
- EXPORT BACKUP / IMPORT BACKUP now insert whenever the actual Settings screen is rendered.
- Portable backup data format and existing OTG! data are unchanged.


## v8.0.93 — Pick My Drive structural phone-row fix
- Rebuilt the PMD round row so Layout lives in a dedicated full-width wrapper on phone/tablet widths.
- Removes the collapsed single-letter Layout box and dead lower-row space caused by legacy grid rules.
- Aligns version.json, updater, bootstrap and service worker on 8.0.93.
- No changes to racing data, Car History, LOCATION clues, Evil bridge, Results/Corrections or rh-guide.

## v8.0.91 — Pick My Drive phone row cleanup
- Fixed the compact Pick My Drive round row on phone widths.
- Round number, race/track name and delete now share the first line; Layout spans the full row underneath.
- Removes the empty lower-left grid cell and vertically floating delete button.
- No racing-data changes. Car History career/BACK retained. Morris variant labelling deferred. rh-guide untouched.

## v8.0.86 — Evil return Final Standings exit hotfix
- RETURN TO EVIL CAMPAIGN now tears down Final Standings `rhFS28Active` full-screen mode before opening the linked Evil slot.
- SHOW RESULTS and all racing data/progress remain unchanged.
- Main only; rh-guide untouched.
## v8.0.85 — Evil Campaign return-button hotfix
- Fixes the completed-event **RETURN TO CAMPAIGN** control doing nothing.
- Return controls now use bound click handlers instead of injected inline handlers.
- Handoff explicitly opens Evil Campaign, renders it, then opens the exact linked slot on the next frame.
- Existing SHOW RESULTS links, campaign progress, event data, correction logic and Race Off logic are unchanged.
- Main only; rh-guide untouched.

## v8.0.84 — Evil Campaign two-way results bridge
- DONE Evil slots now expose SHOW RESULTS when an exact completed Festival/Race Off result is linked.
- Links are keyed to the saved event/tournament id and are backfilled from existing Evil campaign markers.
- Evil-origin active events show a small EVIL CAMPAIGN • SLOT xxx origin marker.
- Completed Festival and Race Off screens now include RETURN TO EVIL CAMPAIGN, landing on the exact slot.
- MARK SLOT DONE remains manual; no campaign order/progress reshuffle.
- Main only; rh-guide untouched.

## v8.0.83 — Compact control dimensions
- Physically shrank Evil Campaign and Results / Corrections Back controls to circular navigation buttons.
- Final Standings Correct Results is now a slim utility pill.
- No racing-data or Evil-progress changes.

## v8.0.82 — Updater boot-shell hotfix

- Fixed v8.0.81 update loop: the v8.0.81 worker installed but its navigation handler still served `index-v8080.html`, so the app reopened the previous shell and offered v8.0.81 again.
- The v8.0.82 worker now serves `index-v8082.html` after activation, and the canonical worker is synchronised to the same build.
- Carries forward all v8.0.81 Results / Corrections car-name and compact-control polish unchanged.
- No racing-data migration; Evil Campaign order/progress and Race Off logic unchanged; rh-guide untouched.

## v8.0.81 — Results Corrections car names + compact controls

- Fixed the v8.0.80 Results / Corrections car-name resolver so saved cars and the Current Leader use the active Space catalogue instead of falling back to `Unknown car`.
- Reduced the Results / Corrections Back control to the standard compact OTG! utility size.
- Reduced the Evil Campaign Back control to the same compact language.
- Reworked completed Final Standings `CORRECT RESULTS` into a compact top-right action and removed its redundant subtitle.
- No changes to saved racing data, Evil Campaign order/progress, Race Off logic, or rh-guide.

## v8.0.80 — Festival Results Corrections + save-integrity guard
- Added **RESULTS / CORRECTIONS** for standard Festival championships while they are still in progress and from completed Final Standings / Festival History.
- Added **EDIT / UNDO LAST RESULT** directly on the Festival Result Summary.
- Saved times and finishing positions can be corrected in place without creating another race or inflating Track Directory usage.
- A saved result can be deleted to **reopen exactly that missing car / round**, leaving every other result and Evil Campaign progress intact.
- Corrections clear matching Record Book exclusions so a previously deleted bogus record can return correctly after repair / rerun.
- Standings, Records/PBs, Stats, Track Directory usage and Hall of Fame derive from the saved results and recalculate from corrected data.
- Standard Festival result saving now validates the exact expected car + round, blocks duplicate/stale saves and rolls back inconsistent multi-write saves.
- Added a small per-Space result audit trail for future diagnosis if another impossible save is observed.
- Special Festival Groups/Swiss logic and Race Off bracket editing are deliberately unchanged in this first correction build. Evil campaign order/progress unchanged; rh-guide untouched.

## v8.0.79 — Evil Festival setup + shuffle-bag reset repair
- Evil-launched Festival setups now show **EVIL CAMPAIGN PROGRAMME • SLOT ### • active pool** instead of stale v8.0.70 diversified preset copy.
- Reset Racing Data and Full Reset now reliably clear `fh5TrackBags8070` after the v8.0.66 reset-button clone.
- A clean 0/708 Evil campaign with no racing data self-heals stale pre-reset bag state, so the first preview begins from a full category bag.
- Campaign order/progress unchanged; rh-guide untouched.

## v8.0.78 — Evil Campaign BACK control actually visible

- Root cause found: legacy global CSS hides all `<header>` elements with `display:none!important`, so v8.0.77's BACK button was trapped inside an invisible parent.
- Evil Campaign BACK now renders outside the hidden hero/header as a fixed top-left control.
- Same standalone BACK behaviour is used on the campaign list and slot-detail screens.
- Campaign order, progress, racing data and embedded 708-slot manifest are unchanged.
- rh-guide untouched.

## v8.0.76 — Andy Evil Campaign foundation
- Embedded the authoritative 708-slot / 697-car R2 Evil campaign into Main as an Andy/FH5-only campaign module.
- Controlled reshuffle of regular slots 1–639; multi-visit order preserved; Finals / Final Boss 640–708 preserved exactly.
- Source opening slots 1–4 are deliberately pushed to new slots 91, 311, 94 and 98 so the fresh start does not immediately replay them again.
- Dashboard is a two-column x five-row grid in FH5: Festival | Evil Campaign; Race Off | Custom Racing; Garage | Race Setups; Pick My Ride | Records; Stats | Settings.
- Evil Campaign tile uses dark crimson and shows only campaign progress plus next slot.
- Campaign screen carries the full shuffled list, current-slot instructions and manual TODO/DONE progress.
- Supported Festival slots hand off to the existing Festival setup engine and v8.0.70 persistent shuffle bags; supported Race Off slots hand off to the existing live auto-route engine.
- The embedded R2 track pool is authoritative where it differs from the normal FH5 preset, including Mexico Class/Type Rally staying OFF-ROAD.
- R2 protected Race Off finales are enforced, including Copper Canyon Sprint for All Cars and The Gauntlet for Mexico Class/Type Rally fields.
- Reset Racing Data / Full Reset also resets Evil Campaign progress.
- Main only; rh-guide untouched. Pick My Drive phone-row TODO remains deferred.

## v8.0.75 — History + Pick My Drive phone polish
- Festival and Race Off History are compact top-right header controls level with Back.
- Pick My Drive round rows received a first phone-layout adjustment; live QA still found the lower controls malformed, so the row remains on the TODO list.
- Main only; rh-guide untouched.

## v8.0.74 — Track Directory live-race polish
- Track Directory phone search field now clears the fixed Back control instead of sitting underneath it.
- Festival live Championship screen now places LOCATION beside the actual current-race CONTINUE button used by the v7/v8 overview.
- Added a DOM fallback so LOCATION is restored even if the Championship screen is rendered through an alternate resume path.
- Completed-result-only track usage counters from v8.0.73 retained unchanged. Main only; rh-guide untouched.

# OTG! CHANGELOG

## v8.0.72 — Track Usage Counters
- Track Directory now shows how many committed track slots have used each route in the current FH5 Space.
- Breakdown shows Festival, Race Off, Pick My Drive and Custom Racing usage where present.
- Usage is derived from existing started racing data, so the current restart is backfilled automatically on first load.
- Previewing, RANDOM TRACK / RANDOMISE ALL rerolls and unstarted setups do not count.
- A track is counted once when its event / stage / Race Off round becomes committed; repeated car runs or pairings on that same committed round do not inflate the counter.
- Reset Racing Data clears the usage naturally because the counters are derived from racing history rather than stored separately.
- v8.0.71 Track Directory / LOCATION feature retained; v8.0.70 shuffle bags and Race Off routing unchanged.

## v8.0.71 — FH5 Track Directory
- Added a searchable FH5 Track Directory to Records.
- Catalogues 145 usable OTG! routes; Winter Wonderland remains deliberately excluded.
- Added concise landmark-based location clues and B/P/G/O Mexico map-colour codes.
- Added LOCATION buttons to Festival setup/stage setup and Race Off setup/review/programme screens.
- Added per-track usage counters in the directory and LOCATION card, with Festival / Race Off / Pick My Drive / Custom breakdowns.
- Usage is derived only from started FH5 racing data in the current Space, so existing progress is backfilled automatically; previewing and rerolling do not count.
- No racing-data reset; v8.0.70 shuffle bags and Race Off routing remain untouched.

## v8.0.70 — FH5 full track cleanup
- Added 10 permanent Mexico Road routes to the OTG! taxonomy; Winter Wonderland Circuit is deliberately excluded.
- Catalogued Rally Adventure Ambassador races as protected SPECIAL tracks.
- Festival RANDOM TRACK / RANDOMISE ALL now use persistent per-category shuffle bags: a track is only consumed when START freezes the event/stage, and the bag refills only after every track has been used.
- Race Off now auto-plans a unique track for every non-final bracket stage from its own independent shuffle bags; showcase finales remain protected.
- Fresh Festival default programmes are diversified across the expanded track catalogue.
## 8.0.69 — FH5 Festival RANDOMISE ALL
- Added RANDOMISE ALL above the current FH5 Festival race programme.
- Rolls every editable race slot in the current setup/stage in one hit using the same category-safe pools as the individual picker.
- Batch rolls avoid duplicates inside the generated set and continue to deprioritise tracks used recently.
- Individual RANDOM TRACK / REROLL TRACK controls remain available after the batch roll.
- Groups later-stage setup is supported; single-option finales remain locked and multi-option finale pools remain protected.
- Drag keeps its assigned-strip logic and fixed/special programmes remain untouched.
- No rh-guide changes.

## 8.0.68 — FH5 Festival track randomiser
- Added a one-at-a-time RANDOM TRACK button to each editable FH5 Festival race slot.
- Event race category automatically selects the eligible pool: Road/Street, Off-road, Rally Adventure, Hot Wheels or Mixed.
- Random picks avoid duplicates inside the current race set and prefer tracks not used in recent Festival runs.
- Groups later-stage setup is supported too. In the Final, the last slot uses the protected finale pool; single-finale categories stay locked.
- Drag keeps its existing assigned-strip logic and fixed/special programmes remain untouched.
- Existing suggested programmes remain available and editable; randomising is optional.
- No rh-guide changes.

## 8.0.67 — FH5 track taxonomy foundation
- Added explicit FH5 Festival race categories without changing any existing race setup.
- Added canonical Road/Street, Off-road (Dirt + Cross Country), Rally Adventure, Hot Wheels and Drag track pools.
- Added finale pools: Road (Goliath / Colossus / Marathon), Off-road (Titan / Gauntlet), Rally Adventure (Horizon Badlands Goliath), Hot Wheels (Hot Wheels Goliath). The Gauntlet is tagged as an optional future Road finale wildcard.
- Added setup-screen category/coverage badge for QA.
- No random track picker yet; this build is the category foundation only.
- rh-guide unchanged.

## 8.0.66 — Live QA fixes
- Car History: guaranteed visible Back control.
- Reset Racing Data: now clears Race Off data, fixing surviving Hall of Fame/record entries after reset.
- Festival: guarded Championship opener prevents a malformed saved run becoming an untappable card; data-preserving recovery screen added.
- No FH5 rules/catalogue changes; rh-guide remains frozen at v8.0.17 PASS.

## v8.0.62 — Consolidated Reliability + Lonely Hearts
- Repaired the update delivery chain so the v8.0.61 → v8.0.62 transition is gated by the UPDATE AVAILABLE / Safety Backup flow instead of silently advancing when new page files arrive first. `version.json`, `update-manifest.json`, the bootstrap and service worker are aligned to v8.0.62.
- Safety Backups now protect the complete current Space payload, including active Race Offs, Race Setups and other Space data that the older snapshot omitted. A recent incomplete Safety Backup can be repaired on first v8.0.62 load.
- Restored the Danger Zone / Abandon action to Festival Swiss and Custom Racing Swiss, including Swiss knockout continuation screens. Existing completed results, PBs and records keep their Abandoned provenance.
- Fixed Championship cards containing apostrophes or other special characters, including `Pickups & 4x4's Championship`, by replacing the fragile inline setup handler with a safe delegated handler.
- Repairs duplicate Hennessey manufacturer variants in live Space data to one canonical Hennessey manufacturer without changing backups or the protected catalogue.
- Added LONELY HEARTS to Festival and Race Off. Eligibility is exactly one owned car per manufacturer, evaluated live before a new run and frozen when the run starts. Festival uses the normal Standard / Groups / Swiss entrant thresholds; Race Off uses knockout.
- Completed Race Off champions now appear in Hall of Fame with the Race Off presentation and aggregate winning time. Existing Festival Hall of Fame entries are unchanged.
- Race Off landing now lists every active/in-progress tournament with its own Continue action, so parked tournaments can be interleaved and resumed safely.
- Main only; rh-guide remains v8.0.17 and is untouched.

## v8.0.61 — Result Summary + Record Celebration Reliability
- Fixed the Result Summary regression that mixed times from different rounds/courses into the displayed average.
- Average comparison is now scoped to the current Championship/Event and the current round/course only, with matching count/copy.
- Fixed the intermittent top-right record-celebration artifact by strengthening the shared mask that hides the baked-in All-Time rosette/text when no All-Time record was earned.
- The record visual fix is shared by Festival, Custom Racing and Race Off record screens.
- Record calculations, FH5 setup/programme logic, progression, Garage/catalogue data and backups are unchanged.
- Main only; rh-guide remains untouched.

## v8.0.59 — Swiss Full Programme Preview
- Festival Swiss setup now shows the complete suggested programme before START, matching the Groups preview model.
- The card shows the configured Swiss-stage tracks followed by the selected knockout path (Round of 16 / Quarter-Final / Semi-Final as applicable) and Final.
- Preview suggestions use the same v8.0.58 live knockout-track logic, including diversified Goliath / Colossus / Marathon and specialist finales.
- Changing the Swiss knockout cut or editing configured Swiss tracks refreshes the preview.
- Live knockout suggestions remain editable when each round is reached; Standard and Groups behaviour is unchanged.
- Main only. Locked artwork unchanged.

## v8.0.56 — FH5 Festival / Race Off Rebuild
- FH5 Championship presets now load suggested format and rounds automatically from the final multi-tab race-setups library.
- Existing Festival families retained: All Cars, Favourite Manufacturer, Vintage & Classic, Era, Class / Type and Manufacturer.
- Added Rally Adventure, Hot Wheels and Drag Racing specialist Championship and Race Off families.
- Recommended format: 2–16 Standard, 17–64 Groups, 65+ Swiss; users may edit recommended setups before start.
- All Cars Festival is fixed to Standard / 1 round / Copper Canyon Sprint and retains the late-car exception.
- Race Off pre-fills a suggested track each knockout round and reserves matching long-form finals where applicable.
- Main only. Locked artwork unchanged.

## v8.0.55 — Foundation Fixes
- Result Summary average comparison is now scoped to the current round/course inside the current Championship/Event; mixed-course Championship averages are no longer shown on Result Summary.
- Swiss remains available for every field of 8+ entrants with no entrant ceiling.
- Swiss now recommends 3 rounds for 8–64 entrants and 4 rounds for 65+ entrants. Custom Racing exposes an Advanced/Custom rounds override for longer Swiss stages with no configured-round ceiling.
- Removed the obsolete 4–8 configured-round validator from Custom Racing Swiss and Festival Swiss, including START gating.
- Final Standings total-time logic is unchanged. No artwork, catalogue or user-data migration changes.

## v8.0.54 — Custom Swiss Final Trophy
- Custom Racing Swiss now routes its completed knockout final to the existing locked Final Standings/trophy presentation.
- Final screen shows both finalists, the Swiss champion and the actual final winning time, then returns to Custom Racing.
- No artwork, catalogue, backup or user-data changes.


## v8.0.53 — Scalable Swiss Entrants
- Removed the old 32-entrant Swiss ceiling. Swiss now accepts any field of 8 or more entrants in Custom Racing and Festival championships.
- Retains the existing 4–8 Swiss round planner, Wins → Opponent Wins → Total Time standings, rotating byes, rematch avoidance and Top 4/8/16 knockout cuts.
- No user-data migration or reset.
## v8.0.52
- Festival Swiss completion now uses the locked final-standings/trophy screen, with the Swiss champion and Final winning time.
- Standard Championship Result Summary now ranks cars by the just-completed Round and shows ROUND TIME/GAP instead of cumulative Championship totals.
- Retains all v8.0.51 setup, Swiss, Smart Bar, Hall of Fame and loader fixes.

## v8.0.51
- Saved Race Setups display A–Z; Load Race Setup rows keep a fixed aligned chevron column.
- Fixed the Round 2+ Smart Bar ghost-tap path: suggestions now commit on click instead of pointer-down, so a re-render cannot tap the Saved Race Names button underneath; the picker touch/scroll path is also hardened.
- Added Swiss to Festival Championship format options (8–32 entrants), reusing the tested Swiss standings/pairing rules and flowing into a knockout finish.
- Standard Championship final standings now include each car's per-round/event split times alongside Total Time and Gap.
- Repaired Hall of Fame Back so Records mode and visible screen state change together.
- Main only; no artwork changes and no data migration/reset.


## v8.0.50
- Repaired update manifest/service-worker pinning so installed builds actually advance from v8.0.48.
- Compact Saved Race Setup cards: no track list; setup name limited to two lines; round count/Edit/Delete retained.
## v8.0.49 — Compact Saved Race Setups
- Removed track-name lists from Saved Setup cards.
- Setup name is limited to two lines; round count and Edit/Delete remain compact alongside it.

## v8.0.42
- Custom Swiss race flow carried forward from v8.0.41.
- Fixed update discovery by bumping update-manifest, worker, bootstrap, updater and visible version together.

## v8.0.41 — Custom Swiss Planner Foundation
- Adds Swiss as a Custom Racing format.
- 8–32 entrant guardrail, selectable Swiss rounds and knockout cut.
- Locks pairing rules, standings tie-breaks and round-by-round track selection for race-flow wiring.

## v8.0.39 — App-wide Smart Bar
- Enforces the compact one-best-match Smart Bar above every genuine text-entry field. Numeric/result fields remain excluded.

## v8.0.38 — Custom Knockout Records/PB Wiring
- Custom Knockout single-run results now feed Track Records and Car PB history.
- New Championship/All-Time bests use the current approved OTG! record screen.
- Existing knockout bracket, prelim/byes and match progression logic is unchanged.

## v8.0.37 — Custom Knockout compact match rows
- Reduced car-name, time, status and match-number sizing.
- Tightened vertical spacing while preserving the v8.0.36 readable match-row hierarchy.
- No knockout maths or progression changes.

## v8.0.36 — Custom Knockout match-row polish
- Reworked live Knockout MATCHES rows into separate car/time lines with anchored status and a dedicated winner line.
- No knockout progression or result logic changed.

## v8.0.34 — Custom Knockout Planner Foundation
- Added KNOCKOUT to Custom Racing competition formats.
- OTG! calculates a clean elimination bracket from the selected entrant count.
- Odd fields show preliminary matches and straight-through places automatically.
- Custom KO is capped at 64 entrants for the planner foundation.
- START remains deliberately disabled until the proven Race Off engine is wired into Custom.

## v8.0.33 — Custom Groups Final Exit / Archive Fix
- Fixed RETURN TO CUSTOM RACING on the completed Custom Groups Final screen.
- Completed Custom Groups events now return to the refreshed Custom Racing list, where they remain completed rather than In Progress.

## v8.0.30
- Custom Groups single-run results now feed Track Records and Car PB history.
- Event/All-Time record celebrations now appear when an existing best is beaten.

## v8.0.27
- Wired Custom Groups race flow: frozen balanced draw, sequential groups, Top 2 qualification, group standings/history, and configurable Final.

## v8.0.18 — Safety-gated manifest update certification
- Version-pinned v17 stays active until UPDATE NOW.
- v18 worker is only registered after protected Safety Backup verification succeeds.
- LATER does not install or stage the v18 worker.
- Manual update check reads the same no-cache manifest.

## v8.0.17b
- Corrected the v8.0.16 bridge updater so the waiting update prompt identifies v8.0.17 rather than v8.0.16.
- No changes to Safety Backup gate or activation logic.


## v8.0.16 — Gated waiting service-worker update
- Stops silent service-worker activation from bypassing the Safety Backup gate.
- New app worker installs in WAITING state until UPDATE NOW succeeds.
- UPDATE NOW creates and verifies Safety Backup before SKIP_WAITING.
- Activated worker serves the v8.0.16 app shell and reloads once.
## v8.0.11 — Groups compact navigation/status pills
- Reduced the Total Time Groups visible Back pill to a compact size.
- Matched the Current Car `x OF y` status pill to the Back pill dimensions and kept it on one line.
- No racing logic changed; v8.0.10 live Garage reconciliation retained.

## v8.0.8
- Fixed Total Time Groups final CHAMPIONSHIP COMPLETE action.
- Persists Groups champion and winning Final total for Hall of Fame/Journey.
- Groups completion now exits cleanly back to Festival without re-opening the completed Final.

## v8.0.7 — Festival Groups record notifications
- Restored Championship Record and All-Time OTG! Record notifications for Total Time Groups.
- Reuses the approved existing record celebration screen and artwork.
- Record flow returns to the current Group without exposing hidden cumulative group standings.

# OTG! v8.0.5

- Fixed Total Time Groups result handoff so a saved result advances the active car to the next track.
- Group results now carry active group/stage metadata from the real segmented result-save handler.
- Added safe recovery for v8.0.4 in-progress group results saved without group metadata.
- Group result confirmation shows only the individual track leaderboard; cumulative group standings remain hidden until the group is complete.
- Added a visible Back control to the active Groups overview/result flow without altering the locked draw.
- Preserves v8.0.4 Festival entry selector no-scroll-jump fix.

# OTG! v8.0.6

- Added visible Stage + Group identity to active Total Time Groups screens and completed group reveals.
- Reduced the Groups Back control to the normal compact OTG! navigation size.
- Added the existing OTG! Danger Zone / Abandon Championship flow to active Groups championships.
- Preserves valid completed results, PBs and records when a Groups championship is abandoned.

## v8.0.9 — Festival Groups stage track setup
- After a Groups stage finishes, OTG! now pauses before the next stage/final and asks for a fresh track set.
- Qualified cars remain locked; previous-stage results remain locked.
- Final track setup is separate from Stage 1, with three fresh tracks by default and add/remove support.
- Saved race-name picker is available on the new stage setup screen.

## v8.0.13 — Safety Backup Gate
- Adds verified pre-operation Safety Backup plumbing.
- A risky operation is allowed only after the Safety Backup is persisted and verified.
- Verification failure blocks the operation before it can run.
- Adds Main/developer test controls in Data / Backups for success and forced-failure paths.

## v8.0.14
- Added automatic online OTG! version discovery on app launch.
- Added OTG! UPDATE AVAILABLE modal with Update Now / Later.
- Update Now is blocked unless the protected Safety Backup is created and verified first.
- Manual Check for Latest Update now uses the same no-cache version check.
- Removed the temporary v8.0.13 Safety Gate developer test card after both paths passed.

## v8.0.15
- Update discovery end-to-end test release.
- No feature changes beyond version/service-worker bump required to prove v8.0.14 automatic discovery and gated update flow.


## v8.0.16b — Waiting Worker Doorbell Repair
- Keeps v8.0.15 active while update waits.
- Makes only the update shell critical during service-worker install; legacy optional cache misses can no longer abort the waiting worker.
- Existing v8.0.15 discovery listener can now see the waiting v8.0.16 worker and show the update prompt.

- v8.0.18b: retired legacy automatic updater from active v8.0.18 shell; manifest-led Safety-gated updater is now sole update authority.


- v8.0.18c: update Safety gate rebuilt as a self-contained all-Space localStorage transaction with immediate persisted verification before service-worker registration.

## v8.0.21 — Backup Authority Fix
- Update transaction re-reads persisted backup slots immediately before Safety Backup creation.
- Persisted manual backups are canonical and preserved byte-for-byte.
- Fresh Safety Backup is written only to the protected slot and verified before update registration.

- v8.0.22: Final backup rotation certification build; no feature changes.

## v8.0.24
- Removed truncated qualifier previews from Completed Groups rows.
- Added Back navigation from completed-group standings to history.

## v8.0.26
- Custom Racing racer picker now preserves the currently expanded manufacturer while cars are selected or deselected.
- Multiple cars from the same manufacturer can be selected without reopening its accordion after every tick.

- v8.0.28: Fixed Custom Groups Start/Continue render failure caused by the wrong DOM ID helper.

## v8.0.29
- Custom Groups result entry now uses the approved segmented digital OTG! screen.
- Advanced Timing decoration is available on Custom Groups result entry.
- Fixed live Custom Groups Back navigation to return to Custom Racing.

- v8.0.31 — Corrected Custom Groups Records build packaging/version chain; carries v8.0.30 Records/PB wiring.

## v8.0.32
- Custom Groups record celebrations now use the current OTG! record screen and current record hero.
- Removed the legacy Custom Groups clipboard/Hubs record route.
- Hubs character artwork is blocked from active app rendering; Hubs remains website-only.

## v8.0.35
- Custom Knockout race flow: frozen bracket, preliminary round, straight-through cars, round-by-round track setup, head-to-head results and champion completion.

## v8.0.43
- Custom Swiss BYE display now reads AUTOMATIC WIN instead of +1 W. Swiss scoring and pairing logic unchanged.

- v8.0.44 — Custom Swiss BYE card layout polished: AUTOMATIC WIN now displays on its own line above the car name. Swiss logic unchanged.

## v8.0.57 — FH5 Groups Full Programme
- FH5 Groups presets now continue automatically from Preliminary through any required Stage 2 to the Final.
- Stage 2 uses three fresh discipline-appropriate suggested tracks wherever possible.
- Finals use three suggested races and end on the appropriate showcase finale: Goliath, Gauntlet, Titan, Horizon Badlands Goliath, Hot Wheels Goliath, or Aerodromo Drag Strip.
- Later-stage suggestions remain editable and never overwrite a manually edited pending stage setup.
- Existing active v8.0.56 FH5 Groups runs can receive the new continuation suggestions without restarting.
- The five unverified Cross Country names identified by Race Finder Mk II are excluded from newly generated later-stage fallback suggestions pending in-game verification.
- Specialist Festival/Race Off helper text phone layout polished.
- Record-celebration right-rosette issue remains watch-only; no static layout change.
- Main only; no artwork changes.
## v8.0.58 — FH5 diversified finals + Swiss full programme
- Mexico showcase finals now select Goliath, Colossus or Marathon by event/profile rather than defaulting all road-ish events to Goliath.
- Groups final suggestions use the diversified showcase map while preserving manual edits and active v8.0.57 runs.
- Festival Swiss knockout rounds now auto-suggest editable FH5 tracks through Top 16 / Top 8 / Top 4 brackets and the Final.
- Race Off final pairing uses the same diversified showcase map.
- No artwork changes; record-rosette issue remains watch-only.


## v8.0.59 — FH5 Swiss Full Programme Preview
- Festival Swiss setup now shows its complete configured Swiss stage and selected knockout route through the Final before START.
- Preview uses the same live v8.0.58 knockout track suggestions and remains editable at each live stage.

## v8.0.60 — FH5 Staged Programme Previews
- Race Off first-round setup now shows a FULL RACE OFF PROGRAMME before the first draw starts.
- Route is calculated from the actual locked entrant count, including Preliminary Round when required and every knockout stage through the Final.
- Race Off preview uses the same live round track rotation and diversified Final logic already used during the tournament.
- Swiss full-programme preview from v8.0.59 retained unchanged.
- No bracket, draw, result, record, Standard, or Groups logic changes. Main only; locked artwork unchanged.

## v8.0.63 — Live QA polish
- Festival Lonely Hearts intro now matches the clean Race Off presentation and no longer crushes explanatory copy on phones.
- Canonicalises the misspelled `Hennessy` manufacturer into `Hennessey`, merging the two live manufacturer cards without losing cars/progress.
- Guards Race Off catalogue ordering so Festival remains before Favourite Manufacturer.
- Main only; cumulative over v8.0.62. No reset required.

## v8.0.64 — Race Off in-progress cards
- Replaced the temporary top-level **CONTINUE RACE OFF** bucket with Festival-style in-place status cards.
- Active/setup Race Offs now remain in their natural Festival / Favourite / Vintage / Era / Class-Type / Manufacturer / specialist sections.
- Each active card shows **IN PROGRESS** plus its current bracket/setup status and resumes that exact tournament.
- Multiple active tournaments remain independently resumable, including duplicate active runs from one catalogue category.

## v8.0.65 — History, Pickups normalisation & Drag redesign
- Canonicalised FH5 `Pickups & 4x4`, merging apostrophe/plural aliases in live data and source catalogue/programme tables.
- Replaced the long Race Off History block with dedicated History screens reached from compact hero tiles on both Festival and Race Off.
- History cards include completion date, entrants, champion/winner and timing metadata, with tap-through to the completed run/tournament.
- Race Off top ordering now mirrors Festival: OTG! / Favourite / Lonely Hearts before the rest of the catalogue.
- Removed Drag specialist events from Race Off.
- Festival Drag is now a one-round, one-run-per-car shootout; fastest overall time wins.
- Drag strip assignment is performance-aware: Teotihuacan (slow), Festival (middle), Aerodromo (fast).
- Zero-result prepared/active legacy Drag Championships are migrated in place; runs with existing results are not rewritten.

- v8.0.65 R2: hardened the update Safety Backup gate for large Spaces using verified IndexedDB-backed snapshots; added an in-place v8.0.64 updater hotfix path and delayed v8.0.65 data migrations until update acceptance.

## v8.0.77
- Evil Campaign BACK control hotfix on campaign list and slot detail screens. Campaign data/progress unchanged.
## v8.0.92 — Updater pin + Pick My Drive phone layout
- Corrected the v8.0.91 shell bug that still loaded `bootstrap-v8090.js`, which could keep the installed worker/version on v8.0.90 and repeatedly offer v8.0.91 after restart.
- Main shell, updater and worker are now consistently pinned to v8.0.92.
- Pick My Drive phone round rows keep round number, track name and delete on line one, with Layout full-width beneath. The v8.0.92 override is loaded after legacy PMD styles.
- Car History career/BACK, LOCATION clues, Evil bridge and Results/Corrections unchanged. Morris variant labelling remains deferred. rh-guide untouched.

## v8.0.93 — Pick My Drive structural phone-row fix
- Rebuilt the Pick My Drive mobile round row structurally so Layout occupies its own full-width row. Live QA PASS; accepted Main baseline before v8.0.94.

## v8.0.94 — Portable Backup
- Added Settings > PORTABLE BACKUP with EXPORT BACKUP and IMPORT BACKUP.
- Export/share writes all OTG! Spaces, Garage ownership, racing history and current state to a portable JSON file.
- Browser-only IndexedDB Safety Backup snapshots are intentionally not embedded in the portable file; manual in-app backups remain part of Space data.
- Import validates the file and integrity digest, replaces all OTG! data only after confirmation, and first keeps a pre-import rollback copy in IndexedDB.
- Added RESTORE PRE-IMPORT when a rollback exists.
- Evil Campaign content/progress logic, Car History, LOCATION clues, Pick My Drive v8.0.93 and rh-guide are unchanged.


## 8.0.98 — Evil Specialist R1 playable QA (2026-10-14)
- Promoted the accepted 1,165-slot Specialist-First R1 preview to playable QA.
- Added exact-field Standard/Groups Festival, Race Off, Drag, Drift Festival and Drift Race Off flows.
- Added workload-gated slot completion and persistent R1 progress under a separate state key.
- Legacy 708 remains preserved; no automatic migration/reset.

## OTG! v8.0.109 — FH5 Evil R1 Groups completion QA
- Fixes frozen eight-car completion assumption for smaller Groups. Hypercar Slot 0002 requires 14 valid entries (7 × 2), not 16.
- Counts unique valid car/track results tied to each actual group, not total event results. Group 2 cannot artificially finish Group 1.
- Calculates the displayed per-visit workload from actual group size, with balanced planning for not-yet-drawn groups and qualifiers. Applies to all R1 GROUPS competitions and later stages/finals.
- Does NOT modify prior stored race results, manually-marked DONE slots, Garage ownership, favourite manufacturer, reset logic or FH6 adaptive systems.
- Version-pinned service worker, manifest updater and backup gate updated.
- v8.0.103 AVERAGE TIME and mobile RUN ORDER are still awaiting user's explicit checks.

## OTG! v8.0.110 — Evil R1 MOT: track draw + updater integrity
- In Groups championships, two tracks drawn together are always different when at least two routes exist. In the first stage, the second draw excludes the first. In subsequent stages/finals, the second draw also excludes the first and the prior-stage tracks already considered by the selector.
- The shared track shuffle-bag can roll over between draws without re-selecting the first track of that group. Existing in-progress race tracks are not modified.
- Worker critical-precache now explicitly verifies the new index, script, bootstrap and update-wire before installing. Old historical files are retained.
- Re-audited all 697 classified cars, 228 source events, 1,165 base campaign slots and 251 planned GROUPS slots; no structural inconsistencies. Favourite Finals stay adaptive and separated, giving 1,177 slots for a 26-car BMW NORMAL roster.
- No campaign reset, result migration, or changes to FH6/GT7. AVERAGE TIME and mobile RUN ORDER still need live QA.

## 8.0.111 — Evil R1 Slot Complete, Next Up & Medals

- Detect per-slot completion, show prominent STOP HERE and MARK AS DONE.
- Make main Evil R1 NEXT UP a concise workload / stage brief with banked results.
- Add calculated Manufacturers and Cars Olympic medal rankings, medal histories and car history counts.
- Keep v8.0.110 racing data/state intact; worker assets pin exact v8.0.111 critical files.

- **Brand tagline (approved):** YOUR HARDEST OPPONENT IS YOU. Added to the dashboard and Evil R1 medal-table header.

## v8.0.135 — After-Race Highlights (QA)
- Factual read-only highlights embedded in existing post-result screens. No new result screen, new save fields, XP, or tournament change. See RELEASE-NOTES-v8135.md.
