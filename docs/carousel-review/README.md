# Capability carousel review

The shared carousel contains 42 conversational examples and six lifestyle photos in Spanish, English, Brazilian Portuguese and Simplified Chinese. It addresses beginners and experienced sellers with publication preparation, Excel, specifications, multiple SKUs, reports, connected countries and client-AI photo workflows. The introduction highlights 91 actions from the user-supplied capabilities overview, rather than a live catalog audit.

## Presentation

Desktop retains two staggered rows of compact cards; mobile retains one horizontal row. Existing questions and answers remain visible. Each result button opens a native modal dialog, separating the conversation from its detailed result on desktop. Mobile uses a bottom sheet with one column and a sticky close toolbar. Product photos, metrics and report contents use their corresponding result layouts. Previous/next controls navigate all 42 examples inside the dialog.

Escape, the close button and a backdrop click dismiss the dialog. Opening pauses autoplay and locks page scrolling; closing restores focus and preserves the carousel position. The duplicated loop remains hidden from assistive technology and inert. Reduced-motion preferences disable the entrance animation.

Two generated photos add experienced-seller contexts: scanning inventory among packed orders and reviewing sales/stock reports with products and a calculator. Six photos are distributed after example indexes 3, 10, 17, 24, 31 and 38. Asset prompts and provenance are recorded in `public/images/lifestyle/GENERATED.md`.

All user-approved example copy remains unchanged in this update. The MerChat photo-search guide helps the connected AI find photos; the client AI creates images and MerChat associates them with listing drafts. Approval requirements and country/account limitations remain explicit. Pricing and its typography remain unchanged.

## Current validation

- Production build, TypeScript and ESLint passed; the existing BrandLogo image warning remains.
- All six carousel/content and localization tests passed.
- All 42 dialogs navigated at 390 × 844 and 1440 × 1000 with no horizontal dialog overflow or missing content.
- Next/previous, Escape, backdrop dismissal, keyboard focus inside the dialog, focus restoration and preserved carousel position checked in the integrated browser.
- New inventory and analysis photographs inspected in the running carousel. Temporary viewport overrides reset.
- The development preview runs at `http://localhost:3000/#resultados` with webpack for integrated-browser compatibility. The production preview also verified the dialog; initial Turbopack preview did not respond to React controls in this browser.
- Earlier full-suite checks recorded two baseline logo/icon assertion failures at `610e0f4`; these unrelated assertions are unchanged.

## Screenshots

- [Desktop result dialog](dialog-desktop.png)
- [Mobile result sheet](dialog-mobile.png)
- [Inventory photo in the compact carousel](powerseller-inventory.png)
- [Sales/stock analysis photo](powerseller-analysis.png)

## Scope

Changes affect the shared carousel component, its styles, close-button translations, photo data/assets and carousel content test. No seller API, backend or runtime dependency was added. The broader PR retains its previously approved seller copy and 91-action introduction. Base: `codex/visual-work-20260902` at `610e0f4`. No merge performed.
