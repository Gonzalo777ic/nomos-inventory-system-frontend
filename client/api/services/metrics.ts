import { getProducts, Product } from "./products"; // <-- CORRECCIÓN: Usar getProducts

export async function getDashboardData() {
  const products = await getProducts(); // <-- CORRECCIÓN: Usar getProducts()
  const salesToday = Math.floor(10 + Math.random() * 20);
  const revenueToday = Math.round(salesToday * 15.75 * 100) / 100;
  const salesTrend = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: Math.floor(5 + Math.random() * 30),
  }));
  return { products: products.length, salesToday, revenueToday, salesTrend };
}

export async function getLowStockProducts() {
  const products = await getProducts(); // <-- CORRECCIÓN: Usar getProducts()
  // Asumiendo que `Product` ahora tiene `stock` y `id`
  return products.filter((p: Product) => (p.stock || 0) <= 5).slice(0, 5);
}
