import { Sale, PaymentMethodConfig } from "../store";

export type CashMovementType = 'INCOME' | 'EXPENSE';
export type CashMovementStatus = 'PROCESSED' | 'PENDING' | 'ANNULLED';

export interface CashMovement {
    id: number;
    movementDate: string;
    type: CashMovementType;
    amount: number;
    
    paymentMethod: PaymentMethodConfig;
    collection?: any;
    sale?: Sale;     
    
    externalReference?: string;
    status: CashMovementStatus;
    concept: string;
    
    createdByUserId: number;
    createdAt: string;
}