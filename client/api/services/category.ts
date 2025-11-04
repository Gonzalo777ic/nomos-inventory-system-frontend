import { http } from '../http';
import { Category } from '../../types'; 

const API_BASE_URL = '/inventory/categories'; 

/**
 * Tipo de datos que la API de Spring Boot espera para la creación/actualización.
 * Nota: El backend espera 'parent: { id: number } | null' para la relación recursiva.
 */
interface CategoryPayload {
    name: string;
    description: string | null;
    parent: { id: number } | null;
}

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Category (Clasificación).
 */

// 1. Obtener lista de categorías (GET)
export const getCategories = async (): Promise<Category[]> => {
    const response = await http.get<Category[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear una nueva categoría (POST)
export const createCategory = async (categoryData: CategoryPayload): Promise<Category> => {
    const response = await http.post<Category>(API_BASE_URL, categoryData);
    return response.data;
};

// 3. Editar una categoría existente (PUT)
export const updateCategory = async (id: number, categoryData: CategoryPayload): Promise<Category> => {
    const response = await http.put<Category>(`${API_BASE_URL}/${id}`, categoryData);
    return response.data;
};

// 4. Eliminar una categoría (DELETE)
export const deleteCategory = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener una categoría por ID (GET)
export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await http.get<Category>(`${API_BASE_URL}/${id}`);
    return response.data;
};