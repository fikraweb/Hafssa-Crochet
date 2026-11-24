# Hafssa Crochet project instructions

## Frontend design skill

Automatically read and apply `.agents/skills/design-taste-frontend/SKILL.md` whenever a task asks to build, redesign, improve, review, or modify this website frontend. It is the complete upstream Taste Skill, pinned in `.agents/taste-source.json`. Keep its files unchanged; refresh from the upstream repository deliberately, and preserve the licence.

User requirements take precedence over skill defaults. This is an existing production storefront: preserve the real French copy, rose/mauve Hafssa Crochet branding, original product photographs, catalogue, customer details, real social links, WhatsApp checkout, protected dashboard and visitor analytics unless the user asks to change them. Do not replace real contacts with example addresses or rewrite copy just to pass a design check. Record any applicable checker exceptions and their reasons honestly.

## Working with the application

- Static HTML/CSS/JavaScript storefront with a Cloudflare Worker and Durable Object backend.
- Read `README.md` for setup and administration. Run `npm run build` and the checks appropriate to the change. `npm test` checks catalogue and cart integrity; `npm run test:dashboard` writes only to a local Worker and needs a private, ignored `.dev.vars` file.
- Never commit credentials or customer data. Preserve `keep_vars: true` in `wrangler.jsonc`.
- Preserve existing edits and functionality. Verify responsive layouts and important user flows before committing frontend work.
- The user has requested commits and GitHub/Cloudflare publication in this conversation. Verify the real deployment before reporting that a change is live. Publishing this cloud environment's configuration is separate from publishing the website.
