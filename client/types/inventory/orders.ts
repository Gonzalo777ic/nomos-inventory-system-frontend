import { Supplier } from "./masters";
import { Product } from "./products";
import { IdPayload } from "../common";

export type OrderStatus = 'BORRADOR' | 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO' | 'COMPLETO' | 'CANCELADO';

export type PurchaseOrderDetail = {
    id: number;
    purchaseOrderId: number; 
    product: Product; 
    quantity: number;
    unitCost: number;
};

export type PurchaseOrder = {
    id: number;
    supplier: Supplier;
    orderDate: string; 
    deliveryDate: string; 
    totalAmount: number;
    status: OrderStatus; 
    details: PurchaseOrderDetail[]; 
};



export type PurchaseOrderDetailPayload = {
    product: IdPayload; 
    quantity: number;
    unitCost: number;
};

export type PurchaseOrderPayload = {
    supplier: IdPayload; 
    orderDate: string;
    deliveryDate: string;
    totalAmount: number;
    status: OrderStatus;
    details: PurchaseOrderDetailPayload[]; 
};

