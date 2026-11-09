const $ = (id) => document.getElementById(id);
let state = null,
  productPage = 1,
  editingProduct = null,
  editingOrder = null;
const labels = {
  requested: "Nouvelle demande",
  confirmed: "Confirmée",
  completed: "Terminée",
  cancelled: "Annulée",
};
const money = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(n || 0);
const date = (value) =>
  new Intl.DateTimeFormat("fr-MA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date(value));
const asset = (path) => (path?.startsWith("./") ? "/" + path.slice(2) : path);
const el = (tag, text, className) => {
  const n = document.createElement(tag);
  if (text !== undefined && text !== null) n.textContent = String(text);
  if (className) n.className = className;
  return n;
};
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("visible"), 3500);
}
function loginView() {
  $("dashboard").hidden = true;
  $("login-view").hidden = false;
}
async function api(path, { method = "GET", body } = {}) {
  const form = body instanceof FormData;
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body && !form ? { "Content-Type": "application/json" } : {},
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const result = await response
    .json()
    .catch(() => ({ error: "Réponse du service indisponible." }));
  if (!response.ok) {
    if (response.status === 401 && !path.endsWith("/login")) loginView();
    throw new Error(result.error || "Impossible de terminer cette opération.");
  }
  return result;
}
function panel(name) {
  for (const n of document.querySelectorAll(".panel"))
    n.hidden = n.id !== `panel-${name}`;
  for (const b of document.querySelectorAll(".sidebar [data-panel]"))
    b.classList.toggle("selected", b.dataset.panel === name);
  $("panel-title").textContent = {
    overview: "Vue d’ensemble",
    orders: "Demandes WhatsApp",
    visitors: "Visiteurs et activité",
    products: "Les créations",
    settings: "Paramètres",
  }[name];
}
for (const button of document.querySelectorAll("[data-panel]"))
  button.addEventListener("click", () => panel(button.dataset.panel));
