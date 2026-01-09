export type StoreSchedule = {
    id: number;
    dayOfWeek: 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO' | 'DOMINGO' | string;
    openTime: string;
    closeTime: string;
    isOpen: boolean; 
};

export type ClosureDate = {
    id: number;
    closureDate: string;
    reason: string; 
    isFullDay: boolean;
    closingTime?: string;
};

export type Announcement = {
    id: number;
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    type: 'BANNER' | 'MODAL' | 'POPUP' | string;
    isActive: boolean;
};



export type Alert = {
    id: string;
    productId: string;
    threshold: number;
    createdAt: string;
};



export interface PaymentMethodConfig {
  id: number;
  name: string;
  type: string;
}


export type PaymentMethodPayload = Omit<PaymentMethodConfig, 'id'>;





import { Collection } from "./inventory/collections"; 



export interface Sale {
    id: number;
    clientId: number | null;
    saleDate: string;
    type: 'BOLETA' | 'FACTURA' | 'TICKET' | string;
    totalAmount: number;
    totalDiscount: number;
    status: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | 'PAGADO' | string;
    sellerId: number;

    collections?: Collection[]; 
}

export interface SaleTypeRef {
    key: string;
    description: string;
}



/**
 * Payload para el detalle de la venta (Producto individual)
 */
export interface SaleDetailPayload {
    productId: number;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    taxRateId: number;
    promotionId?: number | null;
    tempId?: string;
}

export interface SalePayload {
    clientId: number | null; 
    saleDate: string; 
    type: string;
    sellerId: number;
}

/**
 * DTO Completo para crear la venta con sus detalles
 */
export interface SaleCreationDTO extends SalePayload {

    details: Omit<SaleDetailPayload, 'tempId'>[]; 
}