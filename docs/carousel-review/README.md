# Capability carousel review

Scope: `#resultados`. The carousel now contains 12 deterministic conversational workflow examples and four existing lifestyle photographs. All four locales replace the complete datasets in the same stable ID order. The first four workflows occupy the first two staggered columns.

`UseCaseDemoCard`, `UseCaseResult`, `PhotoDemoCard` and `ShowcaseCards` remain the rendering structure. Small shared `PreviewItems` and `ProductPhotos` primitives provide distinct previews without a visualization library. No seller APIs or runtime dependencies were added. New local product thumbnails are documented in `public/images/products/SOURCES.md`.

Carousel changes keep dragging, swiping, arrows, four dots and reduced motion. Loop width now measures the distance between duplicated sets, including their gap. Autoplay pauses outside the viewport and during hover, keyboard focus and touch/drag; resume timers respect active interactions. The duplicate set remains `aria-hidden` and contains no interactive controls.

## Final visual refinements

Cards use content-driven heights, tighter preview spacing and outcomes directly beneath their previews. The four lifestyle photos occupy positions 5, 8, 11 and 14, alternating between rows and aligning to each row start. Photos remain shorter visual pauses. Diagnosis previews distinguish the three conditions; the advertising bar reflects the supplied ACOS value rather than arbitrary decorative columns. Final responsive checks passed at all five widths and all four locales at 360px.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: zero errors; existing `BrandLogo.tsx` image warning.
- `npm run build`: passed.
- `npm test`: 6 passed, 2 failed. Both failures are reproduced against baseline commit `610e0f4`: old tests expect the logo image directly in `LandingPage.tsx` rather than `BrandLogo`, and expect the old icon path rather than `merchat-chat-icon.png`. Neither production branding nor unrelated tests were changed in this PR.
- `node --test tests/carousel-content.test.mjs tests/localization.test.mjs`: all 5 passed. Checks cover stable IDs, exact dataset sizes, distinct previews/photos, approval gates, illustrative research, cost inputs, inventory uncertainty and separate seller accounts.
- `git diff --check`: passed.
- Spanish rendered at 1440, 1024, 768, 390 and 360px; no card clipping or page overflow. A narrow priority-preview overflow found at 360px was corrected.
- All four locale routes checked at 360px after the correction: 12 aligned capability IDs each, zero clipped cards and zero overflowing previews.
- Mouse drag verified in the integrated browser; arrows and dots move to the corresponding quarters and return to the first page. Focus keeps autoplay paused.
- Chrome 390px mobile emulation: horizontal touch moved the carousel from 0 to 287px; vertical touch changed page scroll while preserving the carousel position. No warning/error logs were observed.
- Chrome reduced-motion emulation: preference was true and carousel position remained unchanged during subsequent interactions. Normal autoplay resumed after clearing the preference. A final-quarter position of 2071.5px wrapped past a 2762px loop seam and was subsequently observed at 605px.
- Native accessibility snapshot announces the 16 unique cards, not the duplicate set. Decorative previews are non-interactive; meaningful main product and lifestyle images retain alt text.
- Browser emulation settings were restored after testing. Touch checks use browser emulation, not physical-device testing.

## Regression scope

Compared with the saved styling baseline, all message content outside `useCases`, `photoExamples`, `showcaseTitle`, `showcaseIntro` and `showcaseDisclaimer` is unchanged. New CSS is scoped to `#resultados`. Hero/animation, navigation, feature overview, onboarding, pricing/fonts, trust, FAQ, footer, trial/WhatsApp links, routing, metadata and integrations are unchanged.

## Screenshots

- [Before desktop](before-desktop.png)
- [Before mobile](before-mobile.png)
- [After desktop](after-desktop.png)
- [After desktop outcomes](after-desktop-results.png)
- [After mobile](after-mobile.png)
- [After mobile outcomes](after-mobile-results.png)
