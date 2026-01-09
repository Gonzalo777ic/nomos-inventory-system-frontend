import { http } from '../http';
import { Category } from '../../types'; 

const API_BASE_URL = '/inventory/categories'; 


interface CategoryPayload {
    name: string;
    description: string | null;
    parent: { id: number } | null;
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await http.get<Category[]>(API_BASE_URL);
    return response.data;
};


export const createCategory = async (categoryData: CategoryPayload): Promise<Category> => {
    const response = await http.post<Category>(API_BASE_URL, categoryData);
    return response.data;
};


export const updateCategory = async (id: number, categoryData: CategoryPayload): Promise<Category> => {
    const response = await http.put<Category>(`${API_BASE_URL}/${id}`, categoryData);
    return response.data;
};


export const deleteCategory = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};


export const getCategoryById = async (id: number): Promise<Category> => {
    const response = await http.get<Category>(`${API_BASE_URL}/${id}`);
    return response.data;
};