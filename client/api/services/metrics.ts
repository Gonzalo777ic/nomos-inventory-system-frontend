import { getProducts } from "./products";
import { Product } from "../../types/inventory/products";

import { getProductTotalStock } from "./inventory-items";

/**
 * Función que simula la obtención de métricas para el dashboard.
 */
export async function getDashboardData() {
  const products = await getProducts();
  const salesToday = Math.floor(10 + Math.random() * 20);
  const revenueToday = Math.round(salesToday * 15.75 * 100) / 100;
  const salesTrend = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(
      Date.now() - (13 - i) * 24 * 60 * 60 * 1000,
    ).toLocaleDateString(),
    value: Math.floor(5 + Math.random() * 30),
  }));
  return { products: products.length, salesToday, revenueToday, salesTrend };
}

/**
 * Obtiene hasta 5 productos cuyo stock total sea bajo (<= 5).
 */
export async function getLowStockProducts() {
  const products = await getProducts();

  const productsWithStockPromises = products.map(async (product) => {
    const totalStock = await getProductTotalStock(product.id as number);

    return { ...product, stock: totalStock };
  });

  const productsWithStock = await Promise.all(productsWithStockPromises);

  return productsWithStock
    .filter((p) => p.stock <= 5)

    .map(({ stock, ...rest }) => rest as Product)
    .slice(0, 5);
}
