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
};