async function loadState() {
  $("dashboard-status").textContent = "Actualisation des données…";
  $("refresh").disabled = true;
  try {
    state = await api("/api/admin/state?days=" + $("period").value);
    renderOverview();
    renderVisitors();
    renderProducts();
    renderOrders();
    for (const [name, value] of Object.entries(state.settings)) {
      const input = $("settings-form").elements.namedItem(name);
      if (input) input.value = value;
    }
    $("dashboard-status").textContent =
      `Mis à jour à ${new Intl.DateTimeFormat("fr-MA", { timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date())} · ${state.products.filter((p) => p.active).length} créations visibles`;
  } catch (error) {
    $("dashboard-status").textContent = error.message;
    toast(error.message);
  } finally {
    $("refresh").disabled = false;
  }
}
$("login-form").onsubmit = async (event) => {
  event.preventDefault();
  $("login-submit").disabled = true;
  $("login-message").textContent = "";
  try {
    await api("/api/admin/login", {
      method: "POST",
      body: { password: $("password").value },
    });
    $("password").value = "";
    $("login-view").hidden = true;
    $("dashboard").hidden = false;
    await loadState();
  } catch (error) {
    $("login-message").textContent = error.message;
  } finally {
    $("login-submit").disabled = false;
  }
};
$("logout").onclick = async () => {
  try {
    await api("/api/admin/logout", { method: "POST", body: {} });
    loginView();
    state = null;
  } catch (error) {
    toast(error.message);
  }
};
$("refresh").onclick = loadState;
$("period").onchange = loadState;
function renderOverview() {
  const sum = (key) => state.daily.reduce((n, d) => n + Number(d[key] || 0), 0);
  const metrics = [
    ["Pages vues", sum("views"), "Chargements mesurés de la boutique"],
    [
      "Sessions mesurées",
      sum("sessions"),
      "Par session de navigation et par jour",
    ],
    [
      "Demandes WhatsApp",
      state.orderSummary.requests,
      "Demandes enregistrées sur la période",
    ],
    [
      "Chiffre d’affaires validé",
      money(state.orderSummary.revenue),
      `${state.orderSummary.completed || 0} demande(s) marquée(s) terminée(s)`,
    ],
    ["Contacts WhatsApp", sum("contacts"), "Clics sur les liens de contact"],
    ["Ajouts au panier", sum("adds"), "Actions sur les créations"],
  ];
  $("metrics").replaceChildren(
    ...metrics.map(([label, value, note]) => {
      const card = el("article", null, "metric");
      card.append(
        el("div", label, "metric-label"),
        el("div", value, "metric-value"),
        el("div", note, "metric-note"),
      );
      return card;
    }),
  );
  $("measurement-start").textContent = state.measuringSince
    ? `Depuis le ${new Date(state.measuringSince + "T12:00:00Z").toLocaleDateString("fr-MA")}`
    : "Le suivi vient de commencer";
  const daily = new Map(state.daily.map((d) => [d.day, d]));
  const values = [];
  for (let i = 0; i < state.days; i++) {
    const day = new Date(
      new Date(state.since + "T12:00:00Z").getTime() + i * 86400000,
    )
      .toISOString()
      .slice(0, 10);
    values.push({
      day,
      views: daily.get(day)?.views || 0,
      sessions: daily.get(day)?.sessions || 0,
    });
  }
  $("traffic-chart").replaceChildren();
  const max = Math.max(1, ...values.map((d) => d.views));
  for (const d of values) {
    const bar = el("div", null, "chart-bar");
    bar.style.setProperty("--bar-height", `${(d.views / max) * 100}%`);
    bar.title = `${d.day} : ${d.views} page(s) vue(s), ${d.sessions} session(s)`;
    $("traffic-chart").append(bar);
  }
  if (!values.some((d) => d.views))
    $("traffic-chart").append(
      el("span", "Les premières visites apparaîtront ici.", "chart-zero"),
    );
  $("top-products").replaceChildren();
  for (const top of state.top) {
    const p = state.products.find((p) => p.id === top.id);
    if (!p) continue;
    const row = el("div", null, "top-product"),
      img = el("img");
    img.src = asset(p.image);
    img.alt = "";
    row.append(
      img,
      el("span", p.name),
      el("small", `${top.views} vues · ${top.adds} ajouts`),
    );
    $("top-products").append(row);
  }
  if (!$("top-products").children.length)
    $("top-products").append(
      el("p", "Aucune fiche consultée pour le moment.", "empty"),
    );
  $("recent-orders").replaceChildren(orderTable(state.orders.slice(0, 5)));
}
const actionLabels = {
  pageview: "Ouverture de la boutique",
  productview: "Produit consulté",
  addtocart: "Ajout au panier",
  contact: "Contact WhatsApp",
  cartopen: "Ouverture du panier",
  category: "Catégorie choisie",
  cataloguepage: "Page du catalogue",
  checkoutstart: "Début du formulaire",
  orderrequest: "Demande WhatsApp enregistrée",
  section: "Rubrique ouverte",
  social: "Réseau social / Academy",
};
function renderVisitors() {
  const e = state.engagement || {};
  const metrics = [
    ["Sessions suivies", e.visits || 0, "Sur la période sélectionnée"],
    [
      "Actives récemment",
      e.active || 0,
      "Une action dans les 5 dernières minutes",
    ],
    ["Sessions avec ajout", e.shoppers || 0, "Au moins un ajout au panier"],
    [
      "Taux de demande",
      e.visits ? ((100 * e.requests) / e.visits).toFixed(1) + " %" : "0 %",
      "Sessions avec demande / sessions suivies",
    ],
  ];
  $("visitor-metrics").replaceChildren(
    ...metrics.map(([label, value, note]) => {
      const card = el("article", null, "metric");
      card.append(
        el("div", label, "metric-label"),
        el("div", value, "metric-value"),
        el("div", note, "metric-note"),
      );
      return card;
    }),
  );
  $("visit-funnel").replaceChildren();
  for (const [label, count] of [
    ["Visite de la boutique", e.visits],
    ["Consultation d’un produit", e.viewers],
    ["Ajout au panier", e.shoppers],
    ["Demande enregistrée", e.requests],
  ]) {
    const row = el("div", null, "visit-funnel-row");
    row.append(el("span", label), el("strong", count || 0));
    $("visit-funnel").append(row);
  }
  $("visit-breakdown").replaceChildren();
  for (const [title, rows] of [
    ["Appareils", state.devices || []],
    ["Provenance", state.sources || []],
  ]) {
    $("visit-breakdown").append(el("h3", title));
    for (const row of rows) {
      const line = el("div", null, "visit-funnel-row");
      line.append(el("span", row.label), el("strong", row.count));
      $("visit-breakdown").append(line);
    }
    if (!rows.length)
      $("visit-breakdown").append(
        el("p", "En attente des premières visites.", "muted"),
      );
  }
  const visits = state.visitSessions || [];
  $("visit-sessions").replaceChildren(
    visits.length
      ? table(
          [
            "Session",
            "Dernière activité",
            "Appareil",
            "Provenance",
            "Actions",
            "Parcours",
          ],
          visits.map((v) => {
            const button = el("button", "Voir le parcours", "secondary");
            button.onclick = () => showVisit(v);
            return [
              "Visite " + v.session.slice(0, 8),
              date(v.last),
              v.device || "inconnu",
              v.source || "inconnu",
              v.actions,
              button,
            ];
          }),
        )
      : el("p", "Les premières sessions apparaîtront ici.", "empty"),
  );
  $("visit-tracking-note").textContent = state.detailedTrackingSince
    ? "Suivi détaillé disponible depuis le " +
      date(state.detailedTrackingSince) +
      ". Actualisez pour charger les dernières actions."
    : "Le suivi détaillé commence avec les prochaines visites.";
}
async function showVisit(visit) {
  try {
    const { events } = await api(
      "/api/admin/visits/" + encodeURIComponent(visit.session),
    );
    $("visit-journey-title").textContent =
      "Parcours · visite " + visit.session.slice(0, 8);
    $("visit-journey").replaceChildren(
      ...events.map((event) => {
        const row = el("div", null, "visit-event");
        const product = state.products.find((p) => p.id === event.product_id);
        row.append(
          el("small", date(event.created)),
          el("strong", actionLabels[event.type] || event.type),
        );
        if (product || event.detail)
          row.append(el("span", product?.name || event.detail));
        return row;
      }),
    );
    $("visit-journey-card").hidden = false;
    $("visit-journey-card").scrollIntoView({
      block: "start",
      behavior: "instant",
    });
  } catch (error) {
    toast(error.message);
  }
}
function table(headers, rows) {
  const t = el("table"),
    head = el("thead"),
    tr = el("tr");
  for (const h of headers) tr.append(el("th", h));
  head.append(tr);
  t.append(head);
  const body = el("tbody");
  for (const cells of rows) {
    const row = el("tr");
    for (const cell of cells) {
      const td = el("td");
      if (cell instanceof Node) td.append(cell);
      else td.textContent = String(cell ?? "");
      row.append(td);
    }
    body.append(row);
  }
  t.append(body);
  return t;
}
function orderTable(orders) {
  if (!orders.length)
    return el("p", "Aucune demande pour cette sélection.", "empty");
  return table(
    ["Référence", "Date", "Montant", "Statut", ""],
    orders.map((order) => {
      const button = el("button", "Ouvrir", "text-button");
      button.onclick = () => openOrder(order);
      return [
        order.reference,
        date(order.created),
        money(order.total),
        el("span", labels[order.status], "badge " + order.status),
        button,
      ];
    }),
  );
}
function filteredOrders() {
  const query = $("order-search").value.toLocaleLowerCase("fr"),
    filter = $("order-filter").value;
  return state.orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      `${o.reference} ${o.customer?.name || ""} ${o.customer?.city || ""} ${o.customer?.phone || ""} ${o.items.map((i) => i.name).join(" ")}`
        .toLocaleLowerCase("fr")
        .includes(query),
  );
}
function renderOrders() {
  if (state) $("orders-table").replaceChildren(orderTable(filteredOrders()));
}
$("order-search").oninput = renderOrders;
$("order-filter").onchange = renderOrders;
function openOrder(order) {
  editingOrder = order;
  $("order-title").textContent = order.reference;
  $("order-details").replaceChildren(el("p", date(order.created), "muted"));
  if (order.customer?.name) {
    $("order-details").append(
      el("p", `Client : ${order.customer.name}`),
      el("p", `Ville : ${order.customer.city}`),
      el("p", `Téléphone : ${order.customer.phone}`),
    );
  }
  for (const item of order.items) {
    const row = el("div", null, "order-line");
    row.append(
      el("span", `${item.name} × ${item.quantity}`),
      el("strong", money(item.price * item.quantity)),
    );
    $("order-details").append(row);
  }
  $("order-details").append(el("div", money(order.total), "order-total"));
  $("order-form").elements.status.value = order.status;
  $("order-form").elements.note.value = order.note;
  $("order-form-status").textContent = "";
  $("order-editor").showModal();
}
$("order-editor-close").onclick = () => $("order-editor").close();
$("order-form").onsubmit = async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector(
    "button[type=submit],button.primary",
  );
  button.disabled = true;
  try {
    await api("/api/admin/orders/" + encodeURIComponent(editingOrder.id), {
      method: "PUT",
      body: {
        status: event.currentTarget.elements.status.value,
        note: event.currentTarget.elements.note.value,
      },
    });
    $("order-editor").close();
    toast("Suivi enregistré.");
    await loadState();
  } catch (error) {
    $("order-form-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
};
$("export-orders").onclick = () => {
  const rows = [
    [
      "Référence",
      "Date",
      "Client",
      "Ville",
      "Téléphone",
      "Statut",
      "Créations",
      "Montant DH",
      "Note privée",
    ],
    ...filteredOrders().map((o) => [
      o.reference,
      date(o.created),
      o.customer?.name || "",
      o.customer?.city || "",
      o.customer?.phone || "",
      labels[o.status],
      o.items.map((i) => `${i.name} × ${i.quantity}`).join(" / "),
      o.total,
      o.note,
    ]),
  ];
  const safe = (value) => {
    let s = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const data = "\uFEFF" + rows.map((row) => row.map(safe).join(";")).join("\n");
  const url = URL.createObjectURL(
    new Blob([data], { type: "text/csv;charset=utf-8" }),
  );
  const a = el("a");
  a.href = url;
  a.download = "hafssa-demandes.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function filteredProducts() {
  const query = $("product-search").value.toLocaleLowerCase("fr"),
    filter = $("product-filter").value;
  return state.products.filter(
    (p) =>
      (filter === "all" || (filter === "active" ? p.active : !p.active)) &&
      `${p.name} ${p.category}`.toLocaleLowerCase("fr").includes(query),
  );
}
function renderProducts() {
  if (!state) return;
  const filtered = filteredProducts(),
    pages = Math.max(1, Math.ceil(filtered.length / 20));
  productPage = Math.min(productPage, pages);
  $("products-summary").textContent =
    `${state.products.length} créations · ${state.products.filter((p) => p.active).length} visibles en boutique`;
  const rows = filtered
    .slice((productPage - 1) * 20, productPage * 20)
    .map((p) => {
      const name = el("div", null, "table-name"),
        img = el("img"),
        label = el("span", p.name);
      img.src = asset(p.image);
      img.alt = "";
      img.loading = "lazy";
      label.append(el("small", p.category));
      name.append(img, label);
      const edit = el("button", "Modifier", "text-button");
      edit.onclick = () => openProduct(p);
      return [
        name,
        money(p.price),
        el(
          "span",
          p.active ? "Visible" : "Masquée",
          "badge " + (p.active ? "" : "hidden"),
        ),
        edit,
      ];
    });
  $("products-table").replaceChildren(
    rows.length
      ? table(["Création", "Prix", "Boutique", ""], rows)
      : el("p", "Aucune création pour cette sélection.", "empty"),
  );
  $("products-page").textContent = `${productPage} / ${pages}`;
  $("products-prev").disabled = productPage === 1;
  $("products-next").disabled = productPage === pages;
}
$("product-search").oninput = () => {
  productPage = 1;
  renderProducts();
};
$("product-filter").onchange = () => {
  productPage = 1;
  renderProducts();
};
$("products-prev").onclick = () => {
  productPage--;
  renderProducts();
};
$("products-next").onclick = () => {
  productPage++;
  renderProducts();
};
function imageOption(path, label) {
  const option = el("option", label || path.split("/").pop());
  option.value = path;
  return option;
}
function openProduct(product) {
  editingProduct = product || null;
  const form = $("product-form");
  form.reset();
  $("product-upload").value = "";
  $("product-editor-title").textContent = product
    ? "Modifier la création"
    : "Une nouvelle création";
  $("product-form-status").textContent = "";
  const images = new Set(state.products.flatMap((p) => p.images || [p.image]));
  $("product-image").replaceChildren(
    ...[...images].map((path) => imageOption(path)),
  );
  $("category-options").replaceChildren(
    ...[...new Set(state.products.map((p) => p.category))].map((name) => {
      const option = el("option");
      option.value = name;
      return option;
    }),
  );
  if (product) {
    for (const key of ["name", "category", "price", "description", "image"])
      form.elements.namedItem(key).value = product[key];
    form.elements.active.checked = product.active;
  } else {
    form.elements.active.checked = true;
    form.elements.price.value = "";
  }
  updatePreview();
  $("product-editor").showModal();
}
function updatePreview() {
  $("product-preview").src = asset($("product-image").value);
}
$("add-product").onclick = () => openProduct();
$("product-editor-close").onclick = () => $("product-editor").close();
$("product-image").onchange = updatePreview;
$("product-upload").onchange = async () => {
  const file = $("product-upload").files[0];
  if (!file) return;
  if (file.size > 1000000) {
    $("product-form-status").textContent =
      "Photo trop volumineuse : 1 Mo maximum.";
    return;
  }
  $("product-save").disabled = true;
  $("product-form-status").textContent = "Import de la photo…";
  try {
    const data = new FormData();
    data.append("file", file);
    const result = await api("/api/admin/upload", {
      method: "POST",
      body: data,
    });
    $("product-image").append(
      imageOption(result.url, "Nouvelle photo importée"),
    );
    $("product-image").value = result.url;
    updatePreview();
    $("product-form-status").textContent = "Photo prête.";
  } catch (error) {
    $("product-form-status").textContent = error.message;
  } finally {
    $("product-save").disabled = false;
  }
};
$("product-form").onsubmit = async (event) => {
  event.preventDefault();
  $("product-save").disabled = true;
  const form = event.currentTarget;
  const data = {
    name: form.elements.name.value,
    category: form.elements.category.value,
    price: Number(form.elements.price.value),
    description: form.elements.description.value,
    image: form.elements.image.value,
    active: form.elements.active.checked,
  };
  try {
    await api(
      "/api/admin/products" +
        (editingProduct ? "/" + encodeURIComponent(editingProduct.id) : ""),
      { method: editingProduct ? "PUT" : "POST", body: data },
    );
    $("product-editor").close();
    toast("Création enregistrée.");
    await loadState();
  } catch (error) {
    $("product-form-status").textContent = error.message;
  } finally {
    $("product-save").disabled = false;
  }
};
$("settings-form").onsubmit = async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector(".primary");
  button.disabled = true;
  $("settings-status").textContent = "";
  try {
    await api("/api/admin/settings", {
      method: "PUT",
      body: Object.fromEntries(new FormData(event.currentTarget)),
    });
    $("settings-status").textContent =
      "Paramètres enregistrés et disponibles en boutique.";
    toast("Votre boutique a été mise à jour.");
    await loadState();
  } catch (error) {
    $("settings-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
};
try {
  const session = await api("/api/admin/session");
  if (!session.configured) {
    $("login-form").hidden = true;
    $("login-message").textContent =
      "Configuration requise : ajoutez le secret ADMIN_PASSWORD dans Cloudflare → Worker → Settings → Variables and Secrets. Choisissez au moins 14 caractères, puis déployez le changement. Ne partagez pas ce mot de passe dans le chat.";
  } else if (session.authenticated) {
    $("login-view").hidden = true;
    $("dashboard").hidden = false;
    await loadState();
  }
} catch (error) {
  $("login-message").textContent =
    "Le service d’administration est indisponible. Réessayez après le déploiement.";
}
