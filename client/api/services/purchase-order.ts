import { http } from '@/api/http'; 
import { 
    PurchaseOrder, 
    PurchaseOrderPayload, 
    OrderStatus
} from '../../types/index';

const BASE_URL = '/v1/purchase-orders';

export const getPurchaseOrders = async (params?: { filterSupplierId?: number }): Promise<PurchaseOrder[]> => {

    const queryString = params?.filterSupplierId 
        ? `?filterSupplierId=${params.filterSupplierId}` 
        : '';

    const { data } = await http.get(`${BASE_URL}${queryString}`);
    return data;
};

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrder> => {
    const { data } = await http.get(`${BASE_URL}/${id}`);
    return data;
};

export const createPurchaseOrder = async (payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {
    const { data } = await http.post(BASE_URL, payload); 
    return data;
};

export const updatePurchaseOrder = async (id: number, payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {
    const { data } = await http.put(`${BASE_URL}/${id}`, payload);
    return data;
};


export const updateOrderStatus = async (id: number, status: OrderStatus): Promise<PurchaseOrder> => {

    const { data } = await http.patch(`${BASE_URL}/${id}/status`, { status });
    return data;
};

export const deletePurchaseOrder = async (id: number): Promise<void> => {
    await http.delete(`${BASE_URL}/${id}`);
};