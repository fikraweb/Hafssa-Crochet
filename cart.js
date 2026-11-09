export function total(items, products) {
  return products.reduce((sum, product) => sum + product.price * (items[product.id] || 0), 0);
}
export function orderMessage(items, products) {
  const lines = products.filter(p => items[p.id]).map(p => `${p.name} × ${items[p.id]} — ${p.price * items[p.id]} DH`);
  return `Bonjour Hafssa 🌸\nJe souhaite commander :\n${lines.join('\n')}\nTotal : ${total(items, products)} DH\nMerci de me confirmer la disponibilité et les frais de livraison.`;
}
export function whatsappUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
