export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface StoreSchedule {
    id: number;
    dayOfWeek: DayOfWeek;
    openingTime: string; 
    closingTime: string;
    isOpen: boolean;
}