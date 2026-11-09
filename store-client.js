let session;
function visitSession() {
  try {
    const last = Number(sessionStorage.getItem("hafssa-visit-last"));
    session = sessionStorage.getItem("hafssa-visit");
    if (!session || !last || Date.now() - last > 30 * 60000) {
      session = crypto.randomUUID();
      sessionStorage.setItem("hafssa-visit", session);
    }
    sessionStorage.setItem("hafssa-visit-last", String(Date.now()));
  } catch {
    session ||= crypto.randomUUID();
  }
  return session;
}
function source() {
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    if (host === location.hostname) return "direct";
    for (const name of ["instagram", "facebook", "tiktok", "youtube"])
      if (host === name + ".com" || host.endsWith("." + name + ".com"))
        return name;
    if (/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com)$/.test(host))
      return "recherche";
    return "autre";
  } catch {
    return "direct";
  }
}
let available = false;
export async function loadStore() {
  try {
    const response = await fetch("/api/store", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data.products) || !data.settings) return null;
    available = true;
    return data;
  } catch {
    return null;
  }
}
export function track(type, productId, detail) {
  if (available)
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        productId,
        detail,
        session: visitSession(),
        device:
          innerWidth <= 760
            ? "mobile"
            : innerWidth <= 1100
              ? "tablette"
              : "ordinateur",
        source: source(),
      }),
      keepalive: true,
    }).catch(() => {});
}
export function recordOrder(requestId, items, customer) {
  if (available)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        items,
        customer,
        session: visitSession(),
      }),
      keepalive: true,
    }).catch(() => {});
}
