# OTG! v8.0.129 — Carlton Fix + Sponsored Penguin Mayhem (QA)

## INCLUDED: v8.0.128 draw-time eligibility fix
The latest complete v8.0.128 Garage-arrival logic is retained **byte for byte**. Newly owned eligible FH5 cars (gifts and wheelspin wins per the player's agreed rules) can join undrawn portions before the full draw is finished, without changing completed draws or racing results. The app does not independently know whether a car was bought or gifted. See `LIVE-DRAW-ELIGIBILITY-QA-v8128.md`.

## PRESENTATION ONLY (new v8.0.129 layer)
* The dashboard Evil Tournament tile becomes a **single tappable sponsor-logo image**. No counts, progress, chevron or subtitle; the original button and onclick survive.
* The Tournament landing hero displays the **approved hilarious Dave & Steve / horrified penguin workshop illustration** in an uncropped 3:2 artwork area, with its original pink and gold colours and no overlapping kicker.
* Sponsor plaque is forced to two controlled lines: `DAVE AND STEVES` / `LUBRICATION FLUIDS`.
* Both obsolete 1,212-slot *hero labels* now say **1,219**. Historic note about preserving the original 1,212 slots is intentionally untouched.
* Keep the optional After Dark / Original colour-theme toggle and the Hubbs Memorial Trophy intact.
* The friendly penguin company logo is used only in the Dashboard launcher; no inappropriate image appears elsewhere in OTG!.

## SAFETY / QA
* Based on the full 8.0.128 ZIP; the campaign data, 1,219 slot programme, Frozen / Late-eligible draws, all saved races, Swiss, Hubbs, medals, historic records and Garage files are unmodified.
* Changes do not write any additional localStorage keys or change a Space.
* Version-pinned 8.0.129 worker caches the new artwork, CSS, JS and latest 8.0.128 race engine.
* Static build tests passed; handset presentation and live Carlton draw still require user acceptance.
* Take a portable backup before updating; there is no reset or re-import.
