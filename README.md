# Hafssa Crochet

Boutique statique responsive, sans dépendances, prévue pour Cloudflare Pages. Catalogue, recherche, filtres, panier local et préparation de commande sur WhatsApp (06 84 20 76 43). Les commandes sont confirmées manuellement, sans paiement en ligne.

## Développement

Prérequis : Node.js 22+ et Python 3.

```sh
npm run dev
npm test
npm run build
```

Le serveur de développement utilise le port 4173. Le build produit `dist/`, sans installation npm nécessaire.

## Catalogue

Les 8 produits actifs ont été importés du catalogue public de https://hafssacrochet.netlify.app/ le 9 novembre 2026, avec leurs noms, descriptions, catégories, prix et images originales. Les images sont hébergées localement dans `assets/products/`. Leur provenance et empreinte SHA-256 figurent dans `assets/products/source.json`.

Le catalogue est une copie locale dans `catalogue.js` : les changements ultérieurs sur le site original ne sont pas synchronisés automatiquement. Les prix sont en dirhams. Aucun accès Supabase ni secret n'est nécessaire pour servir cette copie. La disponibilité et les frais de livraison restent à confirmer sur WhatsApp.

Pour modifier la collection, mettre les photos dans `assets/products/`, puis ajuster `catalogue.js` et relancer les tests et le build. Le visuel SVG d'accueil est une illustration de présentation.

## Cloudflare Pages via GitHub

1. Enregistrer le code dans `fikraweb/Hafssa-Crochet`.
2. Dans Cloudflare, créer un projet Pages et connecter ce dépôt GitHub.
3. Choisir la branche `main`, le préréglage « None », la commande `npm run build`, et le dossier de sortie `dist`.
4. Définir `NODE_VERSION=22` si nécessaire. Aucun secret n'est requis pour ce site statique.
5. Déployer puis ajouter le domaine personnalisé dans les paramètres du projet Pages.

Les en-têtes de sécurité sont dans `_headers`. Aucun déploiement Cloudflare n'est effectué par ces commandes.

## Cloudflare Workers (projet actuel)

Le Worker existant `hafssaacrochet` peut aussi servir cette boutique statique. `wrangler.jsonc` définit le dossier `dist/` et le nom du Worker.

Dans Cloudflare → Settings → Build, sélectionner le dépôt et la branche `main`, puis définir :

- Build command : `npm run build`
- Deploy command : `npm run deploy`
- Root directory : `/`

Activer les déploiements automatiques pour `main`. Ne pas utiliser `npm run build` comme commande de déploiement : cette commande seule ne publie aucun fichier.

Pour un déploiement manuel depuis une machine autorisée : `npm ci`, `npm run build`, puis `npm run deploy`. L'authentification Cloudflare est requise uniquement pour le déploiement et reste gérée par Cloudflare Builds ou par la session Wrangler locale ; ne jamais enregistrer de jeton dans le dépôt.

## Identité et expérience visuelle

Le logo original vient de l'image publique du profil Instagram `@hafssacrochet` (150 × 150 px, provenance dans `assets/brand-source.json`). Les photos restent les huit images originales du catalogue : l'accès public Instagram n'a pas fourni les photos des publications, et aucun nouveau produit ou prix n'a été inventé.

Le hero utilise les photos réelles, une composition à plusieurs plans avec perspective CSS, des sphères de fil construites en anneaux 3D et une inclinaison au pointeur. `experience.js` gère aussi les apparitions au défilement, le menu mobile et le bouton de pause persistant. Le réglage système `prefers-reduced-motion` supprime les mouvements ; aucune bibliothèque 3D externe ni vidéo n'est téléchargée. Les fiches rapides et le tri par prix complètent le catalogue.
