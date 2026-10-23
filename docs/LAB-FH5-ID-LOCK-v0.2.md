# OTG! LAB v0.2 — FH5 immutable catalogue identifiers

**Scope: isolated LAB ONLY.** BASE: Main v8.0.143. No Main files/repositories or user backups were accessed or changed. No saved data, tracks, ownership, tournaments, or UI flows are reset by this update.

## Important correction to the original audit

In v8.0.143, the FH5 catalogue already assigns deterministic IDs at runtime in `js/catalogue-deterministic-v6110.js`, as `fh5-v1-0001` through `fh5-v1-0902`. Those IDs **were position-derived at catalogue initialization**. The legacy textual IDs were based on a slug of the name+year. This freeze preserves both existing formats; it does NOT create new IDs for the 902 cars.

## Implemented

- Explicit `catalogueId` and frozen `legacyId` now live on each of the 902 FH5 catalogue entries; their values exactly match the pre-existing runtime IDs/aliases.
- Reference audit registry: `data/fh5-catalogue-ids-frozen-v1.json` (902 immutable reference rows).
- Production-time FH5 catalogue validation refuses missing or duplicate ID before the deterministic ownership repair runs; GT7 identity logic stays unchanged.
- Legacy slug matching now refers to the frozen alias, so a future display-name correction won't orphan legacy ID references.
- The standard catalogue still forbids car edits and ad-hoc cars; custom-car management remains confined to manual Spaces. No new catalogue cars or tracks added in this release.

## Rules for future car-pack updates

1. **Never** regenerate existing IDs from order, sort, manufacturer, display name, or current list length. Never reassign or recycle one of the frozen IDs.
2. Add new catalogue records with explicit IDs in their own new namespace (for example `fh5-v2-0001`, with uniqueness verified). Add the new row(s) only after checking official game identity, aliases, variants, and pack license.
3. Altering a car's display label/category is a separate reviewed change; keep `catalogueId` and `legacyId` unchanged. Historical saved records and `space.catalogueOwned` use the identity.
4. Existing `fh5-v1-XXXX` IDs from other people's saves and historical references must remain valid. Never wipe `space.cars`, `catalogueOwned`, runs, custom events, or records when updating packs.
5. Validate future proposed packs against the frozen registry using the included test before changing GitHub.

## Test status

Static/integration checks run in container; **not a phone PASS** until Andy opens LAB after deployment and checks the three owned cars. His LAB Portable Backup JSON is kept on his device and was **not imported or modified** during this build.

## Phone acceptance fixture

In FH5 LAB TEST there should still be exactly three owned official cars: **1990 Vauxhall Lotus Carlton** (`fh5-v1-0867`), **1998 Nissan R390 (GT1)** (`fh5-v1-0679`), **2011 BMW X5 M Forza Edition** (`fh5-v1-0102`). The original Main should continue showing its own data normally.
