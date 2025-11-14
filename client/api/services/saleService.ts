import { httpStore } from "../httpStore";
import { SaleDetailPayload } from "./saleDetailService"; // 🔑 Importar el payload del detalle (sin el tempId)

const API_BASE_URL = '/api/store/sales'; // Esto no se usa, pero se mantiene si es parte de tu convención
const BASE_URL = 'http://localhost:8083/api/store';
const SALES_URL = `${BASE_URL}/sales`;


// 🎯 Interfaz para la Cabecera de la Venta (Sale) - Sin cambios
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

// 🎯 Payload para la creación/edición de CABECERA (solo los campos que envían el cliente)
// Se han quitado totalAmount, totalDiscount y status, ya que el backend los calcula/asigna.
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

// 🔑 NUEVO DTO: Envío de Cabecera + Detalles (Transacción POS)
export interface SaleCreationDTO extends SalePayload {
    // Al mapear el carrito (SaleDetailPayload del frontend), quitaremos el 'tempId'
    details: Omit<SaleDetailPayload, 'tempId'>[]; 
}


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

    /** 🔑 NUEVO MÉTODO PARA EL FLUJO POS: Crear venta completa */
    createSaleWithDetails: async (data: SaleCreationDTO): Promise<Sale> => {
        // Llama al POST /api/store/sales modificado en el backend
        const response = await httpStore.post<Sale>(SALES_URL, data);
        return response.data;
    },

    /** 3. Crear una nueva venta (POST)
     * Se mantiene por si se usa en otro flujo, pero se recomienda usar createSaleWithDetails para ventas nuevas.
     */
    create: async (data: SalePayload): Promise<Sale> => {
        // En una implementación real, aquí se enviarían todos los detalles de la venta
        const response = await httpStore.post<Sale>(SALES_URL, data);
        return response.data;
    },

    /** 4. Actualizar el estado de la venta (PUT) */
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