# OTG! LAB v0.7 — narrower phone buttons and clean-start optional catalogue proof

## Scope
- Correct narrow-phone overlap in the **DOWNLOAD & PREVIEW** LAB Settings row. Fixes are scoped to LAB catalogue settings controls only.
- Add a Settings link to a **standalone, isolated clean-start demo**. Its HTML intentionally loads NO OTG core scripts, FH5 built-in catalogue scripts or tracks. Default is zero installed cars and zero routes.
- An explicit user action checks the catalogue directory and a separate explicit action downloads, SHA-256 verifies, validates IDs, then saves the pack in demo-only IndexedDB `otg-lab-optional-catalogue-demo-v07`.
- Demo-only removal deletes one key in that database after confirmation. Does not clear browsing data or read/change OTG Space, Garage, racing records, backups or the MAIN origin.
- The demo is NOT a full-featured racing Space. Full public Guide conversion to catalogue-less binaries and pack ownership/entitlement is future work. No payments or new game packs.

## Guardrails
- Apply only to https://github.com/OTG-Laboratory/otg-lab , NOT MAIN or RH Guide.
- Keep existing FH5 LAB TEST and its 3 owned cars intact.
- A new demo is not an official new OTG Space. Do not mistake demo ownership for application ownership.
- Need phone QA; tests here are automated static/Node until user confirms.
