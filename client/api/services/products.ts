import { http } from '../http';

// 🎯 Definición de la Interfaz del Producto
export interface Product {
    id?: number; 
    sku: string;
    name: string;
    brand: string; // Corregido: de 'author' a 'brand'
    price: number;
    // 🛑 ELIMINADO: Ya no gestionamos el stock en la entidad maestra
    // stock: number; 
    imageUrl: string; 
    supplier: string;
}

const API_BASE_URL = '/inventory/products'; // 🎯 Asumiendo que la ruta correcta es /api/inventory/products

// 1. Obtener lista de productos (GET)
// Nota: La respuesta del backend aún debe contener un campo para stock si lo tiene, 
// o el frontend tendrá que calcularlo/obtenerlo de otra fuente (StockEntryController).
// Por ahora, asumiremos que si el backend lo tiene, el frontend lo ignora.
export const getProducts = async (): Promise<Product[]> => {
    const response = await http.get<Product[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear un nuevo producto (POST)
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    // La data enviada ya no contiene stock
    const response = await http.post<Product>(API_BASE_URL, productData);
    return response.data;
};

// 3. Editar un producto existente (PUT)
export const updateProduct = async (id: number, productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await http.put<Product>(`${API_BASE_URL}/${id}`, productData);
    return response.data;
};

// 4. Eliminar un producto (DELETE)
export const deleteProduct = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};
