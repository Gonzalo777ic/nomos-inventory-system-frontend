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

        /**
     * Obtener un movimiento específico por ID.
     */
    getById: async (id: number): Promise<InventoryMovement> => {
        const response = await http.get<InventoryMovement>(`${BASE_URL}/${id}`);
        return response.data;
    },

        /**
     * Obtener el Kardex de un producto específico.
     */
    getByProduct: async (productId: number): Promise<InventoryMovement[]> => {
        const response = await http.get<InventoryMovement[]>(`${BASE_URL}/product/${productId}`);
        return response.data;
    },

        /**
     * Registrar un movimiento manual (ej: Ajuste por pérdida o inventario inicial).
     */
    create: async (data: CreateInventoryMovementPayload): Promise<InventoryMovement> => {
        const response = await http.post<InventoryMovement>(BASE_URL, data);
        return response.data;
    }




};