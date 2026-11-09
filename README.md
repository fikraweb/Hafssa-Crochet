# Hafssa Crochet

Boutique de crochet sur Cloudflare Workers, avec catalogue, panier WhatsApp et administration privée sur `/admin/`. La palette rose et mauve, la navigation mobile en menu latéral et les galeries conservent les photos originales des produits.

## Développement

Prérequis : Node.js 22+.

```sh
npm ci
npm run dev
```

La boutique et l’API sont servies sur le port 8787. Pour tester l’administration, créer un fichier local `.dev.vars` contenant `ADMIN_PASSWORD` avec une valeur longue d’au moins 14 caractères. Ce fichier est ignoré par Git. Aucun mot de passe par défaut n’est fourni. Le secret utilisé en production doit être créé séparément dans Cloudflare.

```sh
npm test
npm run test:dashboard
npm run build
```

`test:dashboard` nécessite le Worker local en cours d’exécution et le secret local dans `.dev.vars`. Ces tests créent des données de test exclusivement sur `localhost` ou `127.0.0.1` ; ils refusent une URL de production. Les données locales persistent dans `.wrangler/` par défaut. `npm run dev:static` lance uniquement les fichiers statiques via Python, sur le port 4173 ; l’administration et les statistiques nécessitent le Worker.

## Déploiement Cloudflare via GitHub

Le Worker `hafssaacrochet` utilise la configuration complète `wrangler.jsonc` : code serveur `server/worker.js`, fichiers statiques dans `dist/` et Durable Object SQLite `STORE` / `ShopStore`. La migration initiale est déclarée dans le dépôt et exécutée par Wrangler lors du déploiement. Aucune base D1 ou clé Supabase n’est nécessaire.

Dans Cloudflare → Worker → Settings → Build :

- Dépôt : `fikraweb/Hafssa-Crochet`, branche `main`.
- Build command : `npm run build`.
- Deploy command : `npm run deploy`.
- Root directory : `/`.

Activer les déploiements automatiques. Le déploiement nécessite que le jeton de build permette la mise à jour du Worker et sa migration Durable Object. Si Cloudflare refuse la migration, consulter le journal du build avant de modifier les permissions.

**Configuration indispensable pour se connecter :** Cloudflare → Worker → Settings → Variables and Secrets → Add → **Secret** nommé `ADMIN_PASSWORD`, avec une valeur privée de 14 caractères minimum, puis déployer le changement. Ne jamais inscrire ce mot de passe dans le dépôt, dans un script ou dans le chat. La boutique et les mesures peuvent fonctionner sans ce secret, mais l’administration refuse alors toute connexion.

`wrangler.jsonc` active `keep_vars: true` pour préserver les variables définies dans le tableau de bord Cloudflare lors des déploiements. Enregistrer `ADMIN_PASSWORD` comme **Secret du Worker de production**, pas comme variable du processus de build. Les secrets restent gérés par Cloudflare ; ne pas déclarer leur valeur dans `vars` ni dans Git. Si une ancienne variable a déjà été supprimée, la recréer une fois comme Secret puis enregistrer/déployer le changement.

Le déploiement doit utiliser Workers ; un hébergement Pages purement statique ne fournit pas les fonctions d’administration.

## Dashboard

Ouvrir `/admin/` pour accéder à :

- Vue d’ensemble sur 7, 30 ou 90 jours : pages vues, sessions de navigation mesurées par jour, ouvertures de contact WhatsApp, ajouts au panier, demandes et montant des ventes marquées terminées. Les graphiques et les fiches populaires proviennent d’événements réellement enregistrés ; aucun historique antérieur au suivi n’est reconstitué.
- Demandes WhatsApp : référence, date, nom, ville et téléphone du client, articles, quantités, prix au moment de la demande, montant hors livraison, statut et note privée. Les 200 demandes les plus récentes sont affichées ; l’export CSV contient la sélection affichée. Une demande WhatsApp n’est pas une commande payée : la validation et le paiement restent manuels.
- Créations : recherche, pagination, modification des noms, descriptions, catégories, prix et visibilité ; ajout de créations et import JPEG/PNG/WebP de 1 Mo maximum. Les images ne sont pas recompressées. La réimportation d’une photo connue réutilise son identité pour éviter les annonces actives en double. Pour retirer une fiche, la masquer permet de conserver l’historique des demandes.
- Paramètres : nom, numéro WhatsApp, lien Instagram, texte du bandeau, présentation du hero et message de livraison. Les modifications enregistrées sont utilisées à l’ouverture suivante de la boutique, sans nouveau déploiement.

Les paramètres, ajouts de produits, images importées et demandes restent dans le stockage durable Cloudflare. Les données de test locales sont distinctes de la production. Les modifications de l’administration ont priorité sur les champs correspondants du catalogue initial. Les statistiques sont limitées aux 90 derniers jours ; les demandes restent conservées. Aucune donnée de compte WhatsApp, confirmation de paiement ou mesure interne Cloudflare (facturation, CPU, erreurs globales) n’est importée automatiquement.

### Protection

