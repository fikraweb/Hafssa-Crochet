let session;
try {
  session = sessionStorage.getItem("hafssa-visit");
  if (!session) {
    session = crypto.randomUUID();
    sessionStorage.setItem("hafssa-visit", session);
  }
} catch {
  session = crypto.randomUUID();
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
export function track(type, productId) {
  if (available)
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, productId, session }),
      keepalive: true,
    }).catch(() => {});
}
export function recordOrder(requestId, items) {
  if (available)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, items }),
      keepalive: true,
    }).catch(() => {});
}
