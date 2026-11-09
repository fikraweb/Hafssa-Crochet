import { products, shop } from './catalogue.js';
import { total, orderMessage, whatsappUrl } from './cart.js';
const $ = id => document.getElementById(id);
const money = value => `${new Intl.NumberFormat('fr-MA').format(value)} DH`;
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem('hafssa-cart') || '{}');
  for (const p of products) if (Number.isInteger(saved[p.id]) && saved[p.id] > 0) cart[p.id] = Math.min(saved[p.id], 99);
} catch {}
let category = 'Tout';
const toast = message => { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => $('toast').classList.remove('visible'), 2600); };
function saveCart() {
  try { localStorage.setItem('hafssa-cart', JSON.stringify(cart)); } catch {}
  renderCart();
}
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function renderProducts() {
  const query = $('search').value.trim().toLocaleLowerCase('fr');
  const filtered = products.filter(p => (category === 'Tout' || p.category === category) && `${p.name} ${p.description} ${p.category}`.toLocaleLowerCase('fr').includes(query));
  $('products').replaceChildren();
  $('empty').hidden = filtered.length > 0;
  $('catalogue-status').textContent = products.length ? `${filtered.length} création${filtered.length === 1 ? '' : 's'}` : '';
  if (products.length && !filtered.length) {
    $('empty').replaceChildren(el('h3', 'Aucune création trouvée'), el('p', 'Essayez un autre mot ou une autre catégorie.'));
  }
  for (const p of filtered) {
    const card = el('article', '', 'product');
    const img = el('img'); img.src = p.image; img.alt = p.name; img.loading = 'lazy';
    const bottom = el('div', '', 'product-bottom');
    const button = el('button', 'Ajouter +'); button.setAttribute('aria-label', `Ajouter ${p.name} au panier`);
    button.onclick = () => { cart[p.id] = Math.min((cart[p.id] || 0) + 1, 99); saveCart(); toast('Création ajoutée au panier'); };
    bottom.append(el('span', money(p.price)), button);
    card.append(img, el('h3', p.name), el('p', p.description), bottom); $('products').append(card);
  }
}
function renderCart() {
  $('cart-items').replaceChildren();
  let count = 0;
  for (const p of products.filter(p => cart[p.id])) {
    count += cart[p.id];
    const row = el('div', '', 'cart-row');
    const top = el('div', '', 'cart-row-top'); top.append(el('strong', p.name), el('span', money(p.price * cart[p.id])));
    const quantity = el('div', '', 'quantity');
    for (const [label, delta] of [['−', -1], ['+', 1]]) {
      const button = el('button', label); button.setAttribute('aria-label', `${delta < 0 ? 'Retirer' : 'Ajouter'} une unité de ${p.name}`);
      button.onclick = () => { cart[p.id] = Math.min(cart[p.id] + delta, 99); if (!cart[p.id]) delete cart[p.id]; saveCart(); };
      quantity.append(button);
      if (delta === -1) quantity.append(el('span', String(cart[p.id])));
    }
    row.append(top, quantity); $('cart-items').append(row);
  }
  if (!count) $('cart-items').append(el('p', 'Votre panier attend vos coups de cœur.'));
  $('cart-count').textContent = String(count); $('cart-total').textContent = money(total(cart, products)); $('checkout').disabled = count === 0;
}
for (const name of ['Tout', ...new Set(products.map(p => p.category))]) {
  const button = el('button', name, name === 'Tout' ? 'active' : ''); button.setAttribute('aria-pressed', String(name === 'Tout'));
  button.onclick = () => { category = name; for (const b of $('filters').children) { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); } renderProducts(); };
  $('filters').append(button);
}
$('search').addEventListener('input', renderProducts);
$('cart-open').onclick = () => $('cart-dialog').showModal();
$('cart-close').onclick = () => $('cart-dialog').close();
$('cart-dialog').addEventListener('click', e => { if (e.target === $('cart-dialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('checkout').onclick = () => { if (Object.keys(cart).length) window.open(whatsappUrl(shop.whatsapp, orderMessage(cart, products)), '_blank', 'noopener,noreferrer'); };
const contactUrl = whatsappUrl(shop.whatsapp, 'Bonjour Hafssa 🌸 Je souhaite en savoir plus sur vos créations au crochet.');
for (const id of ['contact-whatsapp', 'collection-contact']) { $(id).href = contactUrl; $(id).target = '_blank'; $(id).rel = 'noopener noreferrer'; }
$('year').textContent = new Date().getFullYear();
renderProducts(); renderCart();
