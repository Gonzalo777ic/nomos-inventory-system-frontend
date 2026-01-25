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



export type InventoryMovementType = 'ENTRADA' | 'SALIDA_VENTA' | 'AJUSTE_DEVOLUCION' | 'AJUSTE_PERDIDA' | 'TRANSFERENCIA';

export interface InventoryMovement {
    id: number;
    product: Product; 
    inventoryItemId?: number;
    warehouseId?: number;
    
    quantityChange: number; 
    balanceAfter: number;   
    
    type: InventoryMovementType;
    reason: string;
    movementDate: string; 
    
    referenceId?: number;
    referenceService?: string;
    observation?: string;
}

export interface CreateInventoryMovementPayload {
    product: { id: number };
    inventoryItem?: { id: number };
    quantityChange: number;
    type: InventoryMovementType;
    reason: string;
    movementDate: string;
    referenceId?: number;
    referenceService?: string;
}