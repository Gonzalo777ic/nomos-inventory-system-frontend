export type AnnouncementType = 'BANNER' | 'POPUP' | 'SYSTEM';

export interface Announcement {
    id: number;
    title: string;
    content: string; 
    type: AnnouncementType;
    startDate: string;
    endDate: string;  
    isActive: boolean;
    targetAudience?: string; 
    createdAt: string;
}
