/**
 * ====================================================================
 * ENTIDADES MAESTRAS DEL INVENTORY-SERVICE
 * ====================================================================
 */
import { z } from 'zod';
// 1. NUEVA ENTIDAD: Brand (Marca)
export type Brand = {
  id: number;
  name: string; // Nombre completo de la marca (Unique)
  code?: string; // Código o abreviatura (Unique)
  website?: string; // URL del sitio web del fabricante
  logoUrl?: string; // URL del logo
};

// 2. UnitOfMeasure (Unidad de Medida, ej: Unidad, Kg, Paquete)
export type UnitOfMeasure = {
  id: number;
  name: string;
  abbreviation: string; // Unique
};

// 3. Category (Clasificación jerárquica)
export type Category = {
  id: number;
  name: string;
  parentId?: number; // FK recursiva a Category (null si es raíz)
};

// 4. Supplier (Proveedor)
export type Supplier = {
  id: number;
  name: string;
  taxId: string; // Unique
  email: string;
  phone: string;
  address: string;
  contactName: string;
};

// 5. ProductAttribute (Ej: Talla, Color, Sabor)
export type ProductAttribute = {
  id: number;
  name: string;
  dataType: 'String' | 'Number' | 'Boolean'; // String, Number, Boolean
};

// 6. ProductAttributeValue (Valores del atributo para un Producto)
export type ProductAttributeValue = {
  id: number;
  productId: number; // FK a Product
  attributeId: number; // FK a ProductAttribute
  value: string; // Ej: 'Rojo', 'Grande', '200ml'
};

// 7. Warehouse (Almacén)
export type Warehouse = {
    id: number;
    name: string;
    locationAddress: string;
    isMain: boolean;
}

/**
 * ====================================================================
 * TRANSACCIONALES CORE
 * ====================================================================
 */

// 8. Product (Definición maestra) - Actualizada con FKs numéricas
export type Product = {
  id: number;
  sku: string; // Unique
  name: string;
  imageUrl?: string; // 🖼️ URL de la imagen del producto (Añadida)
  
  // 🎯 Nuevas Claves Foráneas (Long en Java -> number en TS)
  brandId: number; 
  categoryId: number; 
  defaultSupplierId: number;
  unitOfMeasureId: number;
  
  price: number; // Precio Base (Double en Java)
  minStockThreshold: number; // (Integer en Java)
};

// 8.1 ProductListItem (Extensión para la vista de lista)
// Tipo utilizado en el frontend para mostrar la lista de productos con datos denormalizados.
export interface ProductListItem extends Product {
    // Campos denormalizados (traídos por el backend para la vista de lista)
    brandName: string;
    supplierName: string;

    categoryName: string; 
    unitOfMeasureName: string; 
    
    // Campo calculado (Stock actual)
    currentStock?: number; 
}

// 9. InventoryItem (Lote de existencia física) - Actualizada a números
export type InventoryItem = {
    id: number;
    productId: number; // FK a Product
    warehouseId: number; // FK a Warehouse
    currentStock: number; // Integer
    unitCost: number; // Double
    lotNumber: string;
    // Usamos string para el input de fecha (YYYY-MM-DD)
    expirationDate: string; 
    location: string;
    entryDate: string; // Si el backend lo retorna, descomentar
}

// 10. PurchaseOrder (Pedidos a proveedores)
export type PurchaseOrder = {
    id: number;
    supplierId: number; // FK a Supplier
    orderDate: string; // LocalDate
    deliveryDate: string; // LocalDate (Fecha esperada)
    totalAmount: number; // Double
    status: 'PENDING' | 'PARTIAL' | 'COMPLETE' | string; // Ejemplo de estados
}

// 11. PurchaseOrderDetail (Detalle de la Orden de Compra)
export type PurchaseOrderDetail = {
    id: number;
    purchaseOrderId: number; // FK a PurchaseOrder
    productId: number; // FK a Product
    quantity: number; // Integer
    unitCost: number; // Double
}

// 12. InventoryMovement (Trazabilidad histórica de stock)
export type InventoryMovement = {
    id: number;
    inventoryItemId: number; // FK a InventoryItem
    productId: number; // FK a Product
    quantityChange: number; // Integer (+/-)
    type: string; // MOVE_IN, MOVE_OUT, ADJUSTMENT
    reason: string;
    movementDate: string; // LocalDateTime
    referenceId: number;
    referenceService: string;
}

/**
 * ====================================================================
 * OPERACIÓN DE TIENDA
 * ====================================================================
 */

// 13. StoreSchedule (Horario de Atención Semanal Regular)
export type StoreSchedule = {
    id: number;
    dayOfWeek: 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO' | 'DOMINGO' | string;
    openTime: string; // LocalTime
    closeTime: string; // LocalTime
    isOpen: boolean; 
}

// 14. ClosureDate (Días Festivos o Cierres Programados)
export type ClosureDate = {
    id: number;
    closureDate: string; // LocalDate
    reason: string; 
    isFullDay: boolean;
    closingTime?: string; // LocalTime (si es cierre parcial)
}

// 15. Announcement (Mensajes en la Tienda Online)
export type Announcement = {
    id: number;
    title: string;
    content: string;
    startDate: string; // LocalDateTime
    endDate: string; // LocalDateTime
    type: 'BANNER' | 'MODAL' | 'POPUP' | string;
    isActive: boolean;
}

/**
 * ====================================================================
 * TIPOS AUXILIARES Y LEGACY (A revisar si aún son necesarios)
 * ====================================================================
 */

// Tipos originales que deben ser revisados o eliminados si ya no se usan
export type Sale = {
    id: string;
    productId: string;
    quantity: number;
    total: number;
    date: string;
};

export type Alert = {
    id: string;
    productId: string;
    threshold: number;
    createdAt: string;
};

export type User = {
    id: string;
    email: string;
    name?: string;
    role?: "admin" | "seller";
};



export const SupplierSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string().min(2, { message: "El nombre de la compañía es obligatorio." }).max(150),
    taxId: z.string().min(5, { message: "El ID Fiscal (RUC/NIT) es obligatorio." }).max(50),
    email: z.string().email({ message: "El correo electrónico no es válido." }),
    phone: z.string().min(8, { message: "El teléfono debe tener al menos 8 dígitos." }).max(20),
    address: z.string().min(5, { message: "La dirección es obligatoria." }).max(250),
    contactName: z.string().min(3, { message: "El nombre del contacto es obligatorio." }).max(100),
});