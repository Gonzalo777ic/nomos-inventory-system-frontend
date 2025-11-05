import { http } from '@/api/http'; 
import { PurchaseOrder, PurchaseOrderPayload, PurchaseOrderDetail, PurchaseOrderDetailPayload } from '../../types/index';

const BASE_URL = '/v1/purchase-orders';

// --- Funciones de Cabecera (PurchaseOrder) ---

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    // Asume que este endpoint devuelve un listado de PurchaseOrder sin detalles anidados.
    const { data } = await http.get(BASE_URL);
    return data;
};

// ⭐ NOTA: getPurchaseOrderById fue simplificado. 
// Asumimos que el Controller de Spring que mapea {BASE_URL}/{id} devuelve la OC con detalles anidados.
export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrder> => {
    // Típicamente, un endpoint de detalle devuelve la cabecera y sus líneas.
    // Si tu backend no anida los detalles, deberás ajustar la respuesta aquí.
    const { data } = await http.get(`${BASE_URL}/${id}`);
    
    // Si el backend devuelve detalles, data es una PurchaseOrder completa.
    return data;
};

/**
 * Crea una nueva Orden de Compra enviando el payload completo.
 * @param payload - Datos de la OC, ahora con la estructura anidada correcta { supplier: { id: X } }
 */
export const createPurchaseOrder = async (payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {
    // ⭐ CORRECCIÓN CLAVE: Enviamos el payload completo que incluye la cabecera y el array de detalles.
    // El backend de Spring (controlador) debe ser capaz de recibir PurchaseOrderPayload
    // (con supplier:{id} y details:[{product:{id}, quantity, unitCost}]) y manejar la creación
    // transaccional de la cabecera y sus detalles.
    const { data } = await http.post(BASE_URL, payload); 
    return data;
};

/**
 * Actualiza una Orden de Compra existente.
 * @param id - ID de la OC a actualizar
 * @param payload - Datos de la OC, ahora con la estructura anidada correcta
 */
export const updatePurchaseOrder = async (id: number, payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {
    const { data } = await http.put(`${BASE_URL}/${id}`, payload);
    return data;
};

// ⭐ NUEVA FUNCIÓN: Eliminar Orden de Compra
export const deletePurchaseOrder = async (id: number): Promise<void> => {
    // El método DELETE devuelve 204 No Content si es exitoso
    await http.delete(`${BASE_URL}/${id}`);
};