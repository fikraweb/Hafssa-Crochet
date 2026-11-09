import { products, shop } from "./catalogue.js";
import { total, orderMessage, whatsappUrl } from "./cart.js";
const $ = (id) => document.getElementById(id);
const money = (value) => `${new Intl.NumberFormat("fr-MA").format(value)} DH`;
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem("hafssa-cart") || "{}");
  for (const p of products)
    if (Number.isInteger(saved[p.id]) && saved[p.id] > 0)
      cart[p.id] = Math.min(saved[p.id], 99);
} catch {}
let category = "Tout";
const pageSize = 12;
let visibleLimit = pageSize;
const toast = (message) => {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("visible"), 2600);
};
function saveCart() {
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
  const visible = filtered.slice(0, visibleLimit);
  $("catalogue-status").textContent =
    `${visible.length} sur ${filtered.length} création${filtered.length === 1 ? "" : "s"}`;
  $("load-more").hidden = visible.length >= filtered.length;
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
    if (p.images?.length > 1) {
      const count = el("button", `${p.images.length} photos`, "photo-count");
      count.setAttribute(
        "aria-label",
        `Voir les ${p.images.length} photos de ${p.name}`,
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
function addProduct(product) {
  cart[product.id] = Math.min((cart[product.id] || 0) + 1, 99);
  saveCart();
  toast("Création ajoutée au panier");
}
function showProduct(product) {
  const images = product.images?.length ? product.images : [product.image];
  let activeImage = 0;
  const thumbs = $("product-thumbnails");
  thumbs.replaceChildren();
  function showImage(index) {
    activeImage = (index + images.length) % images.length;
    $("product-detail-image").src = images[activeImage];
    $("product-detail-image").alt =
      `${product.name} — photo ${activeImage + 1} sur ${images.length}`;
    $("gallery-position").textContent = `${activeImage + 1} / ${images.length}`;
    for (const [i, button] of [...thumbs.children].entries())
      button.setAttribute("aria-pressed", String(i === activeImage));
  }
  for (const [index, image] of images.entries()) {
    const button = el("button");
    button.type = "button";
    button.setAttribute("aria-label", `Photo ${index + 1} de ${product.name}`);
    const thumbnail = el("img");
    thumbnail.src = image;
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
  $("product-detail-price").textContent = money(product.price);
  $("product-detail-add").onclick = () => {
    addProduct(product);
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
    visibleLimit = pageSize;
    for (const b of $("filters").children) {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    }
    renderProducts();
  };
  $("filters").append(button);
}
function resetProducts() {
  visibleLimit = pageSize;
  renderProducts();
}
$("search").addEventListener("input", resetProducts);
$("sort").addEventListener("change", resetProducts);
$("load-more").onclick = () => {
  visibleLimit += pageSize;
  renderProducts();
};
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
  if (Object.keys(cart).length)
    window.open(
      whatsappUrl(shop.whatsapp, orderMessage(cart, products)),
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
$("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
