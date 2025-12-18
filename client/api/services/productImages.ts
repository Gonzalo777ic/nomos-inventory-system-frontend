import { http } from '../http';
import { ProductImage } from '../../types'; 

const API_BASE_URL = '/inventory/product-images';

/**
 * Define los servicios para la gestión de imágenes de producto.
 */


export const getProductImages = async (productId: number): Promise<ProductImage[]> => {
    try {
        const response = await http.get<ProductImage[]>(`${API_BASE_URL}/product/${productId}`);
        console.log(`[ProductImages API] 📥 Imágenes recibidas para Producto ${productId}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[ProductImages API] 🚨 Error al obtener imágenes para Producto ${productId}:`, error);
        throw error;
    }
};


export const uploadProductImage = async (productId: number, file: File): Promise<ProductImage> => {

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId.toString());
    


    const response = await http.post<ProductImage>(`${API_BASE_URL}/upload`, formData, {
        headers: {

            'Content-Type': 'multipart/form-data', 
        },
    });
    
    console.log(`[ProductImages API] ✅ Imagen cargada para Producto ${productId}:`, response.data);
    return response.data;
};


export const deleteProductImage = async (imageId: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${imageId}`);
    console.log(`[ProductImages API] ✅ Imagen ID ${imageId} eliminada con éxito.`);
};


export const setDefaultProductImage = async (imageId: number): Promise<ProductImage> => {


    const response = await http.patch<ProductImage>(`${API_BASE_URL}/${imageId}/set-default`);
    console.log(`[ProductImages API] ✅ Imagen ID ${imageId} establecida como principal.`);
    return response.data;
};


/**
 * Envía una URL de imagen al backend para que este se encargue de descargarla,
 * guardarla y asociarla al producto.
 * @param productId ID del producto.
 * @param imageUrl URL externa de la imagen.
 * @returns El objeto ProductImage creado por el backend.
 */
export const addProductImageFromUrl = async (productId: number, imageUrl: string): Promise<ProductImage> => {
    const response = await http.post<ProductImage>(`${API_BASE_URL}/add-url`, {
        productId,
        imageUrl,
    });
    console.log(`[ProductImages API] ✅ URL de imagen guardada para Producto ${productId}:`, response.data);
    return response.data;
};