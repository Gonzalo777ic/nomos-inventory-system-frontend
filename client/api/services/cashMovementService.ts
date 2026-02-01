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

    
};