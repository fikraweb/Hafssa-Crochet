import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { products } from '../catalogue.js';
import { cutouts } from '../cutouts.js';
const root = new URL('../', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
test('each catalogue cover has a verified alpha cutout and unchanged source', async () => {
  assert.equal(Object.keys(cutouts).length, products.length);
  for (const product of products) {
    const record = cutouts[product.image];
    assert.equal(record.productId, product.id);
    assert.equal(record.alphaOnly, true);
    assert.equal(sha(await readFile(new URL(product.image, root))), record.sourceSha256);
    const bytes = await readFile(new URL(record.image, root));
    assert.equal(sha(bytes), record.sha256);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(record.opaqueCoverage > 0 && record.opaqueCoverage < 1);
    assert.ok(record.size.every(n => n > 0));
  }
});
