import { http } from '../http';
import { InventoryItem } from "../../types";

const INVENTORY_API_BASE_URL = '/inventory/items';
const PRODUCT_API_BASE_URL = '/inventory/products';

/**
 * Obtiene todos los lotes de inventario asociados a un producto específico.
 * GET /api/inventory/items/product/{productId}
 * @param productId El ID del producto.
 */
export const getInventoryItemsByProduct = async (productId: number): Promise<InventoryItem[]> => {
    const response = await http.get<InventoryItem[]>(`${INVENTORY_API_BASE_URL}/product/${productId}`);
    return response.data;
};

/**
 * Crea un nuevo lote de inventario (agrega stock).
 * POST /api/inventory/items
 * @param itemData Los datos del nuevo lote (debe incluir product: { id: productId }).
 */
export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'entryDate'>): Promise<InventoryItem> => {
    const response = await http.post<InventoryItem>(INVENTORY_API_BASE_URL, itemData);
    return response.data;
};

/**
 * Actualiza un lote de inventario existente.
 * PUT /api/inventory/items/{id}
 * @param id El ID del InventoryItem a actualizar.
 * @param itemData Los datos a modificar.
 */
export const updateInventoryItem = async (id: number, itemData: Partial<Omit<InventoryItem, 'id' | 'entryDate'>>): Promise<InventoryItem> => {
    // Nota: Usamos Omit para asegurar que no se envían campos de solo lectura como 'id' o 'entryDate' en el body.
    const response = await http.put<InventoryItem>(`${INVENTORY_API_BASE_URL}/${id}`, itemData);
    return response.data;
};

/**
 * Elimina un lote de inventario por su ID.
 * DELETE /api/inventory/items/{id}
 * @param id El ID del InventoryItem a eliminar.
 */
export const deleteInventoryItem = async (id: number): Promise<void> => {
    await http.delete(`${INVENTORY_API_BASE_URL}/${id}`);
};

/**
 * OBTENER STOCK TOTAL: Consulta el stock total calculado del producto.
 * GET /api/inventory/products/{id}/stock
 * @param productId El ID del producto.
 */
export const getProductTotalStock = async (productId: number): Promise<number> => {
    const response = await http.get<number>(`${PRODUCT_API_BASE_URL}/${productId}/stock`);
    return response.data;
};