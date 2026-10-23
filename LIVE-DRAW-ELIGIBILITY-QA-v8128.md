# OTG! v8.0.128 — LIVE-DRAW ELIGIBILITY (QA)

## Rule repaired
* Tournament's 697 original owned-car list is a programme baseline, not an automatic lifetime ban on new vehicles.
* Only cars added to the currently selected FH5 Garage, validated against the official FH5 catalogue and a clearly matching specialist class, join relevant undrawn parts of competition. Driver's no-buy rule (wheelspins and gifts only) remains a user rule; OTG! does not falsely assert it can independently prove acquisition source.
* Stage-1 Groups accept new eligible cars until their last group is drawn. Drawn groups, stored times, scores and other results never change.
* Standard Festival and Drag fields lock when the full initial field is drawn at event creation. Their result completion thresholds use the true entry count.
* Prepared Race Off entrants refresh until the actual first draw is started, then the full opening field locks; completed matches and byes are immutable.
* Swiss Cups retain precisely 16 cars; selection pool includes eligible newly owned cars until all 16 are selected; field freezes once complete.
* Favourite Manufacturer's make selection stays fixed on first opening, while its eligible field stays open until its event's draw finishes. Its slot footprint is calculated from the original qualified roster, so acquiring another car cannot renumber the remainder.
* Drift Festival and Drift Race Off lock their entrant lists at the first actual round draw.
* Mixed-ecosystem/ambiguous new catalogue cars are deliberately excluded pending specialist review rather than silently entering the wrong competition. Their details are available from window.rhEvilLateAudit8128().needsReview.

## The 1990 Vauxhall Lotus Carlton
* Verified FH5 catalogue item fh5-v1-0867, 1990, Vauxhall, Retro Saloons, NORMAL road car.
* Eligible for the future undrawn 1990s, Retro Saloons and Vauxhall programme, as well as relevant undrawn broad-road pools.
* Already-drawn first-round Race Off fields are preserved.

## Data integrity
* Based on v8.0.127 source; other game engines, garage data, and game records are unchanged.
* Exact 1,219 slot schedule, Swiss at Slot 26, Hubbs memorial, and the current Space's state/progress retained.
* QA: no live phone release verification yet. Back up/export before deployment and verify the new car is marked owned in Garage.
