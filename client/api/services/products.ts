import { http } from '../http';
import { Product } from '../../types';

const API_BASE_URL = '/inventory/products';

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Product.
 * * NOTA: La entidad Product ahora se define únicamente por sus datos maestros (incluyendo FKs).
 * La información de Stock (InventoryItem) se gestiona a través de otro servicio.
 */


export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await http.get<Product[]>(API_BASE_URL);
        

        console.log("[Products API]  Data recibida de /inventory/products:", response.data);
        
        return response.data;
    } catch (error) {

        console.error("[Products API]  Error al obtener productos:", error);
        throw error;
    }
};



export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {

    const response = await http.post<Product>(API_BASE_URL, productData);
    return response.data;
};



export const updateProduct = async (id: number, productData: Omit<Product, 'id'>): Promise<Product> => {

    const response = await http.put<Product>(`${API_BASE_URL}/${id}`, productData);
    return response.data;
};


export const deleteProduct = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};


export const getProductById = async (id: number): Promise<Product> => {
    const response = await http.get<Product>(`${API_BASE_URL}/${id}`);
    return response.data;
};
