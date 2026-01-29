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
    /**
     * Obtener un anuncio por ID.
     */
    getById: async (id: number): Promise<Announcement> => {
        const response = await httpStore.get<Announcement>(`${ANNOUNCEMENTS_URL}/${id}`);
        return response.data;
    },

    /**
     * Crear un nuevo anuncio.
     */
    create: async (data: AnnouncementDTO): Promise<Announcement> => {
        const response = await httpStore.post<Announcement>(ANNOUNCEMENTS_URL, data);
        return response.data;
    },

    /**
     * Actualizar un anuncio existente.
     */
    update: async (id: number, data: AnnouncementDTO): Promise<Announcement> => {
        const response = await httpStore.put<Announcement>(`${ANNOUNCEMENTS_URL}/${id}`, data);
        return response.data;
    },
    
    
    /**
     * Alternar estado Activo/Inactivo rápidamente.
     */
    toggleActive: async (id: number): Promise<Announcement> => {
        const response = await httpStore.patch<Announcement>(`${ANNOUNCEMENTS_URL}/${id}/toggle`);
        return response.data;
    },

   
};