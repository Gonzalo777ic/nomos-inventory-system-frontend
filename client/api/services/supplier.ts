import { http } from '../http';
import { Supplier } from '../../types'; // Importamos la definición de Supplier

const API_BASE_URL = '/inventory/suppliers'; // Ruta base para el recurso Supplier

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Supplier (Proveedor).
 */

// 1. Obtener lista de proveedores (GET)
export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await http.get<Supplier[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear un nuevo proveedor (POST)
export const createSupplier = async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await http.post<Supplier>(API_BASE_URL, supplierData);
    return response.data;
};

// 3. Editar un proveedor existente (PUT)
export const updateSupplier = async (id: number, supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await http.put<Supplier>(`${API_BASE_URL}/${id}`, supplierData);
    return response.data;
};

// 4. Eliminar un proveedor (DELETE)
export const deleteSupplier = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener un proveedor por ID (GET)
export const getSupplierById = async (id: number): Promise<Supplier> => {
    const response = await http.get<Supplier>(`${API_BASE_URL}/${id}`);
    return response.data;
};
