import { Sale, PaymentMethodConfig } from "../store";

export type CashMovementType = 'INCOME' | 'EXPENSE';
export type CashMovementStatus = 'PROCESSED' | 'PENDING' | 'ANNULLED';

export interface CashMovement {
    id: number;
    movementDate: string;
    type: CashMovementType;
    amount: number;
    
    paymentMethodName: string;
    collection?: any;
    sale?: Sale;     
    
    externalReference?: string;
    status: CashMovementStatus;
    concept: string;
    
    createdByUserId: number;
    createdAt: string;
}

export interface CashMovementPayload {
    type: CashMovementType;
    amount: number;
    paymentMethodId: number;
    concept: string;
    externalReference?: string;
    movementDate?: string; 
}

export interface CashMovementFilter {
    startDate?: string;
    endDate?: string;
    type?: CashMovementType;
    paymentMethodId?: number;
}