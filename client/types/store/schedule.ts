export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface StoreSchedule {
    id: number;
    dayOfWeek: DayOfWeek;
    openingTime: string; 
    closingTime: string;
    isOpen: boolean;
}

export interface StoreScheduleException {
    id: number;
    date: string; 
    isClosed: boolean;
    openingTime?: string | null;
    closingTime?: string | null;
    reason: string; 
}


export interface StoreStatusDTO {
    status: 'OPEN' | 'CLOSED';
    message: string;        
    reason: string;         
    nextOpening?: string;   
    currentClosing?: string;
    closingSoon: boolean;  
}


export interface ScheduleExceptionPayload {
    date: string;
    isClosed: boolean;
    openingTime?: string | null;
    closingTime?: string | null;
    reason: string;
}