# OTG! LAB v0.8: optional catalogue → new real Space

Validates a SHA-256-verified online complete FH5 catalogue and its immutable 902 car/145 route identities, then creates ONE fresh real FH5 Space using existing racing application `rhSpaceTemplate`/`rhSave`, after all-Space verified Safety Backups. Corrects `fh5FindExistingSpace()` to respect the active FH5 Space for ownership toggles and render. New Space begins 0 owned, 0 races, original Space is retained.

## Not yet implemented
The FH5 master remains bundled in the installed application, and existing Spaces still see it. This is a controlled real-Space wiring test—not an actually catalogue-free public app. Catalogues for GT7/AC/ACC, payments/licences, packaging and additional game types are beyond this test.

The new Space cannot be created again while one LAB optional FH5 Space already exists; intentional guard against duplicate test fixtures.
