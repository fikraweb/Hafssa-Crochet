import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { imageVariants } from '../image-variants.js';
const digest = data => createHash('sha256').update(data).digest('hex');
const covers = JSON.parse(await readFile(new URL('../assets/web-products/source.json', import.meta.url), 'utf8'));
const brand = JSON.parse(await readFile(new URL('../assets/web-derivatives.json', import.meta.url), 'utf8'));
let before = 0, after = 0;
for (const row of covers) {
  const source = await readFile(new URL('../'+row.source, import.meta.url));
  const file = await readFile(new URL('../'+row.file, import.meta.url));
  assert.equal(digest(source), row.sourceSha256, 'Original photograph changed: '+row.source);
  assert.equal(file.subarray(0,4).toString(), 'RIFF');
  assert.equal(file.subarray(8,12).toString(), 'WEBP');
  assert.equal(file.length, row.bytes);
  assert.equal(imageVariants['./'+row.source], './'+row.file);
  before += source.length; after += file.length;
}
assert.equal(Object.keys(imageVariants).length, covers.length);
for (const row of brand) {
  const source = await readFile(new URL('../assets/'+row.source, import.meta.url));
  const file = await readFile(new URL('../assets/'+row.file, import.meta.url));
  assert.equal(digest(source), row.sourceSha256, 'Original brand image changed: '+row.source);
  assert.equal(digest(file), row.sha256, 'Derivative mismatch: '+row.file);
}
const responsive = JSON.parse(await readFile(new URL('../assets/web-products/responsive-source.json', import.meta.url), 'utf8'));
for (const row of responsive) {
  assert.equal(digest(await readFile(new URL('../'+row.source, import.meta.url))), row.sourceSha256);
  assert.equal(digest(await readFile(new URL('../'+row.file, import.meta.url))), row.sha256);
}
console.log(`PASS: ${covers.length} same-photo cover variants, ${brand.length} brand derivatives, original SHA-256 values retained; cover bytes ${before} -> ${after} (${Math.round(100*(1-after/before))}% smaller).`);
