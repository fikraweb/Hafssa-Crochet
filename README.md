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

## Catalogue original à importer

Le site de référence est https://hafssacrochet.netlify.app/. Son accès est actuellement bloqué depuis l'environnement cloud (proxy HTTP 403). Aucun produit, prix ou photo n'a été inventé : `catalogue.js` attend les données originales. Les visuels SVG actuels sont des illustrations de présentation, pas des photos de produits.

Ajouter les photos dans `assets/` puis les produits dans `catalogue.js`, selon le format commenté. Les prix sont en dirhams. Le numéro WhatsApp est déjà configuré au format international marocain. Exécuter les tests et le build après modification.

## Cloudflare Pages via GitHub

1. Enregistrer le code dans `fikraweb/Hafssa-Crochet`.
2. Dans Cloudflare, créer un projet Pages et connecter ce dépôt GitHub.
3. Choisir la branche `main`, le préréglage « None », la commande `npm run build`, et le dossier de sortie `dist`.
4. Définir `NODE_VERSION=22` si nécessaire. Aucun secret n'est requis pour ce site statique.
5. Déployer puis ajouter le domaine personnalisé dans les paramètres du projet Pages.

Les en-têtes de sécurité sont dans `_headers`. Aucun déploiement Cloudflare n'est effectué par ces commandes.
