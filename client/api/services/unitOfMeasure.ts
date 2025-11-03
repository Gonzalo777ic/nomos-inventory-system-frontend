import { http } from '../http';
import { UnitOfMeasure } from '../../types'; // Importamos la definición de UnitOfMeasure

const API_BASE_URL = '/inventory/units-of-measure'; // Ruta base para el recurso UnitOfMeasure

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad UnitOfMeasure (Unidad de Medida).
 */

// 1. Obtener lista de unidades de medida (GET)
export const getUnitsOfMeasure = async (): Promise<UnitOfMeasure[]> => {
    const response = await http.get<UnitOfMeasure[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear una nueva unidad de medida (POST)
export const createUnitOfMeasure = async (unitData: Omit<UnitOfMeasure, 'id'>): Promise<UnitOfMeasure> => {
    const response = await http.post<UnitOfMeasure>(API_BASE_URL, unitData);
    return response.data;
};

// 3. Editar una unidad de medida existente (PUT)
export const updateUnitOfMeasure = async (id: number, unitData: Omit<UnitOfMeasure, 'id'>): Promise<UnitOfMeasure> => {
    const response = await http.put<UnitOfMeasure>(`${API_BASE_URL}/${id}`, unitData);
    return response.data;
};

// 4. Eliminar una unidad de medida (DELETE)
export const deleteUnitOfMeasure = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener una unidad de medida por ID (GET)
export const getUnitOfMeasureById = async (id: number): Promise<UnitOfMeasure> => {
    const response = await http.get<UnitOfMeasure>(`${API_BASE_URL}/${id}`);
    return response.data;
};
