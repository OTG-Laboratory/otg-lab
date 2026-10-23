# OTG! v8.0.136 — After-Race Highlights Visual Hotfix (QA)

## Problem confirmed from phone screenshot

The screenshot showed a valid **first recorded win** highlight but with an unstyled icon/heading and the text `WINFor this car` running together. The cause was in v8.0.135's HTML: the previous `style-v8134.css` link was missing its closing quote and angle bracket, which swallowed the new `style-v8135.css` link. Neither style sheet loaded.

## Fix

- Correct both stylesheet `<link>` tags in the v8.0.136 active and pinned entry HTML.
- Existing After-Race Highlights now use their already-built compact, cyan/dark cards with separate icon, title and explanatory line.
- Restore the intended 8.0.134 dice stylesheet, which was also inadvertently omitted in 8.0.135 because of the malformed tag.
- New version pin, updater bootstrap, safety-gated update wire and cache worker to reliably deploy the correction on phones.
- **No racing logic, milestone calculation, saved results, tournament draw, championship progress or record data changed.**

## Phone QA

1. Make your usual portable backup before Git update.
2. When you next record a qualifying result, confirm RACE HIGHLIGHTS appears as a **compact bordered panel**. The icon is to the left and the title and detail occupy separate lines; no `WINFor` collision.
3. Confirm random-colour dice remains available; the restored 8.0.134 stylesheet is now linked properly.
4. Existing records, average time, leaderboard and VIEW NEW RECORD button should look and work as before.

Note: Previously recorded result screenshots do not retroactively repopulate the highlight card; it is a save-time, ephemeral UI. Continue racing normally to see new highlights when earned.
