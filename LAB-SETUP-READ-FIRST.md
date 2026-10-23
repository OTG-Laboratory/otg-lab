# OTG! LAB v0.1 — permanent development fork

**Forked from PHONE-ACCEPTED Main v8.0.143 (23 October 2026).** This is **NOT** Main v8.0.144; Main stays frozen at **v8.0.143**.

## What changed
- Distinct install identity: app title, manifest app ID/name and prominent amber `OTG! LAB` banner. The cyan/dark OTG! racing UI is otherwise unchanged.
- A dedicated LAB service worker and cache prefix; the startup bootstrap and the LAB update manifest refer to the LAB worker, not the Main one.
- LAB offline worker caches `index.html` and the LAB banner, so reopening offline still says LAB.
- The rest of the copied file tree is byte-for-byte inherited from v8.0.143. No Garage, tournament, results, record, catalogue data or schemas have been migrated or reset.
- LAB begins with an **empty user dataset** only when opened on a **new, separate web origin**. Car/track seed reference lists are deliberately still included.

## ABSOLUTELY CRITICAL: run LAB on a different ORIGIN
A separate GitHub repository or URL path is **NOT** sufficient. Browser storage (localStorage, IndexedDB, Cache Storage) is shared across project paths on the same `username.github.io` host. That could mix the real Main and experimental Lab data, even though their service worker scopes differ.

**Safe example:** If Main is at `username.github.io/main`, host the Lab at its own `otg-lab-...pages.dev` or `otg-lab-...netlify.app` subdomain. Different site *hostname*, not just different directory or repository. A separate GitHub Pages custom domain or truly different `username.github.io` host also works.

**DO NOT:** upload this ZIP over the existing Main repository or install the LAB PWA at the Main URL. Do not use a second GitHub Pages project within the same `username.github.io` origin as Main.

## Deployment sequence (GitHub + separate hosting)
1. On your phone, **make another in-app Safety Backup and export the Portable Backup JSON** from Main. Keep that file somewhere safe outside the browser. **Do not clear storage or reset Main.**
2. Keep the v8.0.143 Main project and live URL untouched. Create a **new** private/source repository `otg-lab` in GitHub (do not rename or replace Main).
3. Unzip the complete LAB ZIP, and commit the extracted files to that new repository. If using GitHub Pages for Main, **DO NOT** turn GitHub Pages on for `otg-lab` under the same `username.github.io` origin.
4. Deploy the new repository as a static site to a host assigning a **different hostname**, such as Cloudflare Pages or Netlify. No build command is needed. Publish directory is the repository root.
5. Visit the distinct LAB URL in a normal phone browser first. You should see the unmistakable amber `OTG! LAB` badge and onboarding. Only add to Home Screen after verifying that it opens the LAB URL, not Main.
6. In LAB, create a disposable Driver/Space, open Garage, and make a harmless test result. Close LAB. Open Main at its normal original URL: your personal data, tournament progress and records must be unchanged.
7. If both stay separate, **LAB is ready for experiments**. Do not import your live portable backup until we've deliberately scheduled a *copy-based* migration test.

## Permanent development policy
- Main stays v8.0.143 unless a truly valuable LAB-tested feature is deliberately promoted.
- All catalogue identity audits, clean imports, renamed car/track tests, cross-version updates and data-breaking experiments happen in LAB first.
- Never overwrite Main's repository, never deploy LAB under Main's hostname, never reset Main to test LAB, never use live results as a sacrificial data set.
- Later: test an **imported copy** of a portable backup on LAB only, check existing history, garage ownership and renamed entry stability. Keep the real original backup unmodified.
- The eventual public Guide is a *different future branch* cloned from accepted Main and deliberately cleansed of personal data and Evil sponsorship.

## LAB QA checklist
- New LAB hostname is different from Main hostname (compare the full address before the first launch).
- Install shows `OTG! LAB` name; the amber LAB ribbon appears in online and offline modes.
- LAB opens to onboarding or the LAB's own disposable profile. No Main racing records or progress imported automatically.
- Main still opens normally at its old address and retains the 1,219-slot FH5 programme, saved data and Garage.
- LAB's Settings/backup/update controls and basic Garage/Stats/navigation still function.
- No claim of phone PASS until the user has run this checklist.
