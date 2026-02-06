import { http } from '../http';

import { ProductAttributeValue, ProductWithAttributeDetails, AddAttributeValuePayload, UpdateAttributeValuePayload } from '../../types';
const API_BASE_URL = '/inventory/product-attribute-values';


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
    const fullPayload = {
        productId: productId,
        attributeId: attributeId,
        value: payload.value
    };
    
    const response = await http.put<ProductAttributeValue>(
        `${API_BASE_URL}/${productId}/${attributeId}`, 
        fullPayload
    );
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

export const getProductsByAttribute = async (attributeId: number): Promise<ProductWithAttributeDetails[]> => {
    const response = await http.get<ProductWithAttributeDetails[]>(`${API_BASE_URL}/attribute/${attributeId}/details`);
    return response.data;
};