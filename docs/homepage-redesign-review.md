GATE: OPEN 56 (rounds used up)

# Homepage redesign verification

Product: Hafssa Crochet, original handmade crochet catalogue and WhatsApp ordering.

The client chose redesigning the existing homepage using the installed upstream Taste Skill. The latest instruction was to retain the hero restored through Cloudflare Retry, while also applying Taste Skill to it. We inspected the live restored hero: original desktop atelier and mobile portrait photographs, with a `style.css` byte-identical to the repository. The new homepage keeps that visual composition, French copy and images, adds the Taste entrance and improves type/spacing/action. It does not restore the later animated sprite hero.

## Changes

- Catalogue directly after the hero; complete atelier promotion retained after the collection.
- Refined warm-white product frames, compact original photos, berry category navigation and clearer purchase controls. Four/three/two columns remain.
- Contrasting berry atelier story with original arched photographs, coordinated details, inset photographic contact section and dark berry footer with all real account links.
- Self-hosted existing fonts and source-identical Taste motion/photo-development modules; no new dependencies, invented copy, stock photos or backend changes.
- The brief's rose/mauve colours, original text/contacts/photos, natural-height ecommerce sections, sticky filters, floating cart and scroll-away header take precedence over generic starter requirements.

## Completed checks

- `npm run build`: passed, 83 products.
- `npm test`: 5 passed, including source-image integrity and cart/WhatsApp data.
- All 1,631 Taste Skill files verified against pinned upstream hashes, unchanged and discoverable.
- Visible French word counts and anchor destination counts exactly match the previous repository homepage; only section order and presentation change.
- Functional browser regression at 320, 390, 768, 820, 1024 and 1440: responsive grid, mobile/tablet drawer, desktop navigation, pagination/category scrolling, full-frame detail images, quantities, cart photos/totals, required customer fields and intercepted WhatsApp content, social/admin links, local fonts, no horizontal overflow and zero JavaScript errors.
- Test orders and visitor events stayed on the local Worker. No WhatsApp message or production test order was sent.
- Desktop, phone and intermediate-width screenshots captured for review.

Backend tests were not repeated: backend, authentication, analytics, product data and checkout logic are unchanged. The local Worker regression verifies the purchasing flow with the redesigned frontend. Performance results from a CPU-local static harness are not real mobile-network measurements.


## Final audit results

One final gate audit, within the documented budget: OPEN 56, not PASS. No waivers and no vendor edits. Remaining findings include supplied poetic text/real contacts/captions, original repeated photographs, ecommerce-card structure, sticky filters/floating cart, non-fixed navigation, natural section heights and lack of exact starter containers. The standalone layout checker previously crashed on this adapted existing project and was not presented as passing; six-width functional geometry and five-width screenshots were used for responsive verification.

The static performance harness reported 10 FAIL and 5 WARN: inherited large PNGs/catalogue image weight and its `/api/store` 404 remain; the real local Worker API and checkout pass. The final narrow post-audit correction makes hero preload media match the restored picture breakpoint. A browser request check passed at 390/640/1440: only the appropriate mobile or desktop hero image loads. The audit/performance logs below precede that preload-only correction; they are not represented as a fresh PASS after it.

### Full gate output

