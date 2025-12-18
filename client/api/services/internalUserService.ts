

import { httpAuth } from '../httpAuth'; 

const AUTH_API_BASE_URL = 'http://localhost:8080/api/auth/users'; 
const ROLES_API_BASE_URL = 'http://localhost:8080/api/auth/roles'; 



export interface InternalUser {
    id: number;
    username: string;
    auth0Id: string | null;
    firstName?: string;
    lastName?: string;
    roles: string[];
}



export const InternalUserService = {
    /**
     * Obtener todos los usuarios internos (trabajadores).
     * GET /api/auth/users/internal
     */
    getAll: async (): Promise<InternalUser[]> => {
        const response = await httpAuth.get<InternalUser[]>(`${AUTH_API_BASE_URL}/internal`);
        return response.data;
    },

    /**
     * Obtiene solo los usuarios con el rol de Vendedor.
     * Reutiliza getAll y filtra en el frontend.
     */
    getSellers: async (): Promise<Array<{ id: number; name: string }>> => {
        const users = await InternalUserService.getAll();
        const SELLER_ROLE_NAME = "ROLE_SELLER"; 

        return users
            .filter(user => user.roles.includes(SELLER_ROLE_NAME))
            .map(user => ({
                id: user.id,

                name: (user.firstName && user.lastName) 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.username
            }));
    },

    /**
     * Obtener la lista de roles disponibles.
     * GET /api/auth/roles 
     */
    getAvailableRoles: async (): Promise<string[]> => {
        const response = await httpAuth.get<string[]>(ROLES_API_BASE_URL); 
        return response.data.filter((role: string) => role !== 'ROLE_CLIENT'); 
    },
};