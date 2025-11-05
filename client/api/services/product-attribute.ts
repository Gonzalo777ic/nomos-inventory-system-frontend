import { http } from '../http';
import { ProductAttribute } from '../../types'; // Importamos la definición de ProductAttribute

// URL base del controlador de Spring Boot: /api/inventory/attributes
const API_BASE_URL = '/inventory/attributes'; 

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad ProductAttribute.
 */

// 1. Obtener lista de atributos (GET)
export const getProductAttributes = async (): Promise<ProductAttribute[]> => {
    const response = await http.get<ProductAttribute[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear un nuevo atributo (POST)
// Usamos Omit para excluir 'id' del payload
export const createProductAttribute = async (attributeData: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> => {
    const response = await http.post<ProductAttribute>(API_BASE_URL, attributeData);
    return response.data;
};

// 3. Editar un atributo existente (PUT)
// Usamos Omit para excluir 'id' del payload
export const updateProductAttribute = async (id: number, attributeData: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> => {
    const response = await http.put<ProductAttribute>(`${API_BASE_URL}/${id}`, attributeData);
    return response.data;
};

// 4. Eliminar un atributo (DELETE)
export const deleteProductAttribute = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener un atributo por ID (GET)
// (Basado en el endpoint /api/inventory/attributes/{id} del controller)
export const getProductAttributeById = async (id: number): Promise<ProductAttribute> => {
    const response = await http.get<ProductAttribute>(`${API_BASE_URL}/${id}`);
    return response.data;
};