import { http } from '../http';
import { Brand } from '../../types';

const API_BASE_URL = '/masters/brands';

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad Brand (Marca).
 */



export const getBrands = async (): Promise<Brand[]> => {
    const response = await http.get<Brand[]>(API_BASE_URL);
    return response.data;
};


export const createBrand = async (brandData: Omit<Brand, 'id'>): Promise<Brand> => {
    const response = await http.post<Brand>(API_BASE_URL, brandData);
    return response.data;
};


export const updateBrand = async (id: number, brandData: Omit<Brand, 'id'>): Promise<Brand> => {
    const response = await http.put<Brand>(`${API_BASE_URL}/${id}`, brandData);
    return response.data;
};


export const deleteBrand = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};


export const getBrandById = async (id: number): Promise<Brand> => {
    const response = await http.get<Brand>(`${API_BASE_URL}/${id}`);
    return response.data;
};
