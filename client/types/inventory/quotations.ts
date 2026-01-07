import { Supplier } from "./masters";
import { Product } from "./products";

export type QuotationStatus = 'BORRADOR' | 'ENVIADO' | 'RESPONDIDO' | 'APROBADO' | 'CONVERTIDO' | 'RECHAZADO';

export type QuotationDetail = {
    id: number;

    product?: Product | null; 

    productName: string; 
    quantity: number;
    quotedPrice: number;
    skuSuggestion?: string;
};

export type Quotation = {
    id: number;
    supplier: Supplier;
    requestDate: string;
    expirationDate?: string;
    status: QuotationStatus;
    totalEstimated: number;
    notes?: string;
    details: QuotationDetail[];
};


export type QuotationDetailPayload = {
    productId?: number | null;
    productName: string;
    quantity: number;
    quotedPrice: number;
    skuSuggestion?: string;
};

export type QuotationPayload = {
    supplierId: number;
    requestDate: string;
    expirationDate?: string;
    status: QuotationStatus;
    notes?: string;
    details: QuotationDetailPayload[];
};