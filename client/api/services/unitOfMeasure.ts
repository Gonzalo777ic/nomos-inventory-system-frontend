import { http } from '../http';
import { UnitOfMeasure } from '../../types';

const API_BASE_URL = '/inventory/units-of-measure';

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad UnitOfMeasure (Unidad de Medida).
 */


export const getUnitsOfMeasure = async (): Promise<UnitOfMeasure[]> => {
    const response = await http.get<UnitOfMeasure[]>(API_BASE_URL);
    return response.data;
};


export const createUnitOfMeasure = async (unitData: Omit<UnitOfMeasure, 'id'>): Promise<UnitOfMeasure> => {
    const response = await http.post<UnitOfMeasure>(API_BASE_URL, unitData);
    return response.data;
};


export const updateUnitOfMeasure = async (id: number, unitData: Omit<UnitOfMeasure, 'id'>): Promise<UnitOfMeasure> => {
    const response = await http.put<UnitOfMeasure>(`${API_BASE_URL}/${id}`, unitData);
    return response.data;
};


export const deleteUnitOfMeasure = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};


export const getUnitOfMeasureById = async (id: number): Promise<UnitOfMeasure> => {
    const response = await http.get<UnitOfMeasure>(`${API_BASE_URL}/${id}`);
    return response.data;
};
