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




export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
export type AccountsReceivableStatus = 'ACTIVE' | 'PAID' | 'CANCELLED' | 'BAD_DEBT';

export interface Installment {
    id: number;
    number: number;
    dueDate: string;
    expectedAmount: number;
    paidAmount: number;
    status: InstallmentStatus;
    capitalAmount?: number;
    interestAmount?: number;
    penaltyAmount?: number;
}

export type LegalEntityType = 'NATURAL_PERSON' | 'LEGAL_ENTITY';

export interface LegalEntity {
    id: number;
    legalName: string;
    taxId: string;
    address?: string;
    email?: string;
    phone?: string;
    type: LegalEntityType;
    parent?: LegalEntity;
}

export type CreditDocumentType = 'PAGARE' | 'LETRA_CAMBIO';
export type CreditDocumentStatus = 'DRAFT' | 'ISSUED' | 'SIGNED' | 'EXECUTED' | 'CANCELLED';

export interface CreditDocument {
    id: number;
    type: CreditDocumentType;
    amount: number;
    documentNumber: string;
    issueDate: string;
    dueDate: string;
    

    debtorName: string;
    debtorIdNumber: string;
    creditor: LegalEntity;
    

    guarantorName?: string;
    guarantorIdNumber?: string;
    placeOfIssue?: string;
    placeOfPayment?: string;


    status: CreditDocumentStatus;
    legalNotes?: string;
}

export interface CreditDocumentPayload {
    accountsReceivableId: number;
    type: 'PAGARE' | 'LETRA_CAMBIO';
    amount: number;
    issueDate: string;
    dueDate: string;
    debtorName: string;
    debtorIdNumber: string;
    
    creditorEntityId: number;
    creditorName?: string;
    documentNumber: string;
    legalNotes?: string;

    guarantorName?: string;
    guarantorIdNumber?: string;
    placeOfIssue: string;
    placeOfPayment: string;

}


export interface AccountsReceivable {
    id: number;
    sale?: Sale;
    totalAmount: number;
    status: AccountsReceivableStatus;
    installments: Installment[];
    collections?: Collection[];
    creditDocuments?: CreditDocument[];
}

/**
 * Interfaz para Documento de Venta.
 */

export type SalesDocumentType = 'BOLETA' | 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'TICKET';

export type SalesDocumentStatus = 
    | 'DRAFT'      
    | 'ISSUED'      
    | 'SENT_SUNAT'  
    | 'ACCEPTED'    
    | 'REJECTED'    
    | 'VOIDED';     

export interface SalesDocument {
    id: number;
    type: SalesDocumentType;
    series: string;
    number: string;
    issueDate: string; 
    status: SalesDocumentStatus;
    totalAmount: number;
    
    digestValue?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    cdrUrl?: string;
    responseMessage?: string;
}



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
    creditStartDate?: string | null; 
    numberOfInstallments?: number;
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
    accountsReceivable?: AccountsReceivable;

    documents?: SalesDocument[];
}

/**
 * DTO Completo para crear la venta con sus detalles en una sola transacción
 */
export interface SaleCreationDTO extends SalePayload {

    details: Omit<SaleDetailPayload, 'saleId' | 'tempId'>[]; 
}


/**
 * MÓDULO DE DEVOLUCIONES (SALE RETURNS)
 */
export type SaleReturnType = 'TOTAL' | 'PARTIAL';
export type SaleReturnStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

/**
 * Detalle de la devolución (Item devuelto)
 */
export interface SaleReturnDetail {
    id: number;
    saleReturnId?: number; 
    originalSaleDetailId: number; 
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

/**
 * Cabecera de la devolución
 */
export interface SaleReturn {
    id: number;
    saleId: number;
    returnDate: string; 
    type: SaleReturnType;
    status: SaleReturnStatus;
    reason: string;
    totalRefundAmount: number;
    
    creditNote?: SalesDocument; 
    
    details: SaleReturnDetail[];
    
    createdByUserId?: number;
}

/**
 * Payload para crear un BORRADOR de devolución
 */
export interface SaleReturnRequestPayload {
    saleId: number;
    reason: string;
    type: SaleReturnType;
    items: {
        originalDetailId: number;
        quantity: number;
    }[];
}