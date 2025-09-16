import { listProducts } from "./products";

export async function getDashboardData() {
  const products = await listProducts();
  const salesToday = Math.floor(10 + Math.random() * 20);
  const revenueToday = Math.round(salesToday * 15.75 * 100) / 100;
  const salesTrend = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: Math.floor(5 + Math.random() * 30),
  }));
  return { products: products.length, salesToday, revenueToday, salesTrend };
}

export async function getLowStockProducts() {
  const products = await listProducts();
  return products.filter((p) => p.stock <= 5).slice(0, 5);
}
