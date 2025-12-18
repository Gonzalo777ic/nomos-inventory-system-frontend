import { http } from '@/api/http'; 
import { PurchaseOrder, PurchaseOrderPayload, PurchaseOrderDetail, PurchaseOrderDetailPayload } from '../../types/index';

const BASE_URL = '/v1/purchase-orders';



export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {

    const { data } = await http.get(BASE_URL);
    return data;
};



export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrder> => {


    const { data } = await http.get(`${BASE_URL}/${id}`);
    

    return data;
};

/**
 * Crea una nueva Orden de Compra enviando el payload completo.
 * @param payload - Datos de la OC, ahora con la estructura anidada correcta { supplier: { id: X } }
 */
export const createPurchaseOrder = async (payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {




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


export const deletePurchaseOrder = async (id: number): Promise<void> => {

    await http.delete(`${BASE_URL}/${id}`);
};