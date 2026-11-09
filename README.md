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

Les 75 nouvelles fiches issues de `crochet.zip` complètent désormais les 8 produits initiaux : 83 produits au total. Les 88 captures envoyées sont conservées telles quelles, avec regroupement des angles similaires en galeries. Leurs dimensions, empreintes SHA-256 et rattachements aux fiches figurent dans `assets/products/upload-source.json`. Les noms et prix des nouvelles fiches sont proposés à la demande du propriétaire ; les prix existants sont conservés. Les annonces de sacs utilisant la même photo ont été regroupées dans une seule fiche. Les coffrets ourson verts similaires ont aussi été réunis.

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

Le logo original vient de l'image publique du profil Instagram `@hafssacrochet` (150 × 150 px, provenance dans `assets/brand-source.json`). Les photos du catalogue initial ont été complétées par les captures fournies ensuite dans `crochet.zip`. Les nouvelles fiches utilisent ces images, avec les noms et prix proposés à la demande du propriétaire.

Le hero présente une mise en scène photoréaliste générée à partir de quatre photos de produits et du logo : créations alignées sur un bureau, avec le logo dans un cadre mural, dans une ambiance mauve et rose. Ce décor est une création visuelle, pas une photographie documentaire de l’atelier. Une légère inclinaison au pointeur et un zoom lent animent le décor. `experience.js` gère aussi les apparitions au défilement, le menu mobile et le bouton de pause persistant. Le réglage système `prefers-reduced-motion` supprime les mouvements ; aucune bibliothèque 3D externe ni vidéo n'est téléchargée. Les fiches rapides et le tri par prix complètent le catalogue.

## Navigation et logo

Le bandeau principal reste visible pendant le défilement. Sur mobile, les trois liens restent affichés dans une deuxième rangée compacte. Les titres de navigation sont agrandis et encadrés en rose ; le nom complet « Hafssa Crochet » utilise la police locale Dancing Script (licence OFL dans `assets/fonts/`).

`assets/logo-transparent.png` est une reconstruction améliorée à fond transparent du logo original, produite à partir de la petite image Instagram. Dimensions réelles : 1536 × 1024 pixels. Ce n'est pas un original 4K ; le fichier source Instagram est conservé. Le hero a été réduit en hauteur sur ordinateur et mobile.

Le titre du hero utilise une composition manuscrite en Dancing Script, avec une apparition progressive et un cœur discret. Les deux boutons du hero ont des formes arrondies, un reflet satiné, des étoiles animées et un déplacement magnétique limité au pointeur fin. Les liens restent utilisables au clavier et au toucher. La pause persistante et le réglage système de réduction des mouvements désactivent ces effets.

Les liens de navigation et le panier reprennent le même traitement que les boutons du hero : formes arrondies, satin mauve-rose, reflets, étoiles discrètes et mouvement magnétique. La navigation reste fixe et visible sur mobile ; les mêmes contrôles de pause et d'accessibilité s'appliquent.

## Images et navigation dans la collection

Les fichiers PNG de l'archive ne sont ni rééchantillonnés ni recompressés : leur résolution d'origine est conservée (environ 330 × 440 pixels pour la plupart). Les cadres utilisent `object-fit: contain`, et la galerie présente les originaux sans coupe ni agrandissement forcé. Pour obtenir davantage de détails réels sur des écrans haute définition, remplacer les captures par les photos originales de plus grande résolution, sans modifier les produits.

Le catalogue affiche 12 produits à la fois, avec « Voir plus de créations », recherche, tri et catégories. Chaque fiche réunit ses différentes vues, avec vignettes et commandes précédent/suivant. Un contrôle d'intégrité vérifie que les 88 fichiers envoyés sont tous associés à un produit et n'ont pas été altérés.

La liste complète des noms, catégories, prix et nombres de photos est disponible dans `catalogue-prix.csv` (séparateur point-virgule, compatible Excel).

La barre principale est fixée en haut de la fenêtre. Les filtres de catégorie restent visibles sous cette barre pendant le parcours du catalogue, avec un habillage rose et mauve. La palette de l'interface ne contient plus de vert ; les couleurs naturelles des produits sont conservées. La section contact et le pied de page utilisent des mises en scène d'atelier générées à partir des photos du catalogue, et non des photographies documentaires de l'atelier réel. Les identifiants des annonces regroupées redirigent les quantités d'un ancien panier vers le produit conservé.
