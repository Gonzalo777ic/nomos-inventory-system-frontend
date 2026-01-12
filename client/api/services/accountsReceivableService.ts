import { httpStore } from "../httpStore";
import { AccountsReceivable, Installment } from "../../types/store";

const AR_URL = 'http://localhost:8083/api/store/accounts-receivable';

export const AccountsReceivableService = {

    /**
     * Obtener todas las cuentas por cobrar.
     * Útil para reportes financieros globales.
     */
    getAll: async (): Promise<AccountsReceivable[]> => {
        const response = await httpStore.get<AccountsReceivable[]>(AR_URL);
        return response.data;
    },

    /**
     * Obtener la cuenta por cobrar asociada a una venta específica.
     * Incluye las cuotas (installments) y su estado actual.
     */
    getBySaleId: async (saleId: number): Promise<AccountsReceivable> => {
        const response = await httpStore.get<AccountsReceivable>(`${AR_URL}/sale/${saleId}`);
        return response.data;
    },

    /**
     * Obtener solo las cuotas de una cuenta por cobrar.
     */
    getInstallments: async (arId: number): Promise<Installment[]> => {
        const response = await httpStore.get<Installment[]>(`${AR_URL}/${arId}/installments`);
        return response.data;
    },

    /**
     * Obtener una cuenta por cobrar específica por su ID.
     */
    getById: async (id: number): Promise<AccountsReceivable> => {
        const response = await httpStore.get<AccountsReceivable>(`${AR_URL}/${id}`);
        return response.data;
    },
};