import { mkdir, copyFile, cp, rm, access } from "node:fs/promises";
import { products, shop } from "../catalogue.js";
const ids = new Set();
for (const p of products) {
  if (
    !p.id ||
    ids.has(p.id) ||
    !p.name ||
    !p.category ||
    !p.image ||
    !Number.isFinite(p.price) ||
    p.price < 0
  )
    throw new Error("Produit invalide ou identifiant dupliqué");
  ids.add(p.id);
  for (const image of p.images || [p.image]) await access(image);
}
if (!/^\d{8,15}$/.test(shop.whatsapp))
  throw new Error("Numéro WhatsApp invalide");
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "style.css",
  "app.js",
  "experience.js",
  "catalogue.js",
  "cart.js",
  "_headers",
])
  await copyFile(file, `dist/${file}`);
await cp("assets", "dist/assets", { recursive: true });
console.log(`Build terminé : dist/ (${products.length} produits).`);
if (!products.length)
  console.warn("Catalogue original en attente : aucun produit publié.");
