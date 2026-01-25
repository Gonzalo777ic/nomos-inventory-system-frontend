import { http } from '../http'; 
import { InventoryMovement, CreateInventoryMovementPayload } from "../../types";

const BASE_URL = '/inventory-movements';

export const InventoryMovementService = {

    /**
     * Obtener todo el historial de movimientos (Kardex Global).
     */
    getAll: async (): Promise<InventoryMovement[]> => {
        const response = await http.get<InventoryMovement[]>(BASE_URL);
        return response.data;
    },


};