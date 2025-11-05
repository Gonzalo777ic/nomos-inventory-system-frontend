import { http } from '../http';
// Importamos el tipo base, aunque el payload de envío puede ser diferente
import { ProductAttributeValue } from '../../types'; 

// URL base del controlador: /api/inventory/product-attribute-values
const API_BASE_URL = '/inventory/product-attribute-values';

// --- Tipos de Payload (Basados en el Controller) ---

/**
 * Payload para AÑADIR un nuevo valor de atributo a un producto.
 * (Basado en el @PostMapping que recibe el objeto completo)
 */
export interface AddAttributeValuePayload {
    productId: number;
    attributeId: number;
    value: string;
}

/**
 * Payload para ACTUALIZAR el valor de un atributo (el ID se pasa por URL).
 * (Basado en el @PutMapping que solo recibe el objeto con el valor)
 */
export interface UpdateAttributeValuePayload {
    value: string;
}


// --- Funciones de Servicio ---

/**
 * 1. Obtiene todos los valores de atributos asignados a un producto específico.
 * GET /api/inventory/product-attribute-values/product/{productId}
 */
export const getAttributeValuesByProduct = async (productId: number): Promise<ProductAttributeValue[]> => {
    const response = await http.get<ProductAttributeValue[]>(`${API_BASE_URL}/product/${productId}`);
    return response.data;
};

/**
 * 2. Añade un nuevo valor de atributo a un producto (POST).
 * POST /api/inventory/product-attribute-values
 */
export const addProductAttributeValue = async (payload: AddAttributeValuePayload): Promise<ProductAttributeValue> => {
    const response = await http.post<ProductAttributeValue>(API_BASE_URL, payload);
    return response.data;
};

/**
 * 3. Actualiza el valor de un atributo específico para un producto (PUT).
 * PUT /api/inventory/product-attribute-values/{productId}/{attributeId}
 */
export const updateProductAttributeValue = async (
    productId: number, 
    attributeId: number, 
    payload: UpdateAttributeValuePayload
): Promise<ProductAttributeValue> => {
    const response = await http.put<ProductAttributeValue>(`${API_BASE_URL}/${productId}/${attributeId}`, payload);
    return response.data;
};

/**
 * 4. Elimina un valor de atributo de un producto (DELETE).
 * DELETE /api/inventory/product-attribute-values/{productId}/{attributeId}
 */
export const deleteProductAttributeValue = async (
    productId: number, 
    attributeId: number
): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${productId}/${attributeId}`);
};