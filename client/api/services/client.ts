import { httpAuth } from '../httpAuth';


const CLIENT_API_BASE_URL = 'http://localhost:8080/api/auth/clients'; 

export interface Client {
    id: number;
    auth0Id: string | null;
    email: string;
    fullName: string;
    documentType: string | null;
    documentNumber: string | null;
    phone: string | null;
    address: string | null;
}


export interface DocumentTypeRef {
    key: string;
    description: string;
}

export const ClientService = {
    /**
     * Obtener todos los clientes externos.
     * GET /api/auth/clients
     */
    getAll: async (): Promise<Client[]> => {
        const response = await httpAuth.get<Client[]>(CLIENT_API_BASE_URL);
        return response.data;
    },
    
    /**
     * Obtener los tipos de documentos fiscales (DNI, RUC, etc.) desde el backend.
     * GET /api/auth/clients/document-types
     */
    getDocumentTypes: async (): Promise<DocumentTypeRef[]> => {
        const response = await httpAuth.get<DocumentTypeRef[]>(`${CLIENT_API_BASE_URL}/document-types`);
        return response.data;
    }
};