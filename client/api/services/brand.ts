import { http } from '../http';
import { Brand } from '../../types'; // 🎯 Importamos la definición de Brand

const API_BASE_URL = '/inventory/brands'; // Ruta base para el recurso Brand

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Brand (Marca).
 */

// 1. Obtener lista de marcas (GET)
// Esto se usará para llenar un <select> en el formulario de Producto
export const getBrands = async (): Promise<Brand[]> => {
    const response = await http.get<Brand[]>(API_BASE_URL);
    return response.data;
};

// 2. Crear una nueva marca (POST)
export const createBrand = async (brandData: Omit<Brand, 'id'>): Promise<Brand> => {
    const response = await http.post<Brand>(API_BASE_URL, brandData);
    return response.data;
};

// 3. Editar una marca existente (PUT)
export const updateBrand = async (id: number, brandData: Omit<Brand, 'id'>): Promise<Brand> => {
    const response = await http.put<Brand>(`${API_BASE_URL}/${id}`, brandData);
    return response.data;
};

// 4. Eliminar una marca (DELETE)
export const deleteBrand = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};

// 5. Obtener una marca por ID (GET)
export const getBrandById = async (id: number): Promise<Brand> => {
    const response = await http.get<Brand>(`${API_BASE_URL}/${id}`);
    return response.data;
};
