# Product: Hafssa Crochet — audit and creative direction

## Phase 1: inspected project

Static French storefront (`index.html`, catalogue/cart/store modules), Cloudflare Worker and SQLite Durable Object API, protected `/admin/` SPA. Administrator panels: overview, visitor activity and journeys, WhatsApp requests and status editor/CSV, product search/editor/upload/visibility/pagination, settings and private-session controls. Public journey: browse/category/page → photo/gallery/detail/quantity → local cart → required name/city/telephone → server-validated request → WhatsApp. Social and Academy destinations are real client accounts. Dashboard mutations, auth and customer data must stay private.

Audience: buyers of handmade crochet dolls, comforters and gifts, often browsing on phones; custom requests go directly to the maker. Main objective: help choose a real creation and submit a well-specified WhatsApp request. The owner needs usable mobile administration and honest analytics, not fabricated sales or visitor numbers.

Material inspected: 83 catalogue records and source manifests, original high-resolution photos and smaller supplied screenshots, reconstructed transparent brand logo, approved illustrative atelier scenes, self-hosted licensed fonts, original content, existing local tests and production configuration. Marketing scenes are illustrative, not documentary photographs; no claim that screenshots have higher native resolution than supplied.

Instructions/skills: repository AGENTS.md applies. No global AGENTS.md was present in the checked workspace/home locations. The full pinned design-taste-frontend skill is installed and verified. Frontend-design, UI UX Pro Max, Impeccable and separate Web Design Guidelines skills are not installed here; they are not falsely represented as used. Taste's system and motion guidance apply. React/Next.js-specific Vercel advice and Remotion video skills do not fit this plain-JavaScript storefront task.

Weaknesses: three competing storefront theme layers; lengthy repeated descriptions in catalogue cards; pointer-only product photography; a horizontal desktop category list with limited orientation; weak explanation of manual ordering; a dashboard visually disconnected from the store, tiny mobile labels and hard-to-read mobile logout; large original marketing PNG downloads; inconsistent button/field/table styles. The underlying ordering/auth/API features are working and must remain.

## Phase 2: art direction

Warm cream, ink/berry and restrained rose; Fraunces for editorial headings, Figtree for UI, original Dancing Script only for the brand signature. Real product photographs lead. Retain the restored/approved hero artwork, as the client specifically requested earlier, and refine its introduction rather than substitute another stock hero. Product-led eyebrow and useful ordering context improve first-screen clarity. Existing original French headline remains.

Build a desktop category rail with true product counts beside a compact three-column collection (two columns on phones), fully keyboard-accessible photo/title preview controls, and full descriptions in the existing detail view. Preserve all 83 products, gallery photos, numbered pagination and scroll-to-products behavior. Add one factual ordering explanation with three unboxed steps. Rebuild the product/cart panels and the complete owner interface using the same brand system. A photographic login layout and a readable mobile admin navigation retain every existing panel and field. Do not invent reviews, delivery promises, discounts, stock status or payment methods.

Use the source-identical Taste entrance/hover layer and existing dealt photo-development moment; no new scroll reveals, random loops or shaders. Reduced motion and keyboard focus remain explicit. Preserve the client-requested original images, real contacts, sticky mobile categories, floating cart and scroll-away public header even where generic starter rules disagree.

## Implementation and QC plan

Consolidate the active storefront refinement into one primary theme file, retain legacy files in the repository, and keep the server/data modules unchanged. Rebuild public DOM components and responsive admin layouts, not only cosmetic colour changes. All original record descriptions remain in product details. Test original image integrity, cart math, auth/origin protection, orders, analytics, settings and import on a fresh local Worker. Inspect every admin panel and both editors at desktop/tablet/phone widths; test invalid login, navigation, editing, upload, CSV, checkout and logout without contacting WhatsApp or writing production data. Inspect storefront screenshots, typography, overflow, focus and responsive controls.

Use one final upstream Taste gate audit after functional/screenshot fixes (within the maximum three-round budget) and report OPEN results, including template/brief conflicts, without modifying vendor files or concealing failures. Report performance honestly and verify exact deployed assets/API after the already-authorized GitHub/Cloudflare publication.
