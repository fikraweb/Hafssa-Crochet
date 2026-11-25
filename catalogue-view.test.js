import test from "node:test";
import assert from "node:assert/strict";
import { catalogueView } from "./catalogue-view.js";
const products = [
  { id: "a", category: "Poupées", name: "Zoé", price: 290 },
  { id: "b", category: "Sacs", name: "Églantine", price: 120 },
  { id: "c", category: "Poupées", name: "Alice", price: 180 },
];
test("sort applies to the complete filtered catalogue without mutating source", () => {
  const before = structuredClone(products);
  assert.deepEqual(catalogueView(products, "Poupées", "price-asc").map(p => p.id), ["c", "a"]);
  assert.deepEqual(catalogueView(products, "Tout", "price-desc").map(p => p.id), ["a", "c", "b"]);
  assert.deepEqual(catalogueView(products, "Tout", "name").map(p => p.id), ["c", "b", "a"]);
  assert.deepEqual(products, before);
});
test("original order, unknown sort and empty categories remain usable", () => {
  assert.deepEqual(catalogueView(products).map(p => p.id), ["a", "b", "c"]);
  assert.deepEqual(catalogueView(products, "Tout", "unknown"), products);
  assert.deepEqual(catalogueView(products, "Missing", "price-asc"), []);
});
