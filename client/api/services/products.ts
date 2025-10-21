import { http } from '../http';
// 🎯 Definición de la Interfaz del Producto (Asegúrate de que esta interfaz coincida con la del modelo Java)
export interface Product {
    id?: number; // Opcional para creación
    sku: string;
    name: string;
    author: string;
    price: number;
    stock: number;
    imageUrl: string; // Coincide con el backend
    supplier: string;
}

const API_BASE_URL = '/inventory/products';

// 1. Obtener lista de productos (GET)
export const getProducts = async (): Promise<Product[]> => {
    // Si la tabla no usa paginación todavía, puedes hacer un GET simple
    const response = await http.get<Product[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear un nuevo producto (POST)
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    // En el futuro, la subida de imagen se manejaría aquí antes de enviar el JSON,
    // o el backend esperaría un DTO con la imagen codificada o un multipart/form-data.
    // Por ahora, asumimos que imageUrl es una URL simple o se gestiona automáticamente.
    const response = await http.post<Product>(API_BASE_URL, productData);
    return response.data;
};

// Otras funciones CRUD (UPDATE, DELETE) irán aquí...
