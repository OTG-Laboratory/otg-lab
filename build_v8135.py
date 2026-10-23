from pathlib import Path
import json, re, shutil
p=Path('/mnt/data/otg-after-race8135')
index=(p/'index-v8134.html').read_text()
index=index.replace('content="8.0.134"','content="8.0.135"')
index=index.replace('style-v8134.css?v=8134','style-v8134.css?v=8134\n<link rel="stylesheet" href="style-v8135.css?v=8135"')
index=index.replace('<script src="js/otg-career-rivals-draw-history-v8132.js?v=8132"></script>','<script src="js/otg-career-rivals-draw-history-v8132.js?v=8132"></script>\n<script src="js/otg-after-race-highlights-v8135.js?v=8135"></script>')
index=index.replace('js/bootstrap-v8134.js?v=8134','js/bootstrap-v8135.js?v=8135')
index=index.replace('js/update-wire-v8134.js?v=8134','js/update-wire-v8135.js?v=8135')
for path in [p/'index.html',p/'index-v8135.html']:path.write_text(index)
boot=(p/'js/bootstrap-v8134.js').read_text().replace('8.0.134','8.0.135').replace('8134','8135')
(p/'js/bootstrap-v8135.js').write_text(boot)
update=(p/'js/update-wire-v8134.js').read_text().replace('8.0.134','8.0.135')
(p/'js/update-wire-v8135.js').write_text(update)
sw=(p/'otg-service-worker-v8134.js').read_text().replace("'otg-v8.0.134-version-pinned'","'otg-v8.0.135-version-pinned'")
# New assets first so a new worker cannot install without main's version-tagged files.
new="'./index-v8135.html','./style-v8135.css?v=8135','./js/otg-after-race-highlights-v8135.js?v=8135','./js/bootstrap-v8135.js?v=8135','./js/update-wire-v8135.js?v=8135',"
sw=sw.replace("const ASSETS=[",f"const ASSETS=[{new}")
sw=sw.replace("const critical=[",f"const critical=[{new}")
sw=sw.replace("caches.match('./index-v8134.html')","caches.match('./index-v8135.html')")
(p/'otg-service-worker-v8135.js').write_text(sw)
message='OTG! v8.0.135 QA — compact factual race highlights inside existing result and record screens; no new screens, data entry, or changes to results.'
for f in ['update-manifest.json','version.json']:
    (p/f).write_text(json.dumps({'version':'8.0.135','worker':'./otg-service-worker-v8135.js','message':message},indent=2)+'\n')
notes='''# OTG! v8.0.135 — After-Race Highlights (QA)

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
'''
(p/'RELEASE-NOTES-v8135.md').write_text(notes)
(p/'CHANGELOG.md').write_text((p/'CHANGELOG.md').read_text()+'\n## v8.0.135 — After-Race Highlights (QA)\n- Factual read-only highlights embedded in existing post-result screens. No new result screen, new save fields, XP, or tournament change. See RELEASE-NOTES-v8135.md.\n')
(p/'VERSION_HISTORY.md').write_text((p/'VERSION_HISTORY.md').read_text()+'\n## v8.0.135\n- After-race highlights on existing result/record pages. Phone QA pending.\n')
(p/'POWER-SHELL-GIT-v8135.txt').write_text('git add -A\ngit commit -m "OTG! v8.0.135 - After-Race Highlights"\ngit push\n')
print('build prepared', len(index), len(sw))
