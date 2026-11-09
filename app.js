import {
  products as seedProducts,
  shop as seedShop,
  productAliases,
} from "./catalogue.js";
import { loadStore, track, recordOrder } from "./store-client.js";
const live = await loadStore();
const products = live?.products || seedProducts;
const shop = { ...seedShop, ...live?.settings };
let checkoutId = null;
import { total, orderMessage, whatsappUrl } from "./cart.js";
const $ = (id) => document.getElementById(id);
const money = (value) => `${new Intl.NumberFormat("fr-MA").format(value)} DH`;
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem("hafssa-cart") || "{}");
  for (const [id, quantity] of Object.entries(saved || {})) {
    const target = productAliases[id] || id;
    if (
      products.some((p) => p.id === target) &&
      Number.isInteger(quantity) &&
      quantity > 0
    )
      cart[target] = Math.min((cart[target] || 0) + quantity, 99);
  }
} catch {}
let category = "Tout";
const pageSize = 12;
let currentPage = 1;
const toast = (message) => {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("visible"), 2600);
};
function saveCart() {
  checkoutId = null;
  try {
    localStorage.setItem("hafssa-cart", JSON.stringify(cart));
  } catch {}
  renderCart();
}
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function renderProducts() {
  const query = $("search").value.trim().toLocaleLowerCase("fr");
  const filtered = products.filter(
    (p) =>
      (category === "Tout" || p.category === category) &&
      `${p.name} ${p.description} ${p.category}`
        .toLocaleLowerCase("fr")
        .includes(query),
  );
  const sort = $("sort").value;
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  $("products").replaceChildren();
  $("empty").hidden = filtered.length > 0;
  const pageCount = Math.ceil(filtered.length / pageSize);
  currentPage = Math.min(currentPage, Math.max(1, pageCount));
  const offset = (currentPage - 1) * pageSize;
  const visible = filtered.slice(offset, offset + pageSize);
  $("catalogue-status").textContent =
    `${filtered.length ? offset + 1 : 0}–${offset + visible.length} sur ${filtered.length} création${filtered.length === 1 ? "" : "s"}`;
  const pagination = $("pagination");
  pagination.replaceChildren();
  pagination.hidden = pageCount <= 1;
  function pageButton(label, page, disabled = false) {
    const button = el("button", label);
    button.type = "button";
    button.disabled = disabled;
    button.setAttribute("aria-label", `Page ${page}`);
    if (page === currentPage && /^\d+$/.test(label))
      button.setAttribute("aria-current", "page");
    button.onclick = () => {
      currentPage = page;
      renderProducts();
      pagination.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
      document.querySelector(".catalogue-tools").scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    };
    pagination.append(button);
    return button;
  }
  pageButton("‹", currentPage - 1, currentPage === 1)
    .setAttribute("aria-label", "Page précédente");
  for (let page = 1; page <= pageCount; page++) pageButton(String(page), page);
  pageButton("›", currentPage + 1, currentPage === pageCount)
    .setAttribute("aria-label", "Page suivante");
  if (products.length && !filtered.length) {
    $("empty").replaceChildren(
      el("h3", "Aucune création trouvée"),
      el("p", "Essayez un autre mot ou une autre catégorie."),
    );
  }
  for (const p of visible) {
    const card = el("article", "", "product");
    const media = el("div", "", "product-media");
    const img = el("img");
    img.src = p.image;
    img.alt = p.name;
    img.loading = "lazy";
    img.width = 500;
    img.height = 625;
    img.decoding = "async";
    img.onclick = () => showProduct(p);
    const quick = el("button", "", "quick-view");
    quick.setAttribute("aria-label", `Voir les détails de ${p.name}`);
    quick.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>';
    quick.onclick = () => showProduct(p);
    media.append(img, el("span", "FAIT MAIN", "product-badge"), quick);
    const viewCount = p.images?.length || 1;
    if (viewCount > 1) {
      const count = el("button", `${viewCount} vues`, "photo-count");
      count.setAttribute(
        "aria-label",
        `Voir les ${viewCount} vues de ${p.name}`,
      );
      count.onclick = () => showProduct(p);
      media.append(count);
    }
    const info = el("div", "", "product-info");
    const bottom = el("div", "", "product-bottom");
    const button = el("button", "Ajouter");
    button.append(el("span", "+"));
    button.setAttribute("aria-label", `Ajouter ${p.name} au panier`);
    button.onclick = () => addProduct(p);
    bottom.append(el("span", money(p.price), "product-price"), button);
    info.append(
      el("span", p.category, "product-category"),
      el("h3", p.name),
      el("p", p.description, "product-description"),
      bottom,
    );
    card.append(media, info);
    $("products").append(card);
  }
}
function addProduct(product, quantity = 1) {
  const before = cart[product.id] || 0;
  const added = Math.min(quantity, 99 - before);
  if (added < 1) {
    toast("Quantité maximale : 99 pièces par création.");
    return;
  }
  track("addtocart", product.id);
  cart[product.id] = before + added;
  saveCart();
  toast(
    added < quantity
      ? `${added} pièce(s) ajoutée(s), maximum de 99 atteint.`
      : added > 1
        ? `${added} pièces ajoutées au panier`
        : "Création ajoutée au panier",
  );
}

