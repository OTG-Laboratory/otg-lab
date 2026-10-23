# OTG! v8.0.133 — Closest Battles ↑ TOP hotfix (QA)

The footer **↑ TOP** control on the Closest Battles page could fail because it scrolled only the browser window while OTG! could be scrolling an internal Records container on mobile. The shared page-navigation handler now scrolls the nested view, its scrolling ancestors and the document, and aligns the start of the page into view. The change also applies to the same shared ↑ TOP control on other Records/Journey pages.

No layout changes, car-history changes, campaign/draw changes, Carlton changes, Hall of Fame/Records calculation changes, stored results or saved Spaces changes. All gameplay source files are preserved byte-for-byte from v8.0.132. Phone confirmation required.
