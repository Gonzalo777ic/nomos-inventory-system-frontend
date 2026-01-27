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
