import { httpAuth } from '../httpAuth'; // 💡 Importa el nuevo cliente de Axios para AUTH
// Importaciones de tipos de ejemplo no son necesarias aquí, las eliminamos.

// ⚠️ Definición de la URL base RELATIVA al baseURL de httpAuth


const AUTH_API_BASE_URL = 'http://localhost:8080/api/auth/users'; 
const ROLES_API_BASE_URL = 'http://localhost:8080/api/auth/roles'; 

// --- Definiciones de Tipos ---

export interface InternalUser {
    id: number;
    username: string; // Email
    auth0Id: string | null;
    roles: string[]; // Nombres de los roles (ej: "ROLE_ADMIN", "ROLE_SELLER")
}

export interface InternalUserPayload {
    username: string;
    roleNames: string[]; // Roles a asignar/actualizar
    password?: string; // Opcional
}

// -----------------------------------------------------------

export const InternalUserService = {
    /**
     * Obtener todos los usuarios internos (trabajadores).
     * GET /api/auth/users/internal
     */
    getAll: async (): Promise<InternalUser[]> => {
        // httpAuth.get('/auth/users/internal') -> http://localhost:8080/api/auth/users/internal
        const response = await httpAuth.get<InternalUser[]>(`${AUTH_API_BASE_URL}/internal`);
        return response.data;
    },

    /**
     * Obtener la lista de roles disponibles.
     * GET /api/auth/roles 
     */
    getAvailableRoles: async (): Promise<string[]> => {
        // httpAuth.get('http://localhost:8080/api/auth/roles') -> ¡FUNCIONA!
        const response = await httpAuth.get<string[]>(ROLES_API_BASE_URL); 
        return response.data.filter((role: string) => role !== 'ROLE_CLIENT'); 
    },
};