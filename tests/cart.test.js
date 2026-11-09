import test from 'node:test';
import assert from 'node:assert/strict';
import { total, orderMessage, whatsappUrl } from '../cart.js';
const products = [{ id: 'a', name: 'Sac rose & crème', price: 250 }, { id: 'b', name: 'Fleur', price: 30 }];
test('calcul du panier et quantités multiples', () => { assert.equal(total({ a: 2, b: 3 }, products), 590); assert.equal(total({}, products), 0); assert.equal(total({ inconnu: 5 }, products), 0); });
test('commande WhatsApp contient produits, quantités, total et confirmation livraison', () => {
  const message = orderMessage({ a: 2 }, products);
  assert.match(message, /Sac rose & crème × 2 — 500 DH/); assert.match(message, /Total : 500 DH/); assert.match(message, /frais de livraison/); assert.ok(!message.includes('Fleur'));
  const url = new URL(whatsappUrl('212684207643', message)); assert.equal(url.pathname, '/212684207643'); assert.equal(url.searchParams.get('text'), message);
});
