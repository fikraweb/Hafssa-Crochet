GATE: OPEN 51 (rounds used up)

# Frontend verification report

## Completed

- Complete upstream Taste Skill installation: 1,631 files, each SHA-256 verified; no vendor files edited. Source commit 6c0b5c78f5d31776e2210305abaa210cdc0030bf.
- Automatic frontend usage instructions are in the project AGENTS.md. The user approved the original upstream source after the initially supplied template URL returned 404.
- Existing static French copy, original image sources/alt text and link destinations preserved. Bare `#` links now target the explicit `#top` anchor, keeping the same return-to-top behavior.
- Editorial Fraunces/Figtree pairing, self-hosted with OFL licences, with the original Dancing Script brand/signature retained. Warm off-white/berry/mauve client colours; one type/spacing/radius system. See frontend-design-plan.md for source deals and client-priority exceptions.
- Source-identical Taste hero entrance/hover layer and the dealt picture-develops film moment on the existing story photograph. No new stock, rendered product, assumption, customer, testimonial, price or placeholder contact.
- `npm run build`: passed, 83 products; developer skill and AGENTS.md excluded from public dist.
- `npm test`: 5 passed, including unchanged photographs and catalogue/cart integrity.
- `npm run test:dashboard`: 6 passed against a fresh local Worker, covering authentication, orders/contact data, visitor journeys, settings and product import. No test customer data was sent to production.
- Headless functional regression passed at widths 320, 390, 768, 820, 1024 and 1440: 2/3/4-column catalogue; mobile/tablet drawer and desktop navigation; numbered pagination; category/page scrolling to first products; original full-frame detail photographs; quantity validation; cart photographs/counts/totals; required name/city/phone; WhatsApp message contents via intercepted window.open; social/admin destinations; local fonts; no page overflow and no JavaScript errors.

## Upstream visual checks and limitations

The skill gate was run honestly for all three rounds. Findings were reduced from 73 to 55 to 51, including fixes to readable text contrast, small touch areas, clamped description measurements, a narrow-screen header/footer overflow and visible keyboard focus. No waivers were added and no checker was edited or bypassed. The final gate is OPEN, not PASS.

The remaining findings are reproduced in full below. Many enforce the starter's specific scaffold: exact viewport-high sections, .wrap containers, a fixed navigation shell, single-screen photographic sections, no image captions, no real-format phone numbers, non-repeated photographs and different headline/copy conventions. This brief explicitly preserves the existing copy, original photographs, 12-product catalogue pages, scroll-away header, sticky category controls, floating cart and real contacts. Those requirements take priority; the page was not rewritten or stripped to pass a generic template test. Existing product badges overlay photographs by design; the floating cart and category bar remain as requested.

The standalone five-width layout checker stopped at its own `TypeError: r.sections is not iterable` on this adapted existing page, before completing all five sizes. It was not patched or reported as passed. Full six-width functional geometry checks were run separately. Upstream phone and desktop section screenshots were inspected visually, and intermediate checks' contrast and layout findings informed the fixes.

Performance checking used the skill's static local server. It reported 10 FAIL and 4 WARN, mostly from inherited multi-megabyte original PNG photographs/logo, image dimensions above rendered size, and `/api/store` returning 404 in the static harness. The real local Worker API and checkout passed the integration/browser tests. CPU-local rendering showed 0 ms blocking time, no long tasks and negligible layout shift; these measurements are not a mobile-network speed claim. Three font families (the retained logo script plus the new display/body pairing) and 231 KiB across four font files were reported as WARNs. Images were retained rather than recompressed or redrawn in a typography/layout change.

The source copy-lint output is attached below; existing client wording was kept because the user requested unchanged content. No unsupported marketing claim was added.

## Full final gate findings

