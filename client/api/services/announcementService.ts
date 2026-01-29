import { httpStore } from "../httpStore";
import { Announcement, AnnouncementDTO } from "../../types/store/announcement";

const ANNOUNCEMENTS_URL = 'http://localhost:8083/api/store/announcements';



export const AnnouncementService = {
    
    /**
     * Obtener todos los anuncios (Vista de Administrador).
     */
    getAll: async (): Promise<Announcement[]> => {
        const response = await httpStore.get<Announcement[]>(ANNOUNCEMENTS_URL);
        return response.data;
    },
    /**
     * Obtener solo los anuncios activos y vigentes (Para mostrar al usuario final).
     */
    getActive: async (): Promise<Announcement[]> => {
        const response = await httpStore.get<Announcement[]>(`${ANNOUNCEMENTS_URL}/active`);
        return response.data;
    },

    
    
};