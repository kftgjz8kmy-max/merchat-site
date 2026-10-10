# Capability carousel review

The `#resultados` carousel shows 40 conversational workflows for beginners and experienced sellers and four existing lifestyle photographs. Spanish, English, Brazilian Portuguese and Simplified Chinese retain complete datasets with matching stable IDs. The first four workflows lead the sequence. Seller-focused examples lead with photos, Excel publication preparation, specifications and multi-SKU updates. Reports are interleaved throughout the collection. The introduction highlights 91 actions, using the corrected count in the user-supplied October 10, 2026 capabilities overview. This is document-based, not a live catalog audit.

## Final presentation

Desktop keeps two staggered rows with 280px-wide overview cards, 232–273px tall in Spanish. Requests and answers remain fully visible. Each native disclosure uses the existing preview label and opens the complete preview and supporting description. One example can be open at a time. Autoplay pauses while an example is open, as well as during hover, focus, dragging, touch and offscreen states. Duplicate loop content is hidden from assistive technology and inert.

Mobile uses one horizontal row, with no staggered translation. The original requests and answers are preserved; the introduction and capability availability notes were updated in all four locales. The four lifestyle photographs remain in the loop at positions 5, 16, 27 and 38, now 232px tall. Product previews, figures, approval states, cost assumptions and estimates remain available in the expanded examples.

`UseCaseDemoCard`, `UseCaseResult`, `PhotoDemoCard` and `ShowcaseCards` remain the shared rendering structure. No runtime dependency, seller API or backend was added. Local product imagery sources are documented in `public/images/products/SOURCES.md`.

The carousel header now follows the page rhythm: 28px between heading and introduction and 40px before the cards on desktop; 24px and 32px on mobile. The containing functions group has no extra outer padding, preventing doubled section spacing. The rendered gap from the feature content to the carousel heading is 64px; from the carousel note to the next section heading it is 112px on desktop. The compact card styling is retained.

## Validation

- Production build and TypeScript checks passed.
- ESLint: no errors; existing `BrandLogo.tsx` image warning.
- Carousel/content and localization tests: all 6 passed. `git diff --check` passed.
- Five widths checked: 1440, 1024, 768, 390 and 360px. No page or card overflow. Desktop has two rows; mobile has one.
- The current desktop screenshot is 1440 × 1000 and includes both rows, heading, controls and illustrative-results note. At 390 × 844, the heading, overview card, controls and note fit together.
- Spanish was checked at 390px; the other three locales were checked at 360px in this update. New revision and fee previews opened without overflow and keyboard disclosure toggling passed. Earlier all-four-locale checks at 360px remain recorded.
- Previously, all four locales checked at 360px. Expanded listing, diagnosis, price comparison, advertising and account previews had no overflow. Only one disclosure remained open.
- Click expands a preview; Enter collapses it. Expanded content includes the original preview and supporting description. Clone disclosures are inert.
- Arrows now advance by visible column blocks, accounting for the staggered lower row; four dots still jump to quarter positions. The previous 32-example set was reachable with the next arrow at 1440, 768 and 390px. First dot returned to the start. Dragging moved the carousel 165px. Temporary viewport overrides were restored.
- Earlier interaction verification also covered horizontal and vertical touch, reduced motion and loop wrapping with browser emulation; physical-device testing was not performed.
- Full test suite previously recorded 6 passes and 2 existing failures, both reproduced on baseline `610e0f4`: old assertions expect an inline logo instead of `BrandLogo` and the former icon path. Unrelated branding/tests remain unchanged.

## Scope

Layout refinements affect the shared carousel component, `#resultados` styles and the functions-group wrapper padding. The current update replaces technical terminology with seller outcomes and adds Excel publication preparation plus seven reports, in every message file. The broader PR contains the approved carousel datasets and copy work. Hero, navigation, other sections, pricing and its fonts, routing, metadata and integrations retain the saved styling baseline.

## Screenshots

- [Before desktop](before-desktop.png)
- [Before mobile](before-mobile.png)
- [Compact desktop overview](after-desktop.png)
- [Advanced desktop overview](power-users-desktop.png)
- [Expanded desktop example](after-desktop-results.png)
- [Single-row mobile overview](after-mobile.png)
- [Expanded mobile example](after-mobile-results.png)

## Seller-language update

The current 40-example build passed TypeScript, production build, lint (existing BrandLogo warning only), and all six content/localization tests. Desktop at 1440px and mobile at 390px show the new 91-action introduction and seller-focused leading examples without page overflow. Excel and specification disclosures show missing data and review requirements; keyboard collapse works. Screenshot files were refreshed for this update.

## Approved copy clarification

Applied the exact seller-language revisions approved in chat across all four locales, including expanded labels and explanations. Kept 40 examples, 91 actions, approval boundaries and the compact design. Lint and TypeScript passed; all six content/localization tests passed. The running development preview at port 3000 was checked at 1440px and 390px: no page overflow; longest Spanish overview card was 273px; the expanded advertising explanation had no overflow. Current desktop/mobile overview screenshots are refreshed. The previous production build and expanded-example screenshots belong to the prior update.
