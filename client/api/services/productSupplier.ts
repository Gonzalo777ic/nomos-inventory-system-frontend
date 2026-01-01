import { http } from '../http';
import { ProductSupplierDTO } from '../../types';


const API_BASE_URL = '/inventory/product-suppliers';

/**
 * Servicio API para gestionar la relación ProductSupplier (Tabla M:N).
 */

/**
 * 1. Crea una nueva relación entre un Producto y un Proveedor.
 *
 * @param relationData El DTO con todos los campos obligatorios para la relación.
 * @returns La relación ProductSupplier creada por el backend.
 */
export const createProductSupplierRelation = async (relationData: ProductSupplierDTO): Promise<any> => {

    console.log("[ProductSupplier API]  Enviando relación POST:", relationData);
    
    try {

        const response = await http.post(API_BASE_URL, relationData);
        
        console.log("[ProductSupplier API]  Relación creada con éxito:", response.data);
        return response.data;
    } catch (error) {

        console.error("[ProductSupplier API]  Error al crear relación ProductSupplier:", error);
        throw error;
    }
};


/**
 * NOTA: Para una solución completa, se podrían añadir aquí:
 * * 2. getSuppliersByProduct(productId: number): GET /product/{productId}
 * 3. updateProductSupplier(productId, supplierId, data): PUT /{productId}/{supplierId}
 * 4. deleteProductSupplier(productId, supplierId): DELETE /{productId}/{supplierId}
 */