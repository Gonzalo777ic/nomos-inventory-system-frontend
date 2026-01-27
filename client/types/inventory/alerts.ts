import { Product } from "../index"; 

export type AlertType = 'LOW_STOCK' | 'CRITICAL_STOCK' | 'NEAR_EXPIRATION' | 'EXPIRED';
export type AlertStatus = 'ACTIVE' | 'DISMISSED' | 'RESOLVED';

export interface StockAlertCalculated {
    productId: number;
    productName: string;
    sku: string;
    imageUrl?: string;
    currentStock: number;
    minStockThreshold: number;
    deficit: number;
    status: 'LOW' | 'CRITICAL';
}

export interface Alert {
    id: number;
    product: Product;
    inventoryItem?: { id: number; lotNumber: string; expirationDate: string };
    type: AlertType;
    status: AlertStatus;
    title: string;
    description: string;
    severity: number;
    createdAt: string;
    resolvedAt?: string;
}

export interface UpdateAlertStatusPayload {
    status: AlertStatus;
}