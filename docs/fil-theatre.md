# Le théâtre du fil

Product storefront. The user explicitly requested a new creative composition and scroll-linked animation after rejecting conventional layouts. This request takes precedence over Taste's default restriction on custom scroll motion for product shops. The logo palette, real catalogue photographs, all French commerce copy, prices, contacts, filters, sorting, numbered pages, cart, checkout, private admin and analytics remain unchanged.

## What changed

The split photograph hero is replaced with a full-width typographic stage: four separately rendered characters from the existing transparent marketing sprite, a drawn thread, a main collection action and a motion-preference control. This is flat layered artwork inspired by the brand, not a 3D model or documentary product photography. No new generated images were introduced. The catalogue keeps its original photos.

Scroll reveals the thread and gently shifts/rotates the characters. Original workshop artwork moves within its frame; section icons and order-step circles rotate with their section's progress. A narrow fixed thread indicates reading progress. Merchandise names, prices and purchasing controls remain readable and stationary. Icon/link hover feedback complements the scroll motion. Standard scrolling and keyboard navigation are preserved; no scroll hijacking or auto-advance.

The runtime uses one passive scroll listener, one scheduled animation frame per event batch and IntersectionObserver to track only nearby scenes. Geometry reads are batched before writes. No perpetual timer, WebGL, framework or animation dependency. Saved pause preferences and prefers-reduced-motion prevent scroll animation; every visual remains present with JavaScript disabled or IntersectionObserver unavailable. Existing user-motion preferences are reused rather than reset.

## Verification and limitations

Seven existing catalogue/sort/cart/assets tests passed; production build passed with 83 products. JS syntax, diff whitespace and upstream Taste integrity verified. Real desktop 1440 and phone 390 screenshots were reviewed and a heading alignment and sprite-edge artifact corrected. Additional final screenshots and local performance results are recorded below when completed.

The prior full Taste gate was ERROR with the standard Chrome launcher; its layout checker also has an internal `r.sections is not iterable` error. Neither the kit nor its checkers was modified or bypassed to obtain a PASS. Screenshot/performance tools run via a test-only temporary Chromium launcher outside the website, using a disposable profile; that launcher is not deployed. Full browser checkout/admin regressions are not claimed in this round; no business logic or admin files changed.

Copy lint: zero FAIL, one copy-eyebrows warning retained for existing French brand labels. The skill's generic ban on non-tech scroll movement is an explicit user-request exception, not a reason to discard the requested interaction. Only the hero uses illustrative characters; original catalogue imagery is preserved.

## Final responsive assets

The original 590 KiB character sheet is retained. Pure resize/WebP derivatives are 253 KiB at 1200x600 (desktop/tablet) and 104 KiB at 720x360 (phone). Both retain alpha; dimensions, byte counts and SHA-256 hashes are recorded in assets/hero-dolls-responsive.json. Media-specific preload links match the CSS requests. No product photographs were resized or replaced in this change.

Reviewed actual screenshots at 1440, 820, 390 and 320px; the 320px run uses reduced motion. Tablet heading breaks and mobile character aspect ratios were adjusted following review. The first performance run measured 2562.4 KiB desktop and 2258.5 KiB phone before the asset optimization, with zero CLS at both sizes. Its oversized-background check treats the four-column sprite as if the whole sheet were one character; this remains an audit finding, not a claim that its check passed. Static API failures are expected on the skill server, which has no Cloudflare Worker. A second run evaluates the optimized sheet.

Optimized performance result: 1635.2 KiB desktop and 1285.8 KiB phone total transfer; median blocking time 0ms and CLS .000 at both widths across three local runs. This is a local static-server measurement, not a field performance guarantee. Final audit summary remains 4 FAIL, 6 WARN: the four-column background sprite is flagged as oversized at each width, and `/api/store` is unavailable once per width on the static server. These findings are disclosed rather than hidden. All original source art and product imagery remain unchanged.

## Atelier wall background

Added the existing 196 KiB empty-atelier artwork behind the theatre with a readability wash, an arched window rendered in CSS and a wall frame using the original transparent brand logo. Window and frame positions are responsive and remain above the tabletop; characters and scroll interactions are unchanged. The framed logo uses responsive originals to avoid loading a large image into the small phone frame. Decorative layers are aria-hidden and ignore pointer events, so they cannot block controls. No new image generation, library or JavaScript was needed. Build and diff checks passed; desktop and phone screenshots were reviewed. The full prior Taste gate is still not a PASS; this visual adjustment does not resolve its existing audit findings.
