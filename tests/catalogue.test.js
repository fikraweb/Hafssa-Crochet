import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { products } from "../catalogue.js";
const root = new URL("../", import.meta.url);

test("catalogue : produits distincts et chaque image de galerie disponible", async () => {
  const ids = new Set();
  const names = new Set();
  for (const product of products) {
    assert.ok(!ids.has(product.id), `Identifiant dupliqué : ${product.id}`);
    assert.ok(!names.has(product.name), `Nom dupliqué : ${product.name}`);
    ids.add(product.id);
    names.add(product.name);
    assert.ok(Number.isFinite(product.price) && product.price > 0);
    const images = product.images || [product.image];
    assert.equal(images[0], product.image);
    for (const path of images)
      assert.ok((await readFile(new URL(path, root))).length > 0, path);
  }
});

test("les 88 images envoyées sont rattachées et conservées sans perte", async () => {
  const source = JSON.parse(
    await readFile(new URL("assets/products/upload-source.json", root), "utf8"),
  );
  assert.equal(source.photos.length, 88);
  assert.equal(new Set(source.photos.map((p) => p.source)).size, 88);
  for (const photo of source.photos) {
    const bytes = await readFile(new URL(photo.path, root));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      photo.sha256,
      photo.source,
    );
    assert.equal(bytes.readUInt32BE(16), photo.width);
    assert.equal(bytes.readUInt32BE(20), photo.height);
    assert.ok(photo.productIds.length > 0);
    for (const id of photo.productIds) {
      const product = products.find((p) => p.id === id);
      assert.ok(product, id);
      assert.ok(
        (product.images || [product.image]).includes(photo.path),
        photo.source,
      );
    }
  }
});
