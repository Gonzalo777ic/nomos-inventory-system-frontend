import { getProducts, Product } from "./products";
// 🎯 Importar el servicio para obtener el stock calculado
import { getProductTotalStock } from "./inventory-items";

/**
 * Función que simula la obtención de métricas para el dashboard.
 */
export async function getDashboardData() {
  const products = await getProducts();
  const salesToday = Math.floor(10 + Math.random() * 20);
  const revenueToday = Math.round(salesToday * 15.75 * 100) / 100;
  const salesTrend = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: Math.floor(5 + Math.random() * 30),
  }));
  return { products: products.length, salesToday, revenueToday, salesTrend };
}

/**
 * Obtiene hasta 5 productos cuyo stock total sea bajo (<= 5).
 */
export async function getLowStockProducts() {
  const products = await getProducts();
  
  // 1. Crear un array de promesas para obtener el stock total de cada producto.
  const productsWithStockPromises = products.map(async (product) => {
    // 🛑 ERROR CORREGIDO: Ya no se usa p.stock. Se usa el servicio de inventario.
    const totalStock = await getProductTotalStock(product.id as number);
    
    // Devolvemos el producto con la propiedad stock agregada temporalmente para el filtrado.
    return { ...product, stock: totalStock };
  });

  // 2. Esperar a que todas las promesas se resuelvan.
  const productsWithStock = await Promise.all(productsWithStockPromises);
  
  // 3. Filtrar los productos con stock bajo y devolver los 5 primeros.
  // Notar que ahora podemos acceder a 'stock' porque lo inyectamos en el paso anterior.
  return productsWithStock
    .filter((p) => p.stock <= 5)
    // Usamos el tipo 'Product' original para el retorno, omitiendo el stock inyectado
    .map(({ stock, ...rest }) => rest as Product) 
    .slice(0, 5);
}