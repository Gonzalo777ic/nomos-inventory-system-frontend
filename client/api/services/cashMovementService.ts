import { httpStore } from "../httpStore";
import { CashMovement, CashMovementPayload, CashMovementFilter } from "../../types/store/cash";

const CASH_URL = 'http://localhost:8083/api/store/cash-movements';

export const CashMovementService = {
    
    /**
     * Obtener todos los movimientos.
     * Puede soportar filtros por query params si el backend lo implementa.
     */
    getAll: async (filters?: CashMovementFilter): Promise<CashMovement[]> => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.type) params.append('type', filters.type);
            if (filters.paymentMethodId) params.append('paymentMethodId', filters.paymentMethodId.toString());
        }

        const response = await httpStore.get<CashMovement[]>(`${CASH_URL}`, { params });
        return response.data;
    },

    /**
     * Obtener el resumen o movimientos del día (Arqueo rápido).
     * Útil para el Dashboard de Caja.
     */
    getDailyMovements: async (): Promise<CashMovement[]> => {
        const response = await httpStore.get<CashMovement[]>(`${CASH_URL}/daily`);
        return response.data;
    },

    /**
     * Obtener un movimiento por ID.
     */
    getById: async (id: number): Promise<CashMovement> => {
        const response = await httpStore.get<CashMovement>(`${CASH_URL}/${id}`);
        return response.data;
    },

    /**
     * Registrar un movimiento manual.
     * Principalmente para GASTOS (Salidas de efectivo, pago de servicios) 
     * o INGRESOS NO OPERATIVOS (Aporte de capital).
     */
    create: async (data: CashMovementPayload): Promise<CashMovement> => {
        const response = await httpStore.post<CashMovement>(CASH_URL, data);
        return response.data;
    },

    /**
     * Anular un movimiento (Solo si es permitido por reglas de negocio).
     */
    annul: async (id: number, reason: string): Promise<void> => {
        await httpStore.patch(`${CASH_URL}/${id}/annul`, reason, {
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};