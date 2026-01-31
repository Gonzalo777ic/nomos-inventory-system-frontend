import { httpStore } from "../httpStore";
import { 
    StoreSchedule, 
    StoreScheduleException, 
    ScheduleExceptionPayload, 
    StoreStatusDTO 
} from "../../types/store/schedule";

const SCHEDULE_URL = 'http://localhost:8083/api/store/schedule';
const STATUS_URL = 'http://localhost:8083/api/store/status';

export const ScheduleService = {
    
    getWeeklySchedule: async (): Promise<StoreSchedule[]> => {
        const response = await httpStore.get<StoreSchedule[]>(SCHEDULE_URL);
        return response.data;
    },

    updateDaySchedule: async (id: number, data: Partial<StoreSchedule>): Promise<StoreSchedule> => {
        const response = await httpStore.put<StoreSchedule>(`${SCHEDULE_URL}/${id}`, data);
        return response.data;
    },

    getUpcomingExceptions: async (): Promise<StoreScheduleException[]> => {
        const response = await httpStore.get<StoreScheduleException[]>(`${SCHEDULE_URL}/exceptions`);
        return response.data;
    },


    
};