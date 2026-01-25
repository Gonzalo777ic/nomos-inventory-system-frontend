import { Product } from "../inventory/products"

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
};
