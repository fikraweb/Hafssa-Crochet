import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
const origin = process.env.TEST_BASE_URL || "http://127.0.0.1:8787";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw new Error("Ces tests écrivent uniquement dans un Worker local.");
const password = (await fs.readFile(".dev.vars", "utf8")).match(
  /^ADMIN_PASSWORD=(.+)$/m,
)?.[1];
assert.ok(password, "Créez un secret de test local dans .dev.vars.");
let cookie = "";
async function request(
  path,
  { method = "GET", body, auth = true, headers = {} } = {},
) {
  const form = body instanceof FormData;
  return fetch(origin + path, {
    method,
    headers: {
      Origin: origin,
      ...(auth && cookie ? { Cookie: cookie } : {}),
      ...(body && !form ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });
}
async function data(path, options) {
  const response = await request(path, options);
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.json();
}

test("authentification : données privées, origine, secret et cookie sécurisé", async () => {
  assert.equal(
    (await request("/api/admin/state", { auth: false })).status,
    401,
  );
  assert.equal(
    (
      await request("/api/admin/login", {
        method: "POST",
        body: { password },
        auth: false,
        headers: { Origin: "https://example.invalid" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/api/admin/login", {
        method: "POST",
        body: { password: "incorrect-password" },
        auth: false,
      })
    ).status,
    401,
  );
  const response = await request("/api/admin/login", {
    method: "POST",
    body: { password },
    auth: false,
  });
  assert.equal(response.status, 200);
  const header = response.headers.get("Set-Cookie");
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Strict/);
  cookie = header.split(";")[0];
  const session = await data("/api/admin/session");
  assert.equal(session.authenticated, true);
  const state = await data("/api/admin/state");
  assert.ok(!JSON.stringify(state).includes(password));
  assert.ok(state.products.length >= 83);
});
test("statistiques réelles, commandes idempotentes, prix calculé côté serveur et statut", async () => {
  const shop = await data("/api/store"),
    product = shop.products[0];
  const before = await data("/api/admin/state");
  const session = randomUUID();
  for (const type of [
    "pageview",
    "pageview",
    "productview",
    "addtocart",
    "contact",
  ])
    assert.equal(
      (
        await request("/api/events", {
          method: "POST",
          body: { type, session, productId: product.id },
          auth: false,
        })
      ).status,
      200,
    );
  const id = randomUUID();
  const customer = { name: "Client test", city: "Rabat", phone: "0612345678" };
  const payload = { requestId: id, items: { [product.id]: 2 }, total: 1, customer };
  for (const invalid of [undefined, {}, {...customer, name: " "}, {...customer, phone: "invalid"}]) {
    assert.equal((await request("/api/orders", {method: "POST", body: {...payload, requestId: randomUUID(), customer: invalid}, auth: false})).status, 400);
  }
  const order = await data("/api/orders", {
    method: "POST",
    body: payload,
    auth: false,
  });
  assert.match(order.reference, /^HC-/);
  const repeated = await data("/api/orders", {
    method: "POST",
    body: payload,
    auth: false,
  });
  assert.equal(repeated.reference, order.reference);
  assert.equal(
    (
      await request("/api/orders", {
        method: "POST",
        body: { requestId: randomUUID(), items: { [product.id]: -1 }, customer },
        auth: false,
      })
    ).status,
    400,
  );
  const after = await data("/api/admin/state");
  const recorded = after.orders.find((o) => o.id === id);
  assert.equal(recorded.total, product.price * 2);
  assert.deepEqual(recorded.customer, customer);
  assert.equal(after.orderSummary.requests, before.orderSummary.requests + 1);
  assert.ok(after.daily.reduce((n, d) => n + d.views, 0) >= 2);
  assert.ok(
    after.top.some((p) => p.id === product.id && p.views >= 1 && p.adds >= 1),
  );
  await data("/api/admin/orders/" + id, {
    method: "PUT",
    body: { status: "completed", note: "Test local" },
  });
  const completed = await data("/api/admin/state");
  assert.equal(
    completed.orderSummary.revenue,
    after.orderSummary.revenue + product.price * 2,
  );
  await data("/api/admin/orders/" + id, {
    method: "PUT",
    body: { status: "cancelled", note: "Test local terminé" },
  });
});
test("paramètres persistants et validation des liens/numéros", async () => {
  const initial = (await data("/api/admin/state")).settings;
  const changed = {
    ...initial,
    announcement: "Un petit atelier en test local",
  };
  await data("/api/admin/settings", { method: "PUT", body: changed });
  assert.equal(
    (await data("/api/store")).settings.announcement,
    changed.announcement,
  );
  assert.equal(
    (
      await request("/api/admin/settings", {
        method: "PUT",
        body: { ...initial, instagram: "javascript:alert(1)" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/admin/settings", {
        method: "PUT",
        body: { ...initial, whatsapp: "not-a-number" },
      })
    ).status,
    400,
  );
  await data("/api/admin/settings", { method: "PUT", body: initial });
});
test("import photo sans perte, création, anti-doublon, édition et masquage public", async () => {
  const bytes = await fs.readFile("assets/logo-instagram.jpg");
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), "photo.jpg");
  const upload = await data("/api/admin/upload", {
    method: "POST",
    body: form,
  });
  const photo = await request(upload.url, { auth: false });
  assert.equal(photo.headers.get("Content-Type"), "image/jpeg");
  assert.equal(
    createHash("sha256")
      .update(Buffer.from(await photo.arrayBuffer()))
      .digest("hex"),
    createHash("sha256").update(bytes).digest("hex"),
  );
  const product = {
    name: "Création de test " + randomUUID().slice(0, 8),
    category: "Tests locaux",
    price: 199.5,
    description: "Création réservée aux tests locaux",
    image: upload.url,
    active: true,
  };
  const created = await data("/api/admin/products", {
    method: "POST",
    body: product,
  });
  assert.ok(
    (await data("/api/store")).products.some((p) => p.id === created.id),
  );
  assert.equal(
    (
      await request("/api/admin/products", {
        method: "POST",
        body: { ...product, name: "Autre nom" },
      })
    ).status,
    409,
  );
  await data("/api/admin/products/" + created.id, {
    method: "PUT",
    body: { ...product, price: 215, active: false },
  });
  assert.ok(
    !(await data("/api/store")).products.some((p) => p.id === created.id),
  );
  assert.equal(
    (await data("/api/admin/state")).products.find((p) => p.id === created.id)
      .price,
    215,
  );
  const duplicatePhoto = new FormData();
  duplicatePhoto.append(
    "file",
    new Blob([await fs.readFile("assets/products/collection/photo-088.png")], {
      type: "image/png",
    }),
    "original.png",
  );
  const existing = await data("/api/admin/upload", {
    method: "POST",
    body: duplicatePhoto,
  });
  assert.equal(existing.url, "./assets/products/collection/photo-088.png");
  assert.equal(
    (
      await request("/api/admin/products", {
        method: "POST",
        body: { ...product, name: "Doublon du catalogue", image: existing.url },
      })
    ).status,
    409,
  );
  const invalid = new FormData();
  invalid.append(
    "file",
    new Blob(['<svg onload="alert(1)"></svg>'], { type: "image/svg+xml" }),
    "bad.svg",
  );
  assert.equal(
    (await request("/api/admin/upload", { method: "POST", body: invalid }))
      .status,
    400,
  );
});
test("déconnexion révoque la session", async () => {
  await data("/api/admin/logout", { method: "POST", body: {} });
  assert.equal((await request("/api/admin/state")).status, 401);
});
