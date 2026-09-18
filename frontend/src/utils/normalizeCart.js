// ── Helper: turn the backend's cart shape into the flat shape the UI uses ──
export function normalizeCart(apiCart) {
  if (!apiCart || !apiCart.items) return []
  return apiCart.items.map(i => ({
    id: i.product.id,
    name: i.product.name,
    tagline: i.product.tagline,
    price: i.product.price,
    size: i.product.size,
    img: i.product.img,
    accent: i.product.accent,
    qty: i.quantity,
  }))
}
