/**
 * ====================================================================
 * ENTIDADES MAESTRAS DEL INVENTORY-SERVICE
 * ====================================================================
 */
import { z } from 'zod';

export type Brand = {
  id: number;
  name: string;
  code?: string;
  website?: string;
  logoUrl?: string;
};


export type UnitOfMeasure = {
  id: number;
  name: string;
  abbreviation: string;
};


export type Category = {
  id: number;
  name: string;
  description?: string;
  parent?: Category | null; 
  

  children?: Category[]; 
};

export type Supplier = {
  id: number;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  contactName: string;
};


export type ProductAttribute = {
  id: number;
  name: string;
  dataType: 'String' | 'Number' | 'Boolean';
};


export type ProductAttributeValue = {
  id: number;
  productId: number;
  attributeId: number;
  value: string;
};


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


export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  isDefault: boolean;

  sortOrder: number;
};


export type Product = {
  id: number;
  sku: string;
  name: string;
  imageUrl?: string;

  brandId: number; 
  categoryId: number; 
  unitOfMeasureId: number;
  
  
  price: number;
  minStockThreshold: number;
};

export type ProductSupplierDTO = {

    productId: number;
    supplierId: number;


    unitCost: number;
    leadTimeDays: number;
    isPreferred: boolean;


    isActive: boolean;


    supplierProductCode?: string | null;
};



export interface ProductListItem extends Product {

    brandName: string;
    supplierName: string;

    categoryName: string; 
    unitOfMeasureName: string; 
    

    currentStock?: number; 
}


export type InventoryItem = {
    id: number;
    productId: number;
    warehouseId: number;
    currentStock: number;
    unitCost: number;
    lotNumber: string;

    expirationDate: string; 
    location: string;
    entryDate: string;
}




export type JavaOrderStatus = 'PENDIENTE' | 'RECIBIDO_PARCIAL' | 'COMPLETO' | 'CANCELADO';


export type OrderStatus = JavaOrderStatus | 'BORRADOR' | 'ENVIADA'; 

export type PurchaseOrderDetail = {
    id: number;
    purchaseOrderId: number; 
    product: Product; 
    quantity: number;
    unitCost: number;
}

export type PurchaseOrder = {
    id: number;


    supplier: Supplier;
    


    
    orderDate: string; 
    deliveryDate: string; 
    totalAmount: number;
    status: JavaOrderStatus; 
    details: PurchaseOrderDetail[]; 
}

/**
 * TIPOS DE PAYLOAD (API REQUEST - Solución para relaciones ManyToOne)
 */

type IdPayload = { id: number };


export type PurchaseOrderDetailPayload = {
    product: IdPayload; 
    quantity: number;
    unitCost: number;

}



export type PurchaseOrderPayload = {
    supplier: IdPayload; 
    orderDate: string;
    deliveryDate: string;
    totalAmount: number;
    status: JavaOrderStatus;
    details: PurchaseOrderDetailPayload[]; 
};


export type InventoryMovement = {
    id: number;
    inventoryItemId: number;
    productId: number;
    quantityChange: number;
    type: string;
    reason: string;
    movementDate: string;
    referenceId: number;
    referenceService: string;
}

/**
 * ====================================================================
 * OPERACIÓN DE TIENDA
 * ====================================================================
 */


export type StoreSchedule = {
    id: number;
    dayOfWeek: 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO' | 'DOMINGO' | string;
    openTime: string;
    closeTime: string;
    isOpen: boolean; 
}


export type ClosureDate = {
    id: number;
    closureDate: string;
    reason: string; 
    isFullDay: boolean;
    closingTime?: string;
}


export type Announcement = {
    id: number;
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    type: 'BANNER' | 'MODAL' | 'POPUP' | string;
    isActive: boolean;
}

/**
 * ====================================================================
 * TIPOS AUXILIARES Y LEGACY (A revisar si aún son necesarios)
 * ====================================================================
 */


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




export const UnitOfMeasureSchema = z.object({
    name: z.string().min(2, "El nombre de la unidad es requerido y debe tener al menos 2 caracteres.").max(50, "El nombre no puede exceder los 50 caracteres."),

    abbreviation: z.string().min(1, "La abreviatura es requerida.").max(10, "La abreviatura no puede exceder los 10 caracteres."),

});


export type UnitOfMeasureFormValues = z.infer<typeof UnitOfMeasureSchema>;


export const BrandSchema = z.object({

    name: z.string().min(2, "El nombre de la marca es obligatorio.").max(150),
    

    code: z.string().max(20, "El código no puede exceder los 20 caracteres.").optional().nullable(),
    

    website: z.string().max(255).url("Debe ser una URL válida (Ej: https://marca.com)").optional().nullable().or(z.literal('')),
    

    logoUrl: z.string().max(255).url("Debe ser una URL válida para la imagen").optional().nullable().or(z.literal('')),
});


export type BrandFormValues = z.infer<typeof BrandSchema>;