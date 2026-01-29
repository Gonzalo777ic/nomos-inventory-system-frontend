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

    
};