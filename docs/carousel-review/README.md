# Capability carousel review

The `#resultados` carousel shows 12 conversational workflows and four existing lifestyle photographs. Spanish, English, Brazilian Portuguese and Simplified Chinese retain complete datasets with matching stable IDs. The first four workflows lead the sequence.

## Final presentation

Desktop keeps two staggered rows with 280px-wide overview cards, typically 232–251px tall in Spanish. Requests and answers remain fully visible. Each native disclosure uses the existing preview label and opens the complete preview and supporting description. One example can be open at a time. Autoplay pauses while an example is open, as well as during hover, focus, dragging, touch and offscreen states. Duplicate loop content is hidden from assistive technology and inert.

Mobile uses one horizontal row, with no staggered translation. The original copy in all four locales is unchanged by this layout refinement. The four lifestyle photographs remain in the loop at positions 5, 8, 11 and 14, now 232px tall. Product previews, figures, approval states, cost assumptions and estimates remain available in the expanded examples.

`UseCaseDemoCard`, `UseCaseResult`, `PhotoDemoCard` and `ShowcaseCards` remain the shared rendering structure. No runtime dependency, seller API or backend was added. Local product imagery sources are documented in `public/images/products/SOURCES.md`.

The carousel header now follows the page rhythm: 28px between heading and introduction and 40px before the cards on desktop; 24px and 32px on mobile. The containing functions group has no extra outer padding, preventing doubled section spacing. The rendered gap from the feature content to the carousel heading is 64px; from the carousel note to the next section heading it is 112px on desktop. Card dimensions and all copy are unchanged.

## Validation

- Production build and TypeScript checks passed.
- ESLint: no errors; existing `BrandLogo.tsx` image warning.
- Carousel/content and localization tests: all 5 passed. `git diff --check` passed.
- Five widths checked: 1440, 1024, 768, 390 and 360px. No page or card overflow. Desktop has two rows; mobile has one.
- The current desktop screenshot is 1440 × 1000 and includes both rows, heading, controls and illustrative-results note. At 390 × 844, the heading, overview card, controls and note fit together.
- All four locales checked at 360px. Expanded listing, diagnosis, price comparison, advertising and account previews had no overflow. Only one disclosure remained open.
- Click expands a preview; Enter collapses it. Expanded content includes the original preview and supporting description. Clone disclosures are inert.
- Next arrow moved to quarter two; first dot returned to the start. Dragging moved the carousel 165px. Temporary viewport overrides were restored.
- Earlier interaction verification also covered horizontal and vertical touch, reduced motion and loop wrapping with browser emulation; physical-device testing was not performed.
- Full test suite previously recorded 6 passes and 2 existing failures, both reproduced on baseline `610e0f4`: old assertions expect an inline logo instead of `BrandLogo` and the former icon path. Unrelated branding/tests remain unchanged.

## Scope

Layout refinements affect the shared carousel component, `#resultados` styles and the functions-group wrapper padding. No message file changed in the compact-layout commit. The broader PR contains the approved carousel datasets and copy work. Hero, navigation, other sections, pricing and its fonts, routing, metadata and integrations retain the saved styling baseline.

## Screenshots

- [Before desktop](before-desktop.png)
- [Before mobile](before-mobile.png)
- [Compact desktop overview](after-desktop.png)
- [Expanded desktop example](after-desktop-results.png)
- [Single-row mobile overview](after-mobile.png)
- [Expanded mobile example](after-mobile-results.png)
