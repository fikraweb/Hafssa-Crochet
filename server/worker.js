import { products as baseProducts, shop } from "../catalogue.js";
import uploadSource from "../assets/products/upload-source.json";
import originalSource from "../assets/products/source.json";
const sourceImages = new Map([
  ...uploadSource.photos.map((p) => [p.sha256, p.path]),
  ...originalSource.images.map((p) => [
    p.sha256,
    `./assets/products/${p.id}.jpeg`,
  ]),
]);
const defaults = {
  name: shop.name,
  whatsapp: shop.whatsapp,
  instagram: "https://www.instagram.com/hafssacrochet/",
  announcement: "CRÉÉ À LA MAIN. GARDÉ PRÈS DU CŒUR.",
  heroDescription:
    "Des poupées qui ont une âme.\nDes compagnons à aimer longtemps.\nEt dans chaque maille, un peu de Hafssa.",
  deliveryNote:
    "La disponibilité et les frais de livraison seront confirmés sur WhatsApp.",
};
const dayKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const statuses = new Set(["requested", "confirmed", "completed", "cancelled"]);
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
const hash = async (text) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
const equal = (a, b) => {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (
      !url.pathname.startsWith("/api/") &&
      !url.pathname.startsWith("/media/")
    )
      return env.ASSETS.fetch(request);
    if (!env.STORE) return json({ error: "Service indisponible." }, 503);
    if (
      !["GET", "HEAD"].includes(request.method) &&
      request.headers.get("Origin") !== url.origin
    )
      return json({ error: "Origine refusée." }, 403);
    const headers = new Headers(request.headers);
    headers.set(
      "X-Client-Key",
      await hash(request.headers.get("CF-Connecting-IP") || "local"),
    );
    try {
      return await env.STORE.get(env.STORE.idFromName("hafssa-main")).fetch(
        new Request(request, { headers }),
      );
    } catch {
      return json(
        { error: "Le service est temporairement indisponible." },
        503,
      );
    }
  },
};
export class ShopStore {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.sql = ctx.storage.sql;
    this.sql
      .exec(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,expires INTEGER NOT NULL,fingerprint TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS metrics (day TEXT PRIMARY KEY,views INTEGER NOT NULL DEFAULT 0,sessions INTEGER NOT NULL DEFAULT 0,contacts INTEGER NOT NULL DEFAULT 0,adds INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS visitors (day TEXT NOT NULL,session TEXT NOT NULL,PRIMARY KEY(day,session));
   CREATE TABLE IF NOT EXISTS product_metrics (day TEXT NOT NULL,id TEXT NOT NULL,views INTEGER NOT NULL DEFAULT 0,adds INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,id));
   CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY,reference TEXT NOT NULL,created TEXT NOT NULL,day TEXT NOT NULL,items TEXT NOT NULL,total INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'requested',note TEXT NOT NULL DEFAULT '');
   CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY,type TEXT NOT NULL,data BLOB NOT NULL);`);
    if (!this.sql.exec("PRAGMA table_info(orders)").toArray().some(column => column.name === "customer"))
      this.sql.exec("ALTER TABLE orders ADD COLUMN customer TEXT NOT NULL DEFAULT '{}'");
  }
  one(query, ...args) {
    return this.sql.exec(query, ...args).toArray()[0];
  }
  settings() {
    return {
      ...defaults,
      ...JSON.parse(
        this.one("SELECT data FROM settings WHERE id=1")?.data || "{}",
      ),
    };
  }
  products() {
    const overrides = new Map(
      this.sql
        .exec("SELECT id,data FROM products")
        .toArray()
        .map((p) => [p.id, JSON.parse(p.data)]),
    );
    return [
      ...baseProducts.map((p) => ({
        ...p,
        active: true,
        ...overrides.get(p.id),
      })),
      ...Array.from(overrides)
        .filter(([id]) => !baseProducts.some((p) => p.id === id))
        .map(([, p]) => p),
    ];
  }
  limited(key, max, seconds) {
    const now = Date.now();
    const row = this.one(
      "SELECT hits,expires FROM rate_limits WHERE key=?",
      key,
    );
    if (!row || row.expires < now) {
      this.sql.exec(
        "INSERT OR REPLACE INTO rate_limits VALUES (?,1,?)",
        key,
        now + seconds * 1000,
      );
      return false;
    }
    if (row.hits >= max) return true;
    this.sql.exec("UPDATE rate_limits SET hits=hits+1 WHERE key=?", key);
    return false;
  }
  configured() {
    return (
      typeof this.env.ADMIN_PASSWORD === "string" &&
      this.env.ADMIN_PASSWORD.length >= 14
    );
  }
  async authenticated(request) {
    if (!this.configured()) return false;
    const token = request.headers
      .get("Cookie")
      ?.match(/(?:^|;\s*)hafssa_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (!token) return false;
    const session = this.one(
      "SELECT expires,fingerprint FROM sessions WHERE token=?",
      await hash(token),
    );
    return (
      !!session &&
      session.expires > Date.now() &&
      equal(session.fingerprint, await hash(this.env.ADMIN_PASSWORD))
    );
  }
  async body(request) {
    if (!request.headers.get("Content-Type")?.startsWith("application/json"))
      throw new Error("Format JSON requis.");
    if (Number(request.headers.get("Content-Length")) > 64000)
      throw new Error("Requête trop grande.");
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Corps requis.");
    const chunks = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 64000) {
        await reader.cancel();
        throw new Error("Requête trop grande.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }
  async fetch(request) {
    const url = new URL(request.url),
      path = url.pathname,
      method = request.method,
      actor = request.headers.get("X-Client-Key") || "local";
    try {
      if (path.startsWith("/media/") && method === "GET") {
        const media = this.one(
          "SELECT type,data FROM media WHERE id=?",
          path.slice(7),
        );
        return media
          ? new Response(media.data, {
              headers: {
                "Content-Type": media.type,
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff",
              },
            })
          : json({ error: "Image introuvable." }, 404);
      }
      if (path === "/api/store" && method === "GET")
        return json({
          products: this.products().filter((p) => p.active),
          settings: this.settings(),
        });
      if (path === "/api/admin/session" && method === "GET")
        return json({
          authenticated: await this.authenticated(request),
          configured: this.configured(),
        });
      if (path === "/api/admin/login" && method === "POST") {
        if (!this.configured())
          return json(
            {
              error:
                "Ajoutez le secret ADMIN_PASSWORD (14 caractères minimum) dans Cloudflare.",
            },
            503,
          );
        if (this.limited("login:" + actor, 8, 900))
          return json(
            { error: "Trop de tentatives. Réessayez dans 15 minutes." },
            429,
          );
        const data = await this.body(request);
        if (
          typeof data.password !== "string" ||
          !equal(await hash(data.password), await hash(this.env.ADMIN_PASSWORD))
        )
          return json({ error: "Mot de passe incorrect." }, 401);
        const token = [...crypto.getRandomValues(new Uint8Array(32))]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
        this.sql.exec(
          "INSERT INTO sessions VALUES (?,?,?)",
          await hash(token),
          Date.now() + 8 * 3600000,
          await hash(this.env.ADMIN_PASSWORD),
        );
        this.sql.exec("DELETE FROM rate_limits WHERE key=?", "login:" + actor);
        return json({ ok: true }, 200, {
          "Set-Cookie": `hafssa_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`,
        });
      }
      if (path === "/api/admin/logout" && method === "POST") {
        const token = request.headers
          .get("Cookie")
          ?.match(/hafssa_session=([a-f0-9]{64})/)?.[1];
        if (token)
          this.sql.exec(
            "DELETE FROM sessions WHERE token=?",
            await hash(token),
          );
        return json({ ok: true }, 200, {
          "Set-Cookie":
            "hafssa_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
        });
      }
      if (path === "/api/events" && method === "POST") {
        if (this.limited("events:" + actor, 120, 60))
          return json({ error: "Limite atteinte." }, 429);
        const data = await this.body(request),
          day = dayKey();
        if (
          !["pageview", "productview", "addtocart", "contact"].includes(
            data.type,
          )
        )
          return json({ error: "Événement invalide." }, 400);
        if (
          ["productview", "addtocart"].includes(data.type) &&
          !this.products().some((p) => p.id === data.productId && p.active)
        )
          return json({ error: "Produit introuvable." }, 404);
        this.sql.exec("INSERT OR IGNORE INTO metrics(day) VALUES (?)", day);
        if (data.type === "pageview") {
          let first = 0;
          if (
            typeof data.session === "string" &&
            /^[a-f0-9-]{36}$/.test(data.session) &&
            !this.one(
              "SELECT 1 FROM visitors WHERE day=? AND session=?",
              day,
              data.session,
            )
          ) {
            this.sql.exec(
              "INSERT INTO visitors VALUES (?,?)",
              day,
              data.session,
            );
            first = 1;
          }
          this.sql.exec(
            "UPDATE metrics SET views=views+1,sessions=sessions+? WHERE day=?",
            first,
            day,
          );
        }
        if (data.type === "contact")
          this.sql.exec(
            "UPDATE metrics SET contacts=contacts+1 WHERE day=?",
            day,
          );
        if (["productview", "addtocart"].includes(data.type)) {
          this.sql.exec(
            "INSERT OR IGNORE INTO product_metrics(day,id) VALUES (?,?)",
            day,
            data.productId,
          );
          if (data.type === "productview")
            this.sql.exec(
              "UPDATE product_metrics SET views=views+1 WHERE day=? AND id=?",
              day,
              data.productId,
            );
          else {
            this.sql.exec(
              "UPDATE product_metrics SET adds=adds+1 WHERE day=? AND id=?",
              day,
              data.productId,
            );
            this.sql.exec("UPDATE metrics SET adds=adds+1 WHERE day=?", day);
          }
        }
        const cutoff = dayKey(new Date(Date.now() - 90 * 86400000));
        this.sql.exec("DELETE FROM visitors WHERE day<?", cutoff);
        this.sql.exec("DELETE FROM metrics WHERE day<?", cutoff);
        this.sql.exec("DELETE FROM product_metrics WHERE day<?", cutoff);
        this.sql.exec("DELETE FROM sessions WHERE expires<?", Date.now());
        this.sql.exec("DELETE FROM rate_limits WHERE expires<?", Date.now());
        return json({ ok: true });
      }
      if (path === "/api/orders" && method === "POST") {
        if (this.limited("orders:" + actor, 20, 3600))
          return json(
            { error: "Trop de demandes. Contactez Hafssa directement." },
            429,
          );
        const data = await this.body(request);
        if (
          !/^[a-f0-9-]{36}$/.test(data.requestId) ||
          !data.items ||
          typeof data.items !== "object" ||
          Array.isArray(data.items)
        )
          return json({ error: "Demande invalide." }, 400);
        const customer = data.customer;
        if (!customer || typeof customer.name !== "string" || typeof customer.city !== "string" || typeof customer.phone !== "string" || customer.name.trim().length < 2 || customer.name.length > 100 || customer.city.trim().length < 2 || customer.city.length > 100 || !/^[+0-9 ()-]{8,24}$/.test(customer.phone) || customer.phone.replace(/\D/g, "").length < 8)
          return json({ error: "Nom, ville et téléphone valides obligatoires." }, 400);
        const contact = { name: customer.name.trim(), city: customer.city.trim(), phone: customer.phone.trim() };
        const previous = this.one(
          "SELECT reference FROM orders WHERE id=?",
          data.requestId,
        );
        if (previous) return json({ reference: previous.reference });
        const entries = Object.entries(data.items);
        if (!entries.length || entries.length > 100)
          return json({ error: "Panier invalide." }, 400);
        const catalogue = this.products(),
          items = [];
        let total = 0;
        for (const [id, quantity] of entries) {
          const p = catalogue.find((p) => p.id === id && p.active);
          if (
            !p ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 99
          )
            return json({ error: "Produit ou quantité invalide." }, 400);
          items.push({ id, name: p.name, quantity, price: p.price });
          total += Math.round(p.price * 100) * quantity;
        }
        const reference = "HC-" + data.requestId.slice(0, 8).toUpperCase();
        this.sql.exec(
          "INSERT INTO orders(id,reference,created,day,items,total,customer) VALUES (?,?,?,?,?,?,?)",
          data.requestId,
          reference,
          new Date().toISOString(),
          dayKey(),
          JSON.stringify(items),
          total,
          JSON.stringify(contact),
        );
        return json({ reference }, 201);
      }
      if (!path.startsWith("/api/admin/"))
        return json({ error: "Introuvable." }, 404);
      if (!(await this.authenticated(request)))
        return json({ error: "Connexion requise." }, 401);
      if (path === "/api/admin/state" && method === "GET") {
        const days = [7, 30, 90].includes(Number(url.searchParams.get("days")))
          ? Number(url.searchParams.get("days"))
          : 30;
        const since = dayKey(new Date(Date.now() - (days - 1) * 86400000));
        const daily = this.sql
          .exec("SELECT * FROM metrics WHERE day>=? ORDER BY day", since)
          .toArray();
        const orders = this.sql
          .exec("SELECT * FROM orders ORDER BY created DESC LIMIT 200")
          .toArray()
          .map((o) => ({
            ...o,
            total: o.total / 100,
            items: JSON.parse(o.items),
            customer: JSON.parse(o.customer),
          }));
        const orderSummary = this.one(
          "SELECT COUNT(*) as requests,COALESCE(SUM(CASE WHEN status='completed' THEN total ELSE 0 END),0) as revenue,SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM orders WHERE day>=?",
          since,
        );
        const top = this.sql
          .exec(
            "SELECT id,SUM(views) as views,SUM(adds) as adds FROM product_metrics WHERE day>=? GROUP BY id ORDER BY views DESC,adds DESC LIMIT 10",
            since,
          )
          .toArray();
        return json({
          settings: this.settings(),
          products: this.products(),
          daily,
          orders,
          top,
          orderSummary: {
            ...orderSummary,
            revenue: orderSummary.revenue / 100,
          },
          days,
          since,
          measuringSince:
            this.one("SELECT MIN(day) as day FROM metrics")?.day || null,
        });
      }
      if (path === "/api/admin/settings" && method === "PUT") {
        const data = await this.body(request),
          next = this.settings();
        const limits = {
          name: 70,
          whatsapp: 15,
          instagram: 200,
          announcement: 150,
          heroDescription: 400,
          deliveryNote: 300,
        };
        for (const [key, max] of Object.entries(limits)) {
          if (
            typeof data[key] !== "string" ||
            data[key].trim().length > max ||
            !data[key].trim()
          )
            return json({ error: `Champ invalide : ${key}` }, 400);
          next[key] = data[key].trim();
        }
        if (!/^[1-9]\d{7,14}$/.test(next.whatsapp))
          return json(
            { error: "WhatsApp : format international sans + ni espaces." },
            400,
          );
        const instagram = new URL(next.instagram);
        if (
          instagram.protocol !== "https:" ||
          !["instagram.com", "www.instagram.com"].includes(instagram.hostname)
        )
          return json({ error: "Lien Instagram invalide." }, 400);
        this.sql.exec(
          "INSERT OR REPLACE INTO settings VALUES (1,?)",
          JSON.stringify(next),
        );
        return json({ ok: true });
      }
      if (path === "/api/admin/upload" && method === "POST") {
        if (Number(request.headers.get("Content-Length")) > 1100000)
          return json({ error: "Image trop volumineuse (1 Mo maximum)." }, 413);
        const form = await request.formData(),
          file = form.get("file");
        if (!(file instanceof File) || file.size > 1000000)
          return json({ error: "Image requise, 1 Mo maximum." }, 400);
        const bytes = new Uint8Array(await file.arrayBuffer());
        let type = "";
        if (
          bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71
        )
          type = "image/png";
        else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
          type = "image/jpeg";
        else if (
          new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
          new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
        )
          type = "image/webp";
        if (!type)
          return json({ error: "Formats acceptés : JPEG, PNG, WebP." }, 400);
        const id = [
          ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        ]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
        const original = sourceImages.get(id);
        if (original) return json({ url: original, existing: true });
        this.sql.exec(
          "INSERT OR IGNORE INTO media VALUES (?,?,?)",
          id,
          type,
          bytes.buffer,
        );
        return json({ url: "/media/" + id }, 201);
      }
      if (
        (path === "/api/admin/products" && method === "POST") ||
        (path.startsWith("/api/admin/products/") && method === "PUT")
      ) {
        const data = await this.body(request),
          id =
            method === "POST"
              ? "custom-" + crypto.randomUUID()
              : decodeURIComponent(path.slice("/api/admin/products/".length));
        const current = this.products().find((p) => p.id === id);
        if (method === "PUT" && !current)
          return json({ error: "Produit introuvable." }, 404);
        if (
          typeof data.name !== "string" ||
          !data.name.trim() ||
          data.name.length > 100 ||
          typeof data.category !== "string" ||
          !data.category.trim() ||
          data.category.length > 40 ||
          typeof data.description !== "string" ||
          data.description.length > 1000 ||
          !Number.isFinite(data.price) ||
          Math.round(data.price * 100) < 1 ||
          data.price > 100000 ||
          typeof data.active !== "boolean"
        )
          return json(
            {
              error:
                "Vérifiez le nom, la catégorie, la description et le prix.",
            },
            400,
          );
        const knownImages = new Set(
          baseProducts.flatMap((p) => p.images || [p.image]),
        );
        const mediaId =
          typeof data.image === "string" &&
          data.image.match(/^\/media\/([a-f0-9]{64}|[a-f0-9-]{36})$/)?.[1];
        if (
          !knownImages.has(data.image) &&
          !(mediaId && this.one("SELECT 1 FROM media WHERE id=?", mediaId))
        )
          return json(
            {
              error: "Choisissez une photo du catalogue ou importez une image.",
            },
            400,
          );
        const next = {
          ...current,
          id,
          name: data.name.trim(),
          category: data.category.trim(),
          description: data.description.trim(),
          price: Math.round(data.price * 100) / 100,
          active: data.active,
          image: data.image,
          images:
            current?.image === data.image
              ? current.images || [data.image]
              : [data.image],
        };
        if (
          this.products().some(
            (p) =>
              p.id !== id &&
              p.active &&
              next.active &&
              (p.image === next.image ||
                p.name.toLocaleLowerCase() === next.name.toLocaleLowerCase()),
          )
        )
          return json(
            { error: "Un produit actif utilise déjà ce nom ou cette photo." },
            409,
          );
        this.sql.exec(
          "INSERT OR REPLACE INTO products VALUES (?,?)",
          id,
          JSON.stringify(next),
        );
        return json({ ok: true, id });
      }
      if (path.startsWith("/api/admin/orders/") && method === "PUT") {
        const id = decodeURIComponent(path.slice("/api/admin/orders/".length)),
          data = await this.body(request);
        if (
          !statuses.has(data.status) ||
          typeof data.note !== "string" ||
          data.note.length > 1000
        )
          return json({ error: "Statut ou note invalide." }, 400);
        if (!this.one("SELECT 1 FROM orders WHERE id=?", id))
          return json({ error: "Demande introuvable." }, 404);
        this.sql.exec(
          "UPDATE orders SET status=?,note=? WHERE id=?",
          data.status,
          data.note,
          id,
        );
        return json({ ok: true });
      }
      return json({ error: "Introuvable." }, 404);
    } catch (error) {
      return json(
        {
          error:
            error instanceof SyntaxError
              ? "Requête invalide."
              : "Impossible de traiter cette modification.",
        },
        400,
      );
    }
  }
}