```text
gate: checking index.html (product); this takes a few minutes on a CPU Chrome
gate: rounds used up; 51 FAIL open
  FAIL flush            section#contact > img.contact-backdrop "img: Composition inspirée des créations "  [1440]
       its first line sits 0px under the top edge of section#contact, where the ground changes
       fix: give the section its padding at the edge where the ground changes (the closing call keeps a clear gap above the footer)
  FAIL nav              header.header > a.brand "Hafssa Crochet FAIT MAIN AVEC AMOUR"  [1440, 390]
       nav link wraps to a second line
       fix: make the nav one bar from the content's left edge to its right edge, with every link and action inside it
  FAIL overlap-text     div#products > article.product.card:nth-of-type(1) > div.product-media > img "img: Duo de   [1440, 390]
       lies over the text "FAIT MAIN" (div.product-media > span.product-badge) (and 11 more like it: "img: Doudou Jaune", "img: Lapin Fushia", "img: Petit Ours", "img: Poupée Béret", ...)
       fix: move the box off the text (or the text off the box)
  FAIL scroll-reveal    section#collection "LA COLLECTION · PIÈCES FAITES MAIN Chois"  [1440, 390]
       starts "card-in" (0.5 s) the moment it is scrolled into view (an IntersectionObserver) on article.product.card:nth-of-type(1)
       fix: show it at rest: no fade, rise or unmask when it is scrolled into view
  FAIL no-visual        main > section.details.section "Maille après maille."  [1440, 390]
       no picture, effect or mock in this section; a feature section needs a visual
       fix: give the section a visual: a UI fragment on a ground, real icons, or a photograph that fits
  FAIL card-layout      div#products "FAIT MAIN POUPÉES Duo de Poupées Un ador"  [1440, 390]
       12 of 12 cards drawn one way (one panel, ground, placement and fragment): copies of one card
       fix: a card layout at most twice on a page: build the other sections another way
  FAIL button-styles    (one screen)  [1440]
       4 button styles on one screen: pill, fill #90466d, outline #90466d ("Explorer les créations"); pill, fill gradient ("Les créations"); pill, fill #f3e7ed, outline #e1cbd5 ("Une envie sur mesure ?"); pill, fill gradient, o
       fix: one primary and one secondary button: one shape, one height per size, one label size
  FAIL button-styles    (the page)  [1440, 390]
       6 button styles on the page: pill, fill gradient x2 ("Les créations"); pill, fill #f3e7ed, outline #e1cbd5 x1 ("Une envie sur mesure ?"); pill, fill gradient, outline #d9bdcb x1 ("Panier 0"); pill, fill #90466d, outline 
       fix: one primary and one secondary button: one shape, one height per size, one label size
  FAIL copy-headline    h1#hero-title "Un petit monde au bout du fil."  [1440]
       "Un petit monde au bout du fil." does not name what is sold (creations au crochet faites main, creations, crochet, faites, from flags)
       fix: put the category noun in the h1 (and who it is for, or where), in 2 to 8 words
  FAIL copy-headings    h2#atelier-offer-title "Entrez dans notre petit atelier."  [1440]
       "Entrez dans notre petit atelier." names no product, part, place or section (7 headings like it; at most one brand line per page) (and 6 more like it: "Choisissez votre petit c", "Du temps. Des gestes. De", "Maille après
       fix: name the thing in every heading: the product, a part, the place or a section noun
  FAIL heading-scale    section#contact > div.contact-content.reveal > h2 "Et si on créait un peu de douceur ?"  [1440, 390]
       an h2 at 82.8px, as large as the h1 (79.2px) or larger
       fix: size headings by level: the h1 largest, one size per level, each level below the one above
  FAIL contrast         div.atelier-poster > div.atelier-poster-scene > div.atelier-poster-caption > span "LA SÉLE  [1440, 390]
       body text over a effect reads at 3.7:1 at its worst tenth (needs 4.5:1)
       fix: put the text on a calm part of the picture, or on a solid panel
  FAIL section-gaps     main > section.hero / main > div.marquee  [1440, 390]
       17px between these sections, -73% against the median 62px
       fix: use one gap between sections (all within 25% of each other)
  FAIL photo-repeat     section#contact > img.contact-backdrop "contact-atelier-rose.png"  [1440, 390]
       the photograph contact-atelier-rose.png is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL photo-repeat     div.story.section > div.story-visual.reveal > div.story-inset > img "petit-ours.jpeg"  [1440]
       the photograph petit-ours.jpeg is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL photo-repeat     div.story.section > div.story-visual.reveal > div.story-photo.mo-pd > img "poupee-beret.jp  [1440, 390]
       the photograph poupee-beret.jpeg is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL visual-caption   section#histoire > div.story.section > div.story-visual.reveal > span.photo-caption "LE GO  [1440, 390]
       a line marked as a caption sits 16px under the picture poupee-beret.jpeg (its class names it one): "LE GOÛT DES PETITS DÉTAILS."; no caption or description under any image, render or visual (house rule)
       fix: take the line away: no caption or description under, over or on any image, render or visual; a licence credit goes in one footer line
  FAIL phone-number     section#contact > div.contact-content.reveal > span.contact-number "06 84 20 76 43"  [1440]
       a phone number with its area code: "06 84 20 76 43"; a visitor can dial it and reach a stranger
       fix: drop the number and its tel: link (a "Request a call" form may stand in), unless the brief gives the number
  FAIL phone-number     a#contact-whatsapp "https://wa.me/212684207643?text=Bonjour%"  [1440]
       a WhatsApp link calls a number in a real dialable format: "https://wa.me/212684207643?text=Bonjour%"; a visitor can dial it and reach a stranger (and 1 more like it: a#collection-contact)
       fix: drop the number and its tel: link (a "Request a call" form may stand in), unless the brief gives the number
  FAIL focus-visible    section.atelier-offer.section:nth-of-type(2) > div.atelier-poster > div.atelier-poster-cop  [1440]
       Tab stop 10, a "Découvrir la collection": the focus lands on something you cannot see
       fix: keep the kit's ring (system.css :focus-visible, 2px in --action, there at once); a control that hides itself shows on focus
  FAIL hero-screen      main > section.hero "OBJETS DE TENDRESSE · FAIT MAIN AU MAROC"  [1440]
       the hero ends at 902px on a 900px screen, 2px below the fold: it ends at the fold, 1px either way (SR-1)
       fix: make the hero exactly one screen (height: 100svh, its content fitted inside), never taller or shorter
  FAIL section-height   section#collection "LA COLLECTION · PIÈCES FAITES MAIN Chois"  [1440]
       the section is 2807px tall (3.1 screens), 1007px over two screens (1800px): every section after the hero is one screen or two, 2px either way (SR-2)
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the section is 59px tall (0.1 screens), 841px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   footer "Hafssa CrochetFAIT MAIN AVEC AMOURDes fi"  [1440]
       the section is 343px tall (0.4 screens), 557px short of one screen (900px): every section after the hero is one screen or two, 2px either way (and 4 more like it: "01 / LE FAIT MAIN Maille", "CHAQUE BELLE HISTOIRE CO", "
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   section#contact "CHAQUE BELLE HISTOIRE COMMENCE PAR UN BO"  [1440]
       the section starts at 5682px, 282px below the screen grid (6 x 900px): sections start on whole screens (SR-2)
       fix: make every section above it exactly one or two screens tall, so this one starts on a whole screen
  FAIL section-height   main > section.hero "OBJETS DE TENDRESSE · FAIT MAIN AU MAROC"  [1440]
       the section starts at 122px, 122px below the screen grid (0 x 900px): sections start on whole screens (SR-2)
       fix: make every section above it exactly one or two screens tall, so this one starts on a whole screen
  FAIL section-air      main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the content fills 22% of the section's height (13 of 59px): 55% or more (40% WARN) (SR-3)
       fix: fill the section to 55%: more content, a picture or a background layer, or merge it into the section above as its last block
  FAIL section-air      section#collection > div.collection-foot "Chaque création est réalisée à la main.B"  [1440]
       a top border across 100% of the container, between the section's content: sections and their parts are told apart by air and ground, not lines (SR-3)
       fix: take the rule out: sections and their parts are parted by their ground and the air between them
  FAIL one-section      main > section.details.section "01 / LE FAIT MAIN Maille après maille. D"  [1440]
       the screen at scroll 5400px (stride 6) shows 282px of section 6 and the content of 2 sections, over 24px each beside section 7: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
       fix: make each section exactly one screen or two, so a screen shows one section and no neighbour peeks
  FAIL one-section      footer "Hafssa CrochetFAIT MAIN AVEC AMOURDes fi"  [1440]
       the screen at scroll 5682px (the top of section 7) shows 280px of section 8 and the content of 2 sections, over 24px each beside section 7: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
       fix: make each section exactly one screen or two, so a screen shows one section and no neighbour peeks
  FAIL one-section      section#collection "LA COLLECTION · PIÈCES FAITES MAIN Chois"  [1440]
       the screen at scroll 961px (the top of section 3) shows 138px of section 4 and the content of 2 sections, over 24px each beside section 3: a screen shows one section (another may peek 8px, 24px WARN) (and 5 more like it:
       fix: make each section exactly one screen or two, so a screen shows one section and no neighbour peeks
  FAIL one-section      main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       a <div> sits directly in <main>: every part of <main> is a <section> (SR-4)
       fix: put every block of <main> in a <section>, and give a band its own section instead of a ground inside one
  FAIL one-section      main > section.atelier-offer.section > div.atelier-poster "BIENVENUE CHEZ HAFSSA CROCHET E  [1440]
       a band: a box 89% of the section wide on a ground of its own that holds the heading or the intro: the section's own ground is the band (SR-4)
       fix: put every block of <main> in a <section>, and give a band its own section instead of a ground inside one
  FAIL container-edges  main > section.hero "OBJETS DE TENDRESSE · FAIT MAIN AU MAROC"  [1440]
       the content of section 1 runs 80px from the left and 0px from the right (read from its outermost blocks: no .wrap): 80 and 0px are not one margin (one container, equal margins, 2px either way) (SR-6)
       fix: use one container on every section and the nav (.wrap): one margin left and right, 64-120px on a desktop, 16-24px on a phone
  FAIL container-edges  main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the content of section 2 runs 0px from the left and 0px from the right (read from its outermost blocks: no .wrap): the page's container starts at 80px; the margin is 64-120px at 1440px (one container, equal margins, 2px 
       fix: use one container on every section and the nav (.wrap): one margin left and right, 64-120px on a desktop, 16-24px on a phone
  FAIL container-edges  a.skip-link "Aller à la collection"  [1440]
       a <a> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (SR-6)
       fix: build the page as header.nav, a main of sections (each one in-flow .wrap plus background layers) and footer.closing
  FAIL container-edges  div.announcement "CRÉÉ À LA MAIN. GARDÉ PRÈS DU CŒUR.Insta"  [1440]
       a <div> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (and 17 more like it: "Hafssa CrochetFAIT MAIN ", "Hafssa CrochetFAIT MAIN ", "0") (SR-6)
       fix: build the page as header.nav, a main of sections (each one in-flow .wrap plus background layers) and footer.closing
  FAIL container-edges  main > section.hero > div.hero-halo  [1440]
       a box runs 0-1440px, outside the container lines of section 1 at 80-1440px: full width is for background layers and grounds only (SR-6)
       fix: keep it inside the container lines (.wrap): full width is for background layers and grounds only
  FAIL container-edges  section#collection > div.collection-stars  [1440]
       a box runs 0-1440px, outside the container lines of section 4 at 80-1360px: full width is for background layers and grounds only (and 5 more like it: "LE GOÛT DES PETITS DÉTAI", section#collection > div.collection-stars 
       fix: keep it inside the container lines (.wrap): full width is for background layers and grounds only
  FAIL container-edges  section#histoire > div.story.section > div.story-copy.reveal > span.eyebrow "02 — DERRIÈRE  [1440]
       4 text blocks start on a left line at x 760, 680px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (also "Du temps.Des gestes.De la tendre", "Bienvenue dans mon peti
       fix: start the text on the container's left, or on the one split line every split shares
  FAIL container-edges  div#hero-scene > picture > img "Mise en scène inspirée des créations Haf"  [1440]
       a <img> over half the container wide runs 562-1440px, not on the container's lines at 80-1440px (and 4 more like it: "Composition inspirée des", main > section.hero > div.hero-halo, section#collection > div.collection-st
       fix: run the picture or box from the container's left line to its right line, or put it in a row or a split
  FAIL row-lines        main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       a clipped carousel: 2 items cut at rest (SR-7)
       fix: show every item inside the container, or stack them: no sideways scroller, no half-cut carousel
  FAIL split-pair       main > section.atelier-offer.section > div.atelier-poster "BIENVENUE CHEZ HAFSSA CROCHET E  [1440]
       the two columns of the split start 62px apart at the top (centred on each other): a split's columns are top-aligned, 8px either way (SR-8)
       fix: top-align both columns of the split (align-items: start)
  FAIL split-pair       section#histoire > div.story.section "LE GOÛT DES PETITS DÉTAILS. 02 — DERRIÈR"  [1440]
       the split's left column starts with a picture or a box, not text: text left, the visual right, on every split (SR-8)
       fix: put the text in the left column and the visual in the right, on every split
  FAIL nav-covers       button#floating-cart "0"  [390]
       sits on top of the text "Fait main avec amour ✿" while the page scrolls: part of the line shows beside it
       fix: make the fixed nav one opaque band across the whole screen, or let it scroll away with the page
  FAIL nav-covers       section#collection > div.catalogue-tools "Tout Poupées Doudous Lapins Coffrets Ani"  [390]
       sits on top of the text "Besoin d’un conseil ? Parlons-en" while the page scrolls: part of the line shows beside it
       fix: make the fixed nav one opaque band across the whole screen, or let it scroll away with the page
  FAIL marquee          main > div.marquee > div.marquee-track "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [390]
       a running line of text, cut mid-word at both edges of the screen in every still
       fix: drop the running line, or set it as full words that fit the screen
  FAIL off-grid         main > section.details.section > div.detail.reveal:nth-of-type(2) > span.detail-icon "♡"  [390]
       left edge at 25px, 5px off the page margin at 20px (33 elements, like p); 1 more in this section off the grid too (span.detail-icon at 25px)
       fix: move it onto the page margin, or the column edge its section uses
  FAIL section-gaps     main > section.details.section / section#contact  [390]
       120px between these sections, +155% against the median 47px
       fix: use one gap between sections (all within 25% of each other)
  FAIL hero-fill        main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [896]
       the next section shows on the first screen: it starts at 794px on a 800px screen (the hero ends at 794px) (also at 768)
       fix: let the hero fill the first screen alone (min-height: 100svh, less above it): nothing of the next section on load
  FAIL container        page  [1440, 390]
       no .wrap
       fix: put the content in one .wrap
  34 WARN (not blocking), first: assets (the page); flush section#collection > div.collection-star; scroll-reveal section#histoire > div.story.section > d; copy-headings div#products > article.product.card:nth-; copy-buttons nav#main-nav > a.magic-button.nav-magic:
Stop fixing: put these open FAILs and the waivers in your report, then finish.
GATE: OPEN 51 (rounds used up)

```

