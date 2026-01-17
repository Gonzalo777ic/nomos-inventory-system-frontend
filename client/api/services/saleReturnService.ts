import { httpStore } from "../httpStore";
import { SaleReturn, SaleReturnRequestPayload } from "../../types/store";

const BASE_URL = 'http://localhost:8083/api/store/sale-returns';

export const SaleReturnService = {

    /**
     * Crea un borrador de devolución.
     * Valida cantidades y calcula montos, pero no afecta inventario ni caja todavía.
     */
    createDraft: async (payload: SaleReturnRequestPayload): Promise<SaleReturn> => {
        const response = await httpStore.post<SaleReturn>(BASE_URL, payload);
        return response.data;
    },

    /**
     * Confirma la devolución.
     * Genera la Nota de Crédito, mueve el stock e impacta cuentas por cobrar.
     */
    confirm: async (returnId: number): Promise<SaleReturn> => {
        const response = await httpStore.post<SaleReturn>(`${BASE_URL}/${returnId}/confirm`);
        return response.data;
    },

    /**
     * Obtiene el historial de devoluciones de una venta específica.
     */
    getBySale: async (saleId: number): Promise<SaleReturn[]> => {
        const response = await httpStore.get<SaleReturn[]>(`${BASE_URL}/sale/${saleId}`);
        return response.data;
    },
    
    /**
     * Cancela un borrador (opcional, si implementaste el endpoint DELETE)
     */
    cancelDraft: async (returnId: number): Promise<void> => {
        await httpStore.delete(`${BASE_URL}/${returnId}`);
    }
};