Le serveur contrôle le mot de passe, les accès administratifs, les origines des requêtes, les prix et les quantités. La session utilise un cookie `HttpOnly`, `Secure`, `SameSite=Strict` valable 8 heures, dont seul le condensat est conservé. La déconnexion révoque le jeton ; changer le secret invalide les sessions existantes. Les tentatives de connexion et les écritures publiques sont limitées. Le secret n’est jamais retourné à l’interface. Les mesures ne conservent pas d’adresse IP brute ; les identifiants de session publique sont anonymes et éphémères.

Le suivi des statistiques est une mesure JavaScript de première partie : bloqueurs, interruptions de réseau et robots peuvent affecter les nombres. Le magasin conserve un repli vers le catalogue statique si l’API ne répond pas. Ce repli n’autorise aucune opération d’administration.

## Catalogue et photos

Le catalogue initial comprend 83 produits distincts, après suppression des annonces répétées, avec 8 produits d’origine et 75 ajouts issus de `crochet.zip`. Les 88 captures envoyées sont toutes conservées, avec regroupement des angles similaires en galeries. Les empreintes SHA-256 et rattachements figurent dans `assets/products/upload-source.json` ; ceux des huit photos originales sont dans `assets/products/source.json`.

Les noms et prix des nouvelles fiches ont été proposés à la demande du propriétaire. `catalogue-prix.csv` est la liste initiale de référence ; les modifications faites ensuite dans l’administration se trouvent dans le stockage durable et ne réécrivent pas ce fichier Git.

Les cadres présentent les images sans coupe (`object-fit: contain`). Les captures fournies sont souvent d’environ 330 × 440 pixels : la résolution d’origine est conservée, sans prétendre recréer des détails absents. Les images importées dans l’administration conservent également leurs octets d’origine.

Les données de `catalogue.js` constituent le socle versionné. Le site Netlify d’origine n’est pas synchronisé automatiquement. Les anciens identifiants de produits regroupés sont migrés vers le produit conservé dans les paniers locaux.

## Identité et animations

Le logo Instagram d’origine (150 × 150 px) est conservé. `assets/logo-transparent.png` est une reconstruction améliorée à fond transparent, de 1536 × 1024 pixels, et non un original 4K. La police locale Dancing Script est fournie avec sa licence OFL.

Les décors photoréalistes du hero, du contact et du pied de page sont des mises en scène générées à partir des photos du catalogue, pas des photographies documentaires de l’atelier. Leur provenance est décrite dans les fichiers source JSON correspondants.

Les animations, reflets et déplacements magnétiques respectent le bouton de pause persistant et le réglage système de réduction des mouvements. La barre principale est fixe, et les filtres de catégorie suivent la collection sous cette barre, dans une palette rose et mauve.

### Photographies détourées

Les 83 couvertures disposent d'une version WebP transparente dans `assets/cutouts/`.
Le sélecteur de galerie conserve toutes les photos originales. Les couleurs et
pixels RGB proviennent exclusivement des originaux : seul le canal alpha est
calculé, puis l'image est recadrée et exportée sans perte. Les petites captures
conservent leur résolution réelle ; aucun agrandissement artificiel n'est utilisé.

Pour régénérer les détourages hors ligne, installer `scripts/requirements-cutouts.txt`
dans un environnement Python, puis lancer `python scripts/prepare-cutouts.py`.
BiRefNet télécharge ses modèles officiels avec vérification d'intégrité ; compter
jusqu'à 32 Go de RAM pour les deux processus. Définir `U2NET_HOME` pour changer
le dossier de modèles. Les masques relus dans `scripts/cutout-masks/` sont liés
au SHA-256 de leur photographie source. Le manifeste et `cutouts.js` enregistrent
les dimensions, recadrages et sommes de contrôle. Les modèles ne sont pas déployés.

Le formulaire du panier exige le nom, la ville et le téléphone avant l’ouverture de WhatsApp. Le serveur valide et conserve ces coordonnées dans la demande privée ; les commandes antérieures restent accessibles sans coordonnées.

### Visiteurs et parcours

La rubrique **Visiteurs et activité** affiche les sessions anonymes de la période,
les sessions actives dans les cinq dernières minutes, les appareils, la provenance
indicative et les sessions ayant consulté un produit, ajouté au panier ou envoyé
une demande. Les 100 sessions récentes permettent de consulter jusqu'à 200 actions
par parcours : ouverture de la boutique, catégorie, page du catalogue, fiche produit,
ajout, ouverture du panier, début du formulaire, demande enregistrée, rubrique et clic sur un réseau social ou Academy.

Le navigateur renouvelle l'identifiant après 30 minutes sans action. Il s'agit de
sessions, pas d'une identification des personnes. Aucun nom, téléphone, IP brute,
URL de provenance complète ou contenu saisi n'est ajouté au journal d'activité.
Les coordonnées de commande restent dans les demandes privées. Les événements
sont conservés au maximum 90 jours et limités aux 50 000 dernières actions ; les
comptes détaillés peuvent donc différer des anciens totaux agrégés. Le suivi ne
reconstitue pas l'historique antérieur. Les données détaillées exigent une session
administrateur et ne sont jamais retournées par `/api/store`.
