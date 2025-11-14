import { http } from '../http';
import { Product } from '../../types'; // 🎯 Importamos la definición correcta de Product

const API_BASE_URL = '/inventory/products'; // Ruta base para el recurso Producto

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Product.
 * * NOTA: La entidad Product ahora se define únicamente por sus datos maestros (incluyendo FKs).
 * La información de Stock (InventoryItem) se gestiona a través de otro servicio.
 */

// 1. Obtener lista de productos (GET)
export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await http.get<Product[]>(API_BASE_URL);
        
        // 🔑 LOG DE DEPURACIÓN CLAVE: Muestra la data bruta recibida de la API
        console.log("[Products API] 📥 Data recibida de /inventory/products:", response.data);
        
        return response.data;
    } catch (error) {
        // 🔑 LOG de error
        console.error("[Products API] 🚨 Error al obtener productos:", error);
        throw error;
    }
};

// 2. Crear un nuevo producto (POST)
// Omitimos 'id' ya que se genera en el backend
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    // La data enviada debe incluir todas las IDs de FKs: brandId, categoryId, defaultSupplierId, unitOfMeasureId
    const response = await http.post<Product>(API_BASE_URL, productData);
    return response.data;
};

// 3. Editar un producto existente (PUT)
// Omitimos 'id' del cuerpo de la data, pero lo usamos en la ruta
export const updateProduct = async (id: number, productData: Omit<Product, 'id'>): Promise<Product> => {
    // Aseguramos que el cuerpo de la petición usa el tipo Product importado
    const response = await http.put<Product>(`${API_BASE_URL}/${id}`, productData);
    return response.data;
};

// 4. Eliminar un producto (DELETE)
export const deleteProduct = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener un producto por ID (GET) - Útil para el formulario de edición
export const getProductById = async (id: number): Promise<Product> => {
    const response = await http.get<Product>(`${API_BASE_URL}/${id}`);
    return response.data;
};
