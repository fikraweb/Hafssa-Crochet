# Interactive lifestyle hero

Recomposed the hero around the supplied reference: sunlit window and clear copy on the left, worktable with actual catalogue product cutouts below, and a crochet/armchair lifestyle scene on the right. Separate portrait artwork adapts the composition for phones. The room is AI-generated marketing artwork; figures come from existing alpha cutouts of original catalogue photographs. All original product photographs and source assets remain unchanged. Delivery assets and their provenance/hashes are in assets/hero-shopping-source.json.

Four featured products: Poupée Béret, Poupée Cerise à Pois, Lulu Bunny and Petit Ours. Their names and prices are read from the same live catalogue used by the grid/dialog/cart. Hidden or removed products do not appear. Admin-changed cover photos use the new photo rather than a stale hero cutout. No prices or products were invented for the new interaction.

Hover enlarges the selected figure, reduces its neighbors and reveals an animated name/price card beside it. Clicking opens that exact product's existing details. Keyboard focus exposes the same information; Enter opens details. On touch, first tap reveals the price, second tap opens details; tapping elsewhere clears the preview. Price cards do not cover the collection CTA and remain inside a 320px viewport. Reduced motion and the saved pause preference remove transitions. Existing scroll movement is retained on the outer layer, while hover scales its inner layer.

Validation:
- 7/7 existing tests passed; production build, JavaScript syntax, whitespace and 1,631-file Taste integrity checks passed.
- A local Playwright regression run with the real public settings and catalogue fixtures exercised all four live prices and enlargement, click-to-dialog/cart, keyboard activation, touch preview/second tap, an isolated live-price change and a hidden-product fixture, reduced-motion handling, no overflow at 320/820/1024, and all four price cards fitting at 320. API/event requests were intercepted locally; no production orders or customer records were created.
- Actual desktop 1440 and phone 390 screenshots reviewed. A price/CTA overlap and hero alignment issue were found and corrected, then the browser checks rerun successfully.
- Full Taste gate remains unpassed from the previous reported launcher/checker failures; this task does not claim a new full-gate PASS or a field performance score. Catalogue photos, checkout/API/auth/admin logic were preserved. No animation library added.
