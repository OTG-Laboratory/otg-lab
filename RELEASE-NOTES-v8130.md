# OTG! v8.0.130 — Penguin Hero Crash & Dashboard Tile Hotfix (QA)

## Root cause (v8.0.129)
On the Tournament landing, v8129 hero decoration compared a whitespace-normalised slot caption to an *un-normalised* caption containing double spaces. The condition was permanently true, so it repeatedly rewrote the same text. The MutationObserver then scheduled endless microtasks; the browser became unresponsive and could crash.

## Repairs
* Idempotent hero caption update: only change text when it is genuinely different.
* MutationObserver now batches its updates into animation frames rather than an unbounded microtask chain.
* Sponsor-logo Dashboard tile height matches neighbouring standard tiles instead of retaining obsolete expanded sponsor-text dimensions; still logo-only and tappable.
* Keeps Dave and Steve's original workshop/penguin hero; sponsor plaque two lines; hero slot labels 1,219; optional After Dark styling.

## Safety
* Includes original v8.0.128 live-draw/Carlton eligibility repair, v8.0.129 artworks, Hubbs Memorial and 1,219 slots.
* No race/draw/Space/Garage/result/migration changes. No reset or restore required.
* Replaces v8.0.129: install this as one complete update; a portable backup is still recommended before updating.
* Phone verification pending.
