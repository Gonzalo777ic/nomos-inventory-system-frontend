import { httpStore } from "../httpStore";
import { SaleDetailPayload } from "./saleDetailService";

const API_BASE_URL = '/api/store/sales';
const BASE_URL = 'http://localhost:8083/api/store';
const SALES_URL = `${BASE_URL}/sales`;



export interface Sale {
    id: number;
    clientId: number | null;
    saleDate: string;
    type: 'BOLETA' | 'FACTURA' | string;
    totalAmount: number;
    totalDiscount: number;
    status: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | string;
    sellerId: number;
}



export interface SalePayload {
    clientId: number | null; 
    saleDate: string; 
    type: string;
    sellerId: number;
}


export interface SaleTypeRef {
    key: string;
    description: string;
}


export interface SaleCreationDTO extends SalePayload {

    details: Omit<SaleDetailPayload, 'tempId'>[]; 
}


export const SaleService = {
    
    getAll: async (): Promise<Sale[]> => {
        const response = await httpStore.get<Sale[]>(SALES_URL);
        return response.data;
    },

    
    getById: async (id: number): Promise<Sale> => {
        const response = await httpStore.get<Sale>(`${SALES_URL}/${id}`);
        return response.data;
    },

    
    createSaleWithDetails: async (data: SaleCreationDTO): Promise<Sale> => {

        const response = await httpStore.post<Sale>(SALES_URL, data);
        return response.data;
    },

    /** 3. Crear una nueva venta (POST)
     * Se mantiene por si se usa en otro flujo, pero se recomienda usar createSaleWithDetails para ventas nuevas.
     */
    create: async (data: SalePayload): Promise<Sale> => {

        const response = await httpStore.post<Sale>(SALES_URL, data);
        return response.data;
    },

    
    updateStatus: async (id: number, newStatus: string): Promise<Sale> => {
        const response = await httpStore.put<Sale>(`${SALES_URL}/${id}/status`, newStatus, {
             headers: { 'Content-Type': 'text/plain' }
        });
        return response.data;
    },

    /**
     * Obtener los tipos de comprobante de venta desde el backend.
     * GET /api/store/sales/types
     */
    getSaleTypes: async (): Promise<SaleTypeRef[]> => {
        const response = await httpStore.get<SaleTypeRef[]>(`${SALES_URL}/types`);
        return response.data;
    }
};