```text
gate: checking index.html (product); this takes a few minutes on a CPU Chrome
gate: rounds used up; 56 FAIL open
  FAIL hero-fill        main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the next section shows on the first screen: it starts at 822px on a 900px screen (the hero ends at 822px)
       fix: let the hero fill the first screen alone (min-height: 100svh, less above it): nothing of the next section on load
  FAIL flush            section#contact > img.contact-backdrop "img: Composition inspirée des créations "  [1440, 390]
       its first line sits 0px under the top edge of section#contact, where the ground changes
       fix: give the section its padding at the edge where the ground changes (the closing call keeps a clear gap above the footer)
  FAIL nav              header.header > a.brand "Hafssa Crochet FAIT MAIN AVEC AMOUR"  [1440, 390]
       nav link wraps to a second line
       fix: make the nav one bar from the content's left edge to its right edge, with every link and action inside it
  FAIL overlap-text     div#products > article.product.card:nth-of-type(1) > div.product-media > img "img: Duo de   [1440, 390]
       lies over the text "FAIT MAIN" (div.product-media > span.product-badge) (and 11 more like it: "img: Doudou Jaune", "img: Lapin Fushia", "img: Petit Ours", "img: Poupée Béret", ...)
       fix: move the box off the text (or the text off the box)
  FAIL marquee          main > div.marquee > div.marquee-track "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440, 390]
       a running line of text, cut mid-word at both edges of the screen in every still
       fix: drop the running line, or set it as full words that fit the screen
  FAIL no-visual        main > section.details.section "Maille après maille."  [1440, 390]
       no picture, effect or mock in this section; a feature section needs a visual
       fix: give the section a visual: a UI fragment on a ground, real icons, or a photograph that fits
  FAIL card-layout      div#products "FAIT MAIN POUPÉES Duo de Poupées Un ador"  [1440, 390]
       12 of 12 cards drawn one way (one panel, ground, placement and fragment): copies of one card
       fix: a card layout at most twice on a page: build the other sections another way
  FAIL button-styles    (one screen)  [1440]
       4 button styles on one screen: square, fill gradient ("Les créations"); soft, fill #f5e7ed ("Une envie sur mesure ?"); pill, fill #f6e9ee, outline #dfbfce ("Panier 0"); pill, fill #90466d, outline #90466d ("Explorer les
       fix: one primary and one secondary button: one shape, one height per size, one label size
  FAIL button-styles    (the page)  [1440, 390]
       7 button styles on the page: square, fill gradient x2 ("Les créations"); soft, fill #f5e7ed x1 ("Une envie sur mesure ?"); pill, fill #f6e9ee, outline #dfbfce x1 ("Panier 0"); pill, fill #90466d, outline #90466d x1 ("Exp
       fix: one primary and one secondary button: one shape, one height per size, one label size
  FAIL button-styles    article.product.card:nth-of-type(1) > div.product-info > div.product-bottom > button.btn.b  [1440, 390]
       one button style (soft, fill #fffaf9, outline #d6a4bc) with labels in 2 sizes: 11, 17px ("Ajouter +", "2 vues")
       fix: one primary and one secondary button: one shape, one height per size, one label size
  FAIL copy-headline    h1#hero-title "Un petit monde au bout du fil."  [1440]
       "Un petit monde au bout du fil." does not name what is sold (creations au crochet, creations, crochet, from flags)
       fix: put the category noun in the h1 (and who it is for, or where), in 2 to 8 words
  FAIL copy-fact        h1#hero-title "Un petit monde au bout du fil."  [1440]
       the first screen holds no number, price, date, place, platform or genre
       fix: put one hard fact from the brief on the first screen: a number, a price, a date, the place, the platforms it runs on or a game's genre; take it from the brief or remove the claim
  FAIL copy-headings    section#collection > div.section-top.reveal > div > h2 "Choisissez votre petit coup de cœu  [1440]
       "Choisissez votre petit coup de cœur." names no product, part, place or section (7 headings like it; at most one brand line per page) (and 6 more like it: "Entrez dans notre petit ", "Du temps. Des gestes. De", "Maille a
       fix: name the thing in every heading: the product, a part, the place or a section noun
  FAIL contrast         div.atelier-poster > div.atelier-poster-scene > div.atelier-poster-caption > span "LA SÉLE  [1440, 390]
       body text over a effect reads at 3.8:1 at its worst tenth (needs 4.5:1)
       fix: put the text on a calm part of the picture, or on a solid panel
  FAIL text-contrast    main > section.hero > div.hero-copy > p "Des poupées qui ont une âme. Des compagn"  [1440]
       body text in #654c5c on #f4e9ee reads 6.47:1 (needs 7:1)
       fix: body text in the ink at 7:1 or more; grey (4.5:1 or more) only for captions and labels
  FAIL text-contrast    div#products > article.product.card:nth-of-type(1) > div.product-info > p.product-descript  [1440]
       body text in #77606e on #fffcfa reads 5.58:1 (needs 7:1); 7 like it, like "Un adorable lapin fush", "Lulu Bunny est un ador", "Un duo élégant : un pe"
       fix: body text in the ink at 7:1 or more; grey (4.5:1 or more) only for captions and labels
  FAIL text-contrast    section#histoire > div.story.section > div.story-copy.reveal > p:nth-of-type(1) "Bienvenue  [1440, 390]
       body text in #f1e0e8 on #76415d reads 6.17:1 (needs 7:1); 2 like it, like "J’aime le charme d’une"
       fix: body text in the ink at 7:1 or more; grey (4.5:1 or more) only for captions and labels
  FAIL section-gaps     main > section.hero / main > div.marquee  [1440, 390]
       18px between these sections, -86% against the median 128px
       fix: use one gap between sections (all within 25% of each other)
  FAIL section-gaps     main > div.marquee / section#collection  [1440, 390]
       25px between these sections, -82% against the median 141px of gaps at a change of ground
       fix: use one gap between sections (all within 25% of each other)
  FAIL photo-repeat     div.story.section > div.story-visual.reveal > div.story-inset > img "petit-ours.jpeg"  [1440]
       the photograph petit-ours.jpeg is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL photo-repeat     div.story.section > div.story-visual.reveal > div.story-photo.mo-pd > img "poupee-beret.jp  [1440]
       the photograph poupee-beret.jpeg is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL photo-repeat     section#contact > img.contact-backdrop "contact-atelier-rose.png"  [1440, 390]
       the photograph contact-atelier-rose.png is shown 2 times on the page: a picture the visitor has already seen
       fix: show each view of the product once: the hero side, the product section three-quarter, the use scene, the parts as close-ups or the exploded view, the order rear-quarter
  FAIL visual-caption   section#histoire > div.story.section > div.story-visual.reveal > span.photo-caption "LE GO  [1440, 390]
       a line marked as a caption sits 22px under the picture poupee-beret.jpeg (its class names it one): "LE GOÛT DES PETITS DÉTAILS."; no caption or description under any image, render or visual (house rule)
       fix: take the line away: no caption or description under, over or on any image, render or visual; a licence credit goes in one footer line
  FAIL phone-number     section#contact > div.contact-content.reveal > span.contact-number "06 84 20 76 43"  [1440]
       a phone number with its area code: "06 84 20 76 43"; a visitor can dial it and reach a stranger
       fix: drop the number and its tel: link (a "Request a call" form may stand in), unless the brief gives the number
  FAIL phone-number     a#contact-whatsapp "https://wa.me/212684207643?text=Bonjour%"  [1440]
       a WhatsApp link calls a number in a real dialable format: "https://wa.me/212684207643?text=Bonjour%"; a visitor can dial it and reach a stranger (and 1 more like it: a#collection-contact)
       fix: drop the number and its tel: link (a "Request a call" form may stand in), unless the brief gives the number
  FAIL section-tile     main > section.atelier-offer.section "Entrez dans notre petit atelier."  [1440]
       the section is 766px tall (0.85 screens at 1440x900), shorter than the screen: its tile (the screen from its top) shows 766px of it and 134px of the next section ("Du temps. Des gestes. De la te"), its picture on screen
       fix: set every section after the hero to one screen or two (height: calc(var(--h,1) * 100vh)) and fit its content above --padb
  FAIL focus-visible    div#filters > button.active:nth-of-type(1) "Tout"  [1440]
       Tab stop 9, button "Tout": the focus lands on something you cannot see
       fix: keep the kit's ring (system.css :focus-visible, 2px in --action, there at once); a control that hides itself shows on focus
  FAIL hero-screen      main > section.hero "OBJETS DE TENDRESSE · FAIT MAIN AU MAROC"  [1440]
       the hero ends at 822px on a 900px screen, 78px above the fold: it ends at the fold, 1px either way (SR-1)
       fix: make the hero exactly one screen (height: 100svh, its content fitted inside), never taller or shorter
  FAIL hero-screen      main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       78px of the next section shows on the first screen (from 822px on a 900px screen): nothing below the hero shows at load (SR-1)
       fix: end the hero at the fold so nothing of the next section shows at load (hero height: 100svh)
  FAIL section-height   main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the section is 61px tall (0.1 screens), 839px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   section#collection "LA COLLECTION · PIÈCES FAITES MAIN Chois"  [1440]
       the section is 2580px tall (2.9 screens), 780px over two screens (1800px): every section after the hero is one screen or two, 2px either way (SR-2)
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   main > section.details.section "01 / LE FAIT MAIN Maille après maille. D"  [1440]
       the section is 322px tall (0.4 screens), 578px short of one screen (900px): every section after the hero is one screen or two, 2px either way (and 4 more like it: "Hafssa CrochetFAIT MAIN ", "CHAQUE BELLE HISTOIRE CO", "
       fix: set the section to one screen or two (height: calc(var(--h,1) * 100vh), --h 1 or 2) and cut or split its content to fit
  FAIL section-height   footer "Hafssa CrochetFAIT MAIN AVEC AMOURDes fi"  [1440]
       the section starts at 5964px, 336px above the screen grid (7 x 900px): sections start on whole screens (SR-2)
       fix: make every section above it exactly one or two screens tall, so this one starts on a whole screen
  FAIL section-height   section#histoire "LE GOÛT DES PETITS DÉTAILS. 02 — DERRIÈR"  [1440]
       the section starts at 4229px, 271px above the screen grid (5 x 900px): sections start on whole screens (and 5 more like it: "BIENVENUE CHEZ HAFSSA CR", "OBJETS DE TENDRESSE · FA", "FAIT MAIN, AVEC AMOUR PE") (SR-2)
       fix: make every section above it exactly one or two screens tall, so this one starts on a whole screen
  FAIL section-height   section#contact "CHAQUE BELLE HISTOIRE COMMENCE PAR UN BO"  [1440]
       the section's content does not fit it: its lowest content ends 540px below its top, past 468px (the section less 72px of bottom padding) (SR-2)
       fix: fit the content above the section's bottom padding (--padb), or make it two screens (.g2) in two groups
  FAIL section-air      main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       the content fills 21.3% of the section's height (13 of 61px): 55% or more (40% WARN) (SR-3)
       fix: fill the section to 55%: more content, a picture or a background layer, or merge it into the section above as its last block
  FAIL section-air      section#collection > div.section-top.reveal "LA COLLECTION · PIÈCES FAITES MAIN Chois"  [1440]
       a bottom border across 100% of the container, between the section's content: sections and their parts are told apart by air and ground, not lines (SR-3)
       fix: take the rule out: sections and their parts are parted by their ground and the air between them
  FAIL section-air      section#collection > div.collection-foot "Chaque création est réalisée à la main.B"  [1440]
       a top border across 100% of the container, between the section's content: sections and their parts are told apart by air and ground, not lines (SR-3)
       fix: take the rule out: sections and their parts are parted by their ground and the air between them
  FAIL one-section      footer "Hafssa CrochetFAIT MAIN AVEC AMOURDes fi"  [1440]
       the screen at scroll 5400px (stride 6) shows 336px of section 8 and the content of 2 sections, over 24px each beside section 7: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
       fix: make each section exactly one screen or two, so a screen shows one section and no neighbour peeks
  FAIL one-section      main > section.details.section "01 / LE FAIT MAIN Maille après maille. D"  [1440]
       the screen at scroll 4500px (stride 5) shows 322px of section 6 and the content of 3 sections, over 24px each beside section 5: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)
       fix: make each section exactly one screen or two, so a screen shows one section and no neighbour peeks
  FAIL one-section      main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       a <div> sits directly in <main>: every part of <main> is a <section> (SR-4)
       fix: put every block of <main> in a <section>, and give a band its own section instead of a ground inside one
  FAIL one-section      section#collection > div.catalogue-tools "ToutPoupéesDoudousLapinsCoffretsAnimauxC"  [1440]
       a band: a box 89% of the section wide on a ground of its own that holds only text: the section's own ground is the band (SR-4)
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
       a <div> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (and 16 more like it: "Hafssa CrochetFAIT MAIN ", "Hafssa CrochetFAIT MAIN ", "0") (SR-6)
       fix: build the page as header.nav, a main of sections (each one in-flow .wrap plus background layers) and footer.closing
  FAIL container-edges  main > section.hero > div.hero-halo  [1440]
       a box runs 0-1440px, outside the container lines of section 1 at 80-1440px: full width is for background layers and grounds only (SR-6)
       fix: keep it inside the container lines (.wrap): full width is for background layers and grounds only
  FAIL container-edges  section#collection > div.collection-stars  [1440]
       a box runs 0-1440px, outside the container lines of section 3 at 80-1360px: full width is for background layers and grounds only (and 4 more like it: section#collection > div.collection-stars > span:nth-of-type(1), secti
       fix: keep it inside the container lines (.wrap): full width is for background layers and grounds only
  FAIL container-edges  section#histoire > div.story.section > div.story-copy.reveal > span.eyebrow "02 — DERRIÈRE  [1440]
       4 text blocks start on a left line at x 756, 676px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (also "Du temps.Des gestes.De la tendre", "Bienvenue dans mon peti
       fix: start the text on the container's left, or on the one split line every split shares
  FAIL container-edges  section#contact > img.contact-backdrop "Composition inspirée des créations Hafss"  [1440]
       a <img> over half the container wide runs 460-1360px, not on the container's lines at 80-1360px (and 3 more like it: "Mise en scène inspirée d", main > section.hero > div.hero-halo, section#collection > div.collection-st
       fix: run the picture or box from the container's left line to its right line, or put it in a row or a split
  FAIL row-lines        main > div.marquee "FAIT MAIN, AVEC AMOUR PETITES MAILLES, G"  [1440]
       a clipped carousel: 2 items cut at rest (SR-7)
       fix: show every item inside the container, or stack them: no sideways scroller, no half-cut carousel
  FAIL split-pair       section#histoire > div.story.section "LE GOÛT DES PETITS DÉTAILS. 02 — DERRIÈR"  [1440]
       the two columns of the split start 13px apart at the top (centred on each other): a split's columns are top-aligned, 8px either way (SR-8)
       fix: top-align both columns of the split (align-items: start)
  FAIL split-pair       main > section.atelier-offer.section > div.atelier-poster "BIENVENUE CHEZ HAFSSA CROCHET E  [1440]
       the split's columns are off the page's one pair of lines: its right column starts at x 662, on none of the split lines 623 (k=5), 732 (k=6), 841 (k=7) (SR-8)
       fix: start every split's right column on one shared line (wrap.left + k x (width + 24) / 12, k 5, 6 or 7; 6 on a place page) and end the left one 24px before it
  FAIL nav-covers       button#floating-cart "0"  [390]
       sits on top of the text "Doudou Jaune" while the page scrolls: part of the line shows beside it
       fix: make the fixed nav one opaque band across the whole screen, or let it scroll away with the page
  FAIL container        page  [1440, 390]
       no .wrap
       fix: put the content in one .wrap
  35 WARN (not blocking), first: assets (the page); flush section#collection > div.collection-star; scroll-reveal section#histoire > div.story.section > d; copy-headings div#products > article.product.card:nth-; copy-buttons nav#main-nav > a.magic-button.nav-magic:
Stop fixing: put these open FAILs and the waivers in your report, then finish.
GATE: OPEN 56 (rounds used up)

```

### Full performance output

```text

perf index.html @ 1440px
  PASS  host CPU load (before/after)               1/3 %
  FAIL  total transfer                             11820.6 KiB    html 7.7K  css 39.9K  js 33.8K  font 231.3K  img 9946.7K  other 1561.2K
  PASS  requests                                   39             33 by load
  FAIL  images bytes                               9946.7 KiB     16 files
  FAIL  largest image                              2487.3 KiB     assets/hero-atelier-mauve.png
  PASS  JS parsed                                  104.6 KiB      10 files, 33.8K gz
  PASS  CSS                                        39.9 KiB       5 files
  WARN  font families                              3              Dancing Script, Figtree, Fraunces
  PASS  font files                                 4              231.3K
  WARN  font bytes                                 231.3 KiB
  PASS  images without width+height                0
  PASS  below-fold images not lazy                 0              1 marked lazy in the page source, set eager by system.js once the page has loaded
  FAIL  oversized images (natural > 2.2x shown)    14             logo-transparent.png 1536px for 86; duo-poupees.jpeg 1080px for 284; doudou-jaune.jpeg 1080px for 284
  PASS  WebGL live at load                         0
  PASS  WebGL live at bottom                       0
  PASS  WebGL peak live                            0              0 contexts made in all
  PASS  long tasks                                 0              runs 3, 0..0, max 0ms
  PASS  blocking time                              0 ms           runs 3, 0..0 ms; at load 0ms
  PASS  FCP (CPU, relative)                        140 ms         runs 3, 112..252
  PASS  LCP (CPU, relative)                        168 ms         runs 3, 140..252, img
  WARN  layout shift                               0.154          runs 3, 0.154..0.154; at load 0.154
  PASS  modules loaded, never mounted              0
  FAIL  broken requests                            1              api/store
  PASS  page height                                7 screens      DOM 585 nodes

perf index.html @ 390px
  PASS  host CPU load (before/after)               1/3 %
  FAIL  total transfer                             10846.1 KiB    html 7.7K  css 39.9K  js 33.8K  font 231.3K  img 10525.5K  other 7.9K
  PASS  requests                                   38             30 by load
  FAIL  images bytes                               10525.5 KiB    16 files
  FAIL  largest image                              2487.3 KiB     assets/hero-atelier-mauve.png
  PASS  JS parsed                                  104.6 KiB      10 files, 33.8K gz
  PASS  CSS                                        39.9 KiB       5 files
  WARN  font families                              3              Dancing Script, Figtree, Fraunces
  PASS  font files                                 4              231.3K
  WARN  font bytes                                 231.3 KiB
  PASS  images without width+height                0
  PASS  below-fold images not lazy                 0              1 marked lazy in the page source, set eager by system.js once the page has loaded
  FAIL  oversized images (natural > 2.2x shown)    16             logo-transparent.png 1536px for 48; hero-mobile-rose.png 1024px for 390; duo-poupees.jpeg 1080px for 154
  PASS  WebGL live at load                         0
  PASS  WebGL live at bottom                       0
  PASS  WebGL peak live                            0              0 contexts made in all
  PASS  long tasks                                 0              runs 3, 0..0, max 0ms
  PASS  blocking time                              0 ms           runs 3, 0..0 ms; at load 0ms
  PASS  FCP (CPU, relative)                        112 ms         runs 3, 108..124
  PASS  LCP (CPU, relative)                        124 ms         runs 3, 108..132, img
  PASS  layout shift                               0.000          runs 3, 0.000..0.000; at load 0.000
  PASS  modules loaded, never mounted              0
  FAIL  broken requests                            1              api/store
  PASS  page height                                10.2 screens   DOM 585 nodes

SUMMARY index.html: 10 FAIL, 5 WARN  -> FAIL

```
