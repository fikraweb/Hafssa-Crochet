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
