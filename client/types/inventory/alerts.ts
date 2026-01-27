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

