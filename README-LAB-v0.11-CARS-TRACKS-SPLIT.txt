OTG! LAB v0.11 — SPLIT FH5 CARS-ONLY AND TRACKS-ONLY PACKS
24 October 2026 — EXPERIMENTAL LAB PATCH ONLY

TARGET: OTG-Laboratory / otg-lab. NEVER apply this ZIP to MAIN or rh-guide.

This is a deliberate SMALL, REVERSIBLE step toward optional per-game catalogues:
1. Removes the redundant 145-track payload from the new 902-car catalogue pack used for NORMAL startup.
2. Normal boot now verifies 902 cars-only (new SHA-256, distinct offline cache) and 145 routes-only (unchanged v0.10 SHA-256 and offline cache) as two truly separate files.
3. All 902 permanent car IDs, car names, order, classes, and other fields are identical to the accepted v0.10 car list.
4. Existing saved Spaces, ownership, races and records are NOT modified or migrated.
5. The SETTINGS > REAL SPACE CATALOGUE v0.8 experimental section now correctly says CREATED when your existing FH5 OPTIONAL LAB TEST is present; the pre-existing test wizard still uses its legacy 902/145 complete fixture if used again.

This is NOT yet the final fully modular public GUIDE. Other legacy FH5 presets, initial seed list, GT7/FH6 modules and the old v0.8 complete-pack demo are still present in LAB. We will address those carefully in later stages — without touching MAIN or deleting your historic personal Evil programme.

INSTALL:
- Verify v0.10 LAB is accepted and you have a current all-Spaces portable JSON backup stored on your phone. Do not import/restore/reset it.
- Extract this ZIP into VS Code's otg-lab working folder (preserve subfolders: js/, catalogue-packs/, tests/), replacing matching files.
- Double-check git remote -v belongs to OTG-Laboratory/otg-lab, not MAIN.
- git add -A
- git commit -m "OTG! LAB v0.11 - Split verified car and track packs"
- git push

FIRST PHONE TEST (WIFI ON): reopen LAB and verify amber v0.11 banner and successful startup; STOP and screenshot if SAFE STOP. The new car-only verified cache does not exist before the first update, so first v0.11 boot needs connectivity.
NEXT CHECKS (one per screenshot): ORIGINAL 3/902, OPTIONAL 2/902, Carlton record 02:34.567 and Aeródromo Sprint USED ONCE, Settings optional Space CREATED label, then offline restart and track information.

Static QA: code syntax; 902 car row parity; independent car and track digests; route pack unchanged; 137 module sequence; first boot and offline cached boot simulated; tampered/missing packs safe-stop without starting modules.
Full phone/browser QA PENDING. Browser local test blocked by test environment network policy. MAIN v8.0.143 untouched.

Rollback: restore previous accepted v0.10 source files to LAB only. Do not reset app storage and do not try to import the portable backup unless actually needed.
