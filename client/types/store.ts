export type StoreSchedule = {
    id: number;
    dayOfWeek: 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO' | 'DOMINGO' | string;
    openTime: string;
    closeTime: string;
    isOpen: boolean; 
};

export type ClosureDate = {
    id: number;
    closureDate: string;
    reason: string; 
    isFullDay: boolean;
    closingTime?: string;
};

export type Announcement = {
    id: number;
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    type: 'BANNER' | 'MODAL' | 'POPUP' | string;
    isActive: boolean;
};



export type Sale = {
    id: string;
    productId: string;
    quantity: number;
    total: number;
    date: string;
};

export type Alert = {
    id: string;
    productId: string;
    threshold: number;
    createdAt: string;
};