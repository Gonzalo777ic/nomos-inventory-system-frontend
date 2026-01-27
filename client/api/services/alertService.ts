import { http } from '../http';
import { Alert, AlertStatus, StockAlertCalculated, UpdateAlertStatusPayload } from '../../types/inventory/alerts';

const API_BASE_URL = '/inventory/alerts';


/**
 * Obtiene las alertas de stock calculadas en tiempo real.
 * Compara SUM(stock) vs Product.minStockThreshold.
 */
export const getCalculatedStockAlerts = async (): Promise<StockAlertCalculated[]> => {
    try {
        const response = await http.get<StockAlertCalculated[]>(`${API_BASE_URL}/stock-calculated`);
        return response.data;
    } catch (error) {
        console.error("[Alerts API] Error obteniendo alertas calculadas:", error);
        throw error;
    }
};

/**
 * Obtiene el historial de alertas persistentes.
 * @param status (Opcional) Filtrar por estado: 'ACTIVE', 'RESOLVED', etc.
 */
export const getPersistentAlerts = async (status?: AlertStatus): Promise<Alert[]> => {
    try {
        const params = status ? { status } : {};
        const response = await http.get<Alert[]>(API_BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error("[Alerts API] Error obteniendo historial de alertas:", error);
        throw error;
    }
};
