// Pure catalogue presentation: never mutates the server catalogue or cart order.
export function catalogueView(products, category = "Tout", sort = "original") {
  const visible = products.filter(p => category === "Tout" || p.category === category);
  if (sort === "price-asc") visible.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") visible.sort((a, b) => b.price - a.price);
  else if (sort === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
  return visible;
}