## Full performance findings

```text

perf index.html @ 1440px
  PASS  host CPU load (before/after)               0/1 %          
  FAIL  total transfer                             11813.3 KiB    html 7.4K  css 33.5K  js 33.4K  font 231.3K  img 9946.7K  other 1560.9K
  PASS  requests                                   38             26 by load
  FAIL  images bytes                               9946.7 KiB     16 files
  FAIL  largest image                              2487.3 KiB     assets/hero-atelier-mauve.png
  PASS  JS parsed                                  103.2 KiB      10 files, 33.4K gz
  PASS  CSS                                        33.5 KiB       4 files
  WARN  font families                              3              Dancing Script, Figtree, Fraunces
  PASS  font files                                 4              231.3K
  WARN  font bytes                                 231.3 KiB      
  PASS  images without width+height                0              
  PASS  below-fold images not lazy                 0              1 marked lazy in the page source, set eager by system.js once the page has loaded
  FAIL  oversized images (natural > 2.2x shown)    14             logo-transparent.png 1536px for 86; contact-atelier-rose.png 1536px for 697; duo-poupees.jpeg 1080px for 298
  PASS  WebGL live at load                         0              
  PASS  WebGL live at bottom                       0              
  PASS  WebGL peak live                            0              0 contexts made in all
  PASS  long tasks                                 0              runs 3, 0..0, max 0ms
  PASS  blocking time                              0 ms           runs 3, 0..0 ms; at load 0ms
  PASS  FCP (CPU, relative)                        124 ms         runs 3, 120..276
  PASS  LCP (CPU, relative)                        124 ms         runs 3, 120..276, img
  PASS  layout shift                               0.000          runs 3, 0.000..0.001; at load 0.000
  PASS  modules loaded, never mounted              0              
  FAIL  broken requests                            1              api/store
  PASS  page height                                7.4 screens    DOM 585 nodes

perf index.html @ 390px
  PASS  host CPU load (before/after)               0/1 %          
  FAIL  total transfer                             8351.5 KiB     html 7.4K  css 33.5K  js 33.4K  font 231.3K  img 8038.2K  other 7.6K
  PASS  requests                                   36             25 by load
  FAIL  images bytes                               8038.2 KiB     15 files
  FAIL  largest image                              2398.7 KiB     assets/contact-atelier-rose.png
  PASS  JS parsed                                  103.2 KiB      10 files, 33.4K gz
  PASS  CSS                                        33.5 KiB       4 files
  WARN  font families                              3              Dancing Script, Figtree, Fraunces
  PASS  font files                                 4              231.3K
  WARN  font bytes                                 231.3 KiB      
  PASS  images without width+height                0              
  PASS  below-fold images not lazy                 0              1 marked lazy in the page source, set eager by system.js once the page has loaded
  FAIL  oversized images (natural > 2.2x shown)    16             logo-transparent.png 1536px for 48; hero-mobile-rose.png 1024px for 390; contact-atelier-rose.png 1536px for 348
  PASS  WebGL live at load                         0              
  PASS  WebGL live at bottom                       0              
  PASS  WebGL peak live                            0              0 contexts made in all
  PASS  long tasks                                 0              runs 3, 0..0, max 0ms
  PASS  blocking time                              0 ms           runs 3, 0..0 ms; at load 0ms
  PASS  FCP (CPU, relative)                        120 ms         runs 3, 116..124
  PASS  LCP (CPU, relative)                        120 ms         runs 3, 116..124, img
  PASS  layout shift                               0.000          runs 3, 0.000..0.000; at load 0.000
  PASS  modules loaded, never mounted              0              
  FAIL  broken requests                            1              api/store
  PASS  page height                                10.6 screens   DOM 585 nodes

SUMMARY index.html: 10 FAIL, 4 WARN  -> FAIL

```

## Copy lint

```json
{
 "files": [
  {
   "words": 274,
   "headings": [
    "Du temps. Des gestes. De la tendresse.",
    "Maille après maille.",
    "Pour les jolis moments.",
    "Parlons de votre envie.",
    "Et si on créait un peu de douceur ?",
    "Votre panier",
    "Vos coordonnées"
   ],
   "findings": [
    {
     "sev": "WARN",
     "id": "copy-eyebrows",
     "count": 6,
     "msg": "6 eyebrow or kicker labels",
     "fix": "one or two a page; a heading that names the thing needs no label over it",
     "examples": [],
     "hits": []
    }
   ],
   "file": "index.html",
   "kind": "product"
  }
 ],
 "cross": {
  "heroes": [],
  "shared": []
 }
}

```
