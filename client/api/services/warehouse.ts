import { http } from '../http';

// Interfaz TypeScript basada en el modelo Warehouse de Spring Boot
export interface Warehouse {
    id: number;
    name: string;
    locationAddress: string;
    isMain: boolean; // Si es el almacén principal
}

// Tipo para la creación/actualización (sin ID)
export type WarehousePayload = Omit<Warehouse, 'id'>;

const WAREHOUSE_API_BASE_URL = '/inventory/warehouses';

/**
 * Obtiene todos los almacenes.
 * GET /api/inventory/warehouses
 */
export const getAllWarehouses = async (): Promise<Warehouse[]> => {
    const response = await http.get<Warehouse[]>(WAREHOUSE_API_BASE_URL);
    return response.data;
};

/**
 * Obtiene un almacén por su ID.
 * GET /api/inventory/warehouses/{id}
 * @param id El ID del almacén.
 */
export const getWarehouseById = async (id: number): Promise<Warehouse> => {
    const response = await http.get<Warehouse>(`${WAREHOUSE_API_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Crea un nuevo almacén.
 * POST /api/inventory/warehouses
 * @param warehouseData Los datos del nuevo almacén.
 */
export const createWarehouse = async (warehouseData: WarehousePayload): Promise<Warehouse> => {
    const response = await http.post<Warehouse>(WAREHOUSE_API_BASE_URL, warehouseData);
    return response.data;
};

/**
 * Actualiza un almacén existente.
 * PUT /api/inventory/warehouses/{id}
 * @param id El ID del almacén a actualizar.
 * @param warehouseData Los datos a modificar.
 */
export const updateWarehouse = async (id: number, warehouseData: Partial<WarehousePayload>): Promise<Warehouse> => {
    const response = await http.put<Warehouse>(`${WAREHOUSE_API_BASE_URL}/${id}`, warehouseData);
    return response.data;
};

/**
 * Elimina un almacén por su ID.
 * DELETE /api/inventory/warehouses/{id}
 * @param id El ID del almacén a eliminar.
 */
export const deleteWarehouse = async (id: number): Promise<void> => {
    await http.delete(`${WAREHOUSE_API_BASE_URL}/${id}`);
};