# Capability carousel review

The shared carousel contains 42 conversational examples and six lifestyle photos in Spanish, English, Brazilian Portuguese and Simplified Chinese. It addresses beginners and experienced sellers with publication preparation, Excel, specifications, multiple SKUs, reports, connected countries and client-AI photo workflows. The introduction highlights 91 actions from the user-supplied capabilities overview, rather than a live catalog audit.

## Presentation

Desktop retains two staggered rows of compact cards; mobile retains one horizontal row. Existing questions and answers remain visible. Each explicit “Ver ejemplo” button opens a native modal dialog, separating the conversation from its detailed result on desktop. Mobile uses a bottom sheet with one column, a separately scrolling content area and permanently visible close/navigation controls. All 42 results now contain concrete illustrative datasets in every locale: named products, prices, stock, before/after changes, fees, order states and report figures. Semantic tables replace generic lists of information categories. Relevant examples also include product photos. Each example explains the takeaway and retains its approval/availability status. Supporting explanations remain available under “Cómo lo hace”. Previous/next controls navigate all 42 examples inside the dialog.

Escape, the close button and a backdrop click dismiss the dialog. Opening pauses autoplay and locks page scrolling; closing restores focus and preserves the carousel position. The duplicated loop remains hidden from assistive technology and inert. Reduced-motion preferences disable the entrance animation.

Two generated photos add experienced-seller contexts: scanning inventory among packed orders and reviewing sales/stock reports with products and a calculator. Six photos are distributed after example indexes 3, 10, 17, 24, 31 and 38. Asset prompts and provenance are recorded in `public/images/lifestyle/GENERATED.md`.

User-approved questions and responses remain unchanged. The newly added sample products and amounts are explicitly illustrative, not live seller data. The MerChat photo-search guide helps the connected AI find photos; the client AI creates images and MerChat associates them with listing drafts. Approval requirements and country/account limitations remain explicit. Pricing and its typography remain unchanged.

## Visual refinement

The final polish aligns cards and photographs within each desktop row, keeps all 42 desktop text cards between 252 and 286 px high, and reduces competing blue surfaces. Titles use the existing navy, question bubbles are quieter, and each footer has a clear opening action with a circular arrow. The dialog title spans both columns; the result surface uses lighter borders, aligned numeric values and a warm takeaway highlight. Questions and responses are separated by 16 px, with 1.5 line-height for easier reading; compact responses align to the right. Existing fonts, approved copy and pricing remain unchanged.

Desktop overview and Excel detail visually confirmed at 1440 × 1000; the mobile Excel detail confirmed at 390 × 844 with visible fixed navigation and no horizontal overflow. The production build, lint and TypeScript pass after refinement.

## Current validation

- Production build, TypeScript and ESLint passed; the existing BrandLogo image warning remains.
- All six carousel/content and localization tests passed, including concrete result coverage, matching row/column shapes and nonempty sample data in all four locales.
- All 42 dialogs navigated at 390 × 844 and 1440 × 1000 without horizontal table/dialog overflow. Mobile navigation stays in the viewport and content resets to the top on every example change.
- Next/previous, Escape, backdrop dismissal, keyboard focus inside the dialog, focus restoration and preserved carousel position checked in the integrated browser.
- New inventory and analysis photographs inspected in the running carousel. Temporary viewport overrides reset.
- The development preview runs at `http://localhost:3000/#resultados` with webpack for integrated-browser compatibility. The production preview also verified the dialog; initial Turbopack preview did not respond to React controls in this browser.
- Earlier full-suite checks recorded two baseline logo/icon assertion failures at `610e0f4`; these unrelated assertions are unchanged.

## Screenshots

- [Polished compact overview](polished-overview.png)
- [Polished desktop detail](polished-detail.png)
- [Polished mobile detail](polished-mobile.png)

- [Concrete desktop result](concrete-desktop.png)
- [Explicit opening controls](explicit-cards.png)
- [Concrete mobile result with fixed controls](concrete-mobile.png)
- [Inventory photo in the compact carousel](powerseller-inventory.png)
- [Sales/stock analysis photo](powerseller-analysis.png)

## Scope

Changes affect the shared carousel component, its styles, opening/help translations, concrete localized example datasets and carousel content test. No seller API, backend or runtime dependency was added. The broader PR retains its previously approved seller copy and 91-action introduction. Base: `codex/visual-work-20260902` at `610e0f4`. No merge performed.

The Impeccable mechanical scan flagged the existing Arial fallback. It is retained because the user expressly asked to preserve the typography; this update changes scale and hierarchy within the result explorer only.
