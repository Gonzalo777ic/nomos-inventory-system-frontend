import { httpStore } from "../httpStore";

const API_BASE_URL = '/api/store/sales';

const BASE_URL = 'http://localhost:8083/api/store';
const SALES_URL = `${BASE_URL}/sales`;


// 🎯 Interfaz para la Cabecera de la Venta (Sale)
export interface Sale {
    id: number;
    clientId: number | null; // Puede ser nulo
    saleDate: string; // LocalDateTime
    type: 'BOLETA' | 'FACTURA' | string;
    totalAmount: number;
    totalDiscount: number;
    status: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | string;
    sellerId: number;
}

// 🎯 Payload para la creación/edición
export type SalePayload = Omit<Sale, 'id'>;


export interface SaleTypeRef {
    key: string;
    description: string;
}

// 🎯 DTO para la Creación completa (Asumiendo que incluiremos detalles más tarde)
// Por ahora, solo usamos Sale, pero esto es lo que se usaría en un sistema real:
// export interface SaleCreationDTO extends SalePayload {
//     details: SaleDetailPayload[];
// }


export const SaleService = {
    /** 1. Obtener lista de ventas (GET) */
    getAll: async (): Promise<Sale[]> => {
        const response = await httpStore.get<Sale[]>(SALES_URL);
        return response.data;
    },

    /** 2. Obtener una venta por ID (GET) */
    getById: async (id: number): Promise<Sale> => {
        const response = await httpStore.get<Sale>(`${SALES_URL}/${id}`);
        return response.data;
    },

    /** 3. Crear una nueva venta (POST) */
    create: async (data: SalePayload): Promise<Sale> => {
        // En una implementación real, aquí se enviarían todos los detalles de la venta
        const response = await httpStore.post<Sale>(SALES_URL, data);
        return response.data;
    },

    /** 4. Actualizar el estado de la venta (PUT) */
    updateStatus: async (id: number, newStatus: string): Promise<Sale> => {
        // PUT /api/store/sales/{id}/status con el nuevo estado en el body
        const response = await httpStore.put<Sale>(`${SALES_URL}/${id}/status`, newStatus, {
             headers: { 'Content-Type': 'text/plain' } // El backend espera un String directo
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
    
    // No se implementará el update completo de la cabecera, solo el estado, por la complejidad del flujo de ventas.
};