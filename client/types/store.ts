import { Collection } from "./inventory/collections"; 



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



/**
 * Interfaz que representa un ítem (detalle) de una venta ya registrada en BD.
 */
export interface SaleDetail {
    id: number;
    saleId: number;
    productId: number;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    taxRateId: number;
    promotionId: number | null;
}

/**
 * Payload base para crear o modificar un detalle.
 */
export interface SaleDetailPayload {
    saleId?: number;
    productId: number;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    taxRateId: number;
    promotionId?: number | null;
    tempId?: string;
}

export interface SaleTypeRef {
    key: string;
    description: string;
}

export interface SalePayload {
    clientId: number | null; 
    saleDate: string; 
    type: string;
    sellerId: number;
    paymentCondition: 'CONTADO' | 'CREDITO';
    creditDays?: number;
    dueDate?: string;
}

/**
 * Interfaz principal de Venta (Lectura desde BD)
 */
export interface Sale {
    id: number;
    clientId: number | null;
    saleDate: string;
    type: 'BOLETA' | 'FACTURA' | 'TICKET' | string;
    

    paymentCondition: 'CONTADO' | 'CREDITO';
    dueDate?: string;
    creditDays: number;
    

    totalAmount: number;
    totalDiscount: number;
    status: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | 'PAGADO' | 'EMITIDA' | string;
    sellerId: number;
    

    details?: SaleDetail[];
    collections?: Collection[];
}

/**
 * DTO Completo para crear la venta con sus detalles en una sola transacción
 */
export interface SaleCreationDTO extends SalePayload {

    details: Omit<SaleDetailPayload, 'saleId' | 'tempId'>[]; 
}