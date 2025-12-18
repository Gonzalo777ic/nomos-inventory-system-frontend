import { http } from '../http';
import { Supplier } from '../../types';

const API_BASE_URL = '/v1/suppliers';

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Supplier (Proveedor).
 */


export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await http.get<Supplier[]>(API_BASE_URL);
    return response.data;
};


export const createSupplier = async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await http.post<Supplier>(API_BASE_URL, supplierData);
    return response.data;
};


export const updateSupplier = async (id: number, supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await http.put<Supplier>(`${API_BASE_URL}/${id}`, supplierData);
    return response.data;
};


export const deleteSupplier = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};


export const getSupplierById = async (id: number): Promise<Supplier> => {
    const response = await http.get<Supplier>(`${API_BASE_URL}/${id}`);
    return response.data;
};