function showProduct(product) {
  track("productview", product.id);
  const originalImages = product.images?.length
    ? product.images
    : [product.image];
  const images = originalImages.map((src, index) => ({
    src,
    cutout: false,
    label: `Photo originale ${index + 1}`,
  }));
  let activeImage = 0;
  const thumbs = $("product-thumbnails");
  thumbs.replaceChildren();
  function showImage(index) {
    activeImage = (index + images.length) % images.length;
    $("product-detail-image").src = images[activeImage].src;
    $("product-detail-image").classList.toggle(
      "is-cutout",
      images[activeImage].cutout,
    );
    $("product-image-caption").textContent = images[activeImage].label;
    $("product-detail-image").alt =
      `${product.name} — photo ${activeImage + 1} sur ${images.length}`;
    $("gallery-position").textContent = `${activeImage + 1} / ${images.length}`;
    for (const [i, button] of [...thumbs.children].entries())
      button.setAttribute("aria-pressed", String(i === activeImage));
  }
  for (const [index, image] of images.entries()) {
    const button = el("button");
    button.type = "button";
    button.setAttribute("aria-label", `${image.label} de ${product.name}`);
    const thumbnail = el("img");
    thumbnail.src = image.src;
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    thumbnail.width = 52;
    thumbnail.height = 64;
    button.append(thumbnail);
    button.onclick = () => showImage(index);
    thumbs.append(button);
  }
  $("gallery-controls").hidden = images.length <= 1;
  thumbs.hidden = images.length <= 1;
  $("gallery-prev").onclick = () => showImage(activeImage - 1);
  $("gallery-next").onclick = () => showImage(activeImage + 1);
  showImage(0);
  $("product-title").textContent = product.name;
  $("product-detail-category").textContent = `${product.category} · FAIT MAIN`;
  $("product-detail-description").textContent = product.description;
  const quantity = $("product-quantity");
  quantity.value = "1";
  $("product-unit-price").textContent =
    `${money(product.price)} / pièce · création faite main`;
  const updateQuantity = () => {
    const valid =
      quantity.validity.valid &&
      Number.isInteger(Number(quantity.value)) &&
      Number(quantity.value) >= 1 &&
      Number(quantity.value) <= 99;
    $("product-detail-add").disabled = !valid;
    $("product-detail-price").textContent = valid
      ? money(product.price * Number(quantity.value))
      : money(product.price);
    $("detail-quantity-minus").disabled = !valid || Number(quantity.value) <= 1;
    $("detail-quantity-plus").disabled = !valid || Number(quantity.value) >= 99;
  };
  quantity.oninput = updateQuantity;
  $("detail-quantity-minus").onclick = () => {
    quantity.stepDown();
    updateQuantity();
  };
  $("detail-quantity-plus").onclick = () => {
    quantity.stepUp();
    updateQuantity();
  };
  updateQuantity();
  $("product-detail-add").onclick = () => {
    if (!quantity.reportValidity()) return;
    addProduct(product, Number(quantity.value));
    $("product-dialog").close();
  };
  $("product-dialog").showModal();
}
function renderCart() {
  $("cart-items").replaceChildren();
  let count = 0;
  for (const p of products.filter((p) => cart[p.id])) {
    count += cart[p.id];
    const row = el("div", "", "cart-row");
    const top = el("div", "", "cart-row-top");
    top.append(el("strong", p.name), el("span", money(p.price * cart[p.id])));
    const quantity = el("div", "", "quantity");
    for (const [label, delta] of [
      ["−", -1],
      ["+", 1],
    ]) {
      const button = el("button", label);
      button.setAttribute(
        "aria-label",
        `${delta < 0 ? "Retirer" : "Ajouter"} une unité de ${p.name}`,
      );
      button.onclick = () => {
        cart[p.id] = Math.min(cart[p.id] + delta, 99);
        if (!cart[p.id]) delete cart[p.id];
        saveCart();
      };
      quantity.append(button);
      if (delta === -1) quantity.append(el("span", String(cart[p.id])));
    }
    row.append(top, quantity);
    $("cart-items").append(row);
  }
  if (!count)
    $("cart-items").append(el("p", "Votre panier attend vos coups de cœur."));
  $("cart-count").textContent = String(count);
  $("cart-total").textContent = money(total(cart, products));
  $("checkout").disabled = count === 0;
}
for (const name of ["Tout", ...new Set(products.map((p) => p.category))]) {
  const button = el("button", name, name === "Tout" ? "active" : "");
  button.setAttribute("aria-pressed", String(name === "Tout"));
  button.onclick = () => {
    category = name;
    currentPage = 1;
    for (const b of $("filters").children) {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    }
    renderProducts();
  };
  $("filters").append(button);
}
function resetProducts() {
  currentPage = 1;
  renderProducts();
}
$("search").addEventListener("input", resetProducts);
$("sort").addEventListener("change", resetProducts);
$("product-close").onclick = () => $("product-dialog").close();
$("cart-open").onclick = () => $("cart-dialog").showModal();
$("cart-close").onclick = () => $("cart-dialog").close();
$("cart-dialog").addEventListener("click", (e) => {
  if (e.target === $("cart-dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
$("checkout").onclick = () => {
  if (!Object.keys(cart).length) return;
  checkoutId ||= crypto.randomUUID();
  recordOrder(checkoutId, cart);
  const reference = "HC-" + checkoutId.slice(0, 8).toUpperCase();
  window.open(
    whatsappUrl(shop.whatsapp, `${reference}\n${orderMessage(cart, products)}`),
    "_blank",
    "noopener,noreferrer",
  );
};
const contactUrl = whatsappUrl(
  shop.whatsapp,
  "Bonjour Hafssa 🌸 Je souhaite en savoir plus sur vos créations au crochet.",
);
for (const id of ["contact-whatsapp", "collection-contact"]) {
  $(id).href = contactUrl;
  $(id).target = "_blank";
  $(id).rel = "noopener noreferrer";
}
if (live?.settings) {
  const settings = live.settings;
  document.querySelector(".announcement > span").textContent =
    settings.announcement;
  document.querySelector(".hero-copy > p").textContent =
    settings.heroDescription;
  document.querySelector(".hero-copy > p").classList.add("live-description");
  for (const brand of document.querySelectorAll(".brand-name")) {
    const textNode = [...brand.childNodes].find(
      (n) => n.nodeType === 3 && n.textContent.trim(),
    );
    if (textNode) textNode.textContent = settings.name;
  }
  document.title = `${settings.name} — Un petit monde fait main`;
  for (const link of document.querySelectorAll(
    'a[href*="instagram.com/hafssacrochet"]',
  ))
    link.href = settings.instagram;
  for (const number of document.querySelectorAll(".contact-number")) {
    const local = settings.whatsapp.startsWith("212")
      ? "0" + settings.whatsapp.slice(3)
      : "+" + settings.whatsapp;
    number.textContent = local.startsWith("0")
      ? local.match(/.{1,2}/g).join(" ")
      : local;
  }
  document.querySelector(".cart-bottom p").textContent =
    `${settings.deliveryNote} Aucun paiement n’est effectué sur ce site.`;
  document.querySelector(".detail-delivery").textContent =
    settings.deliveryNote;
}
for (const id of ["contact-whatsapp", "collection-contact"])
  $(id).addEventListener("click", () => track("contact"));
track("pageview");
$("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
