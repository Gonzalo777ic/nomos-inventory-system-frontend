import { http } from '../http';
import { Category } from '../../types'; // Importamos la definición de Category

const API_BASE_URL = '/inventory/categories'; // Ruta base para el recurso Category

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Category (Clasificación).
 */

// 1. Obtener lista de categorías (GET)
// Esto se usará para llenar un <select> en el formulario de Producto
export const getCategories = async (): Promise<Category[]> => {
    const response = await http.get<Category[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear una nueva categoría (POST)
export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const response = await http.post<Category>(API_BASE_URL, categoryData);
    return response.data;
};

// 3. Editar una categoría existente (PUT)
export const updateCategory = async (id: number, categoryData: Omit<Category, 'id'>): Promise<Category> => {
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
