import { http } from '../http';
import { ProductImage } from '../../types'; 

const API_BASE_URL = '/inventory/product-images'; // Ruta base para el recurso ProductImage

/**
 * Define los servicios para la gestión de imágenes de producto.
 */

// 1. Obtener todas las imágenes de un producto (GET)
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

// 2. Cargar una nueva imagen (POST/Multipart)
export const uploadProductImage = async (productId: number, file: File): Promise<ProductImage> => {
    // 🔑 IMPORTANTE: Usamos FormData para la subida de archivos (Multipart)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId.toString());
    
    // El backend recibe el archivo y la ID, lo guarda en el sistema de almacenamiento,
    // y crea el registro en la base de datos, incluyendo `imageUrl` e `isDefault`.
    const response = await http.post<ProductImage>(`${API_BASE_URL}/upload`, formData, {
        headers: {
            // Sobreescribimos el Content-Type para archivos Multipart
            'Content-Type': 'multipart/form-data', 
        },
    });
    
    console.log(`[ProductImages API] ✅ Imagen cargada para Producto ${productId}:`, response.data);
    return response.data;
};

// 3. Eliminar una imagen por su ID (DELETE)
export const deleteProductImage = async (imageId: number): Promise<void> => {
    await http.delete(`${API_BASE_URL}/${imageId}`);
    console.log(`[ProductImages API] ✅ Imagen ID ${imageId} eliminada con éxito.`);
};

// 4. Establecer una imagen como principal/defecto (PATCH/PUT)
export const setDefaultProductImage = async (imageId: number): Promise<ProductImage> => {
    // Llama a un endpoint que actualiza `isDefault` a true para esta imagen, 
    // y a false para todas las demás del mismo producto.
    const response = await http.patch<ProductImage>(`${API_BASE_URL}/${imageId}/set-default`);
    console.log(`[ProductImages API] ✅ Imagen ID ${imageId} establecida como principal.`);
    return response.data;
};

// 5. Agregar una imagen a través de una URL externa (POST/JSON)
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