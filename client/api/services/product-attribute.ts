import { http } from '../http';
import { ProductAttribute } from '../../types';


const API_BASE_URL = '/inventory/attributes'; 

/**
 * Servicio de API para gestionar las operaciones CRUD de la entidad ProductAttribute.
 */


export const getProductAttributes = async (): Promise<ProductAttribute[]> => {
    const response = await http.get<ProductAttribute[]>(API_BASE_URL);
    return response.data;
};



export const createProductAttribute = async (attributeData: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> => {
    const response = await http.post<ProductAttribute>(API_BASE_URL, attributeData);
    return response.data;
};



export const updateProductAttribute = async (id: number, attributeData: Omit<ProductAttribute, 'id'>): Promise<ProductAttribute> => {
    const response = await http.put<ProductAttribute>(`${API_BASE_URL}/${id}`, attributeData);
    return response.data;
};


export const deleteProductAttribute = async (id: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${id}`);
};



export const getProductAttributeById = async (id: number): Promise<ProductAttribute> => {
    const response = await http.get<ProductAttribute>(`${API_BASE_URL}/${id}`);
    return response.data;
};