import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { http } from '../api/http'; // Asegúrate que esta es tu instancia de Axios

/**
 * Componente que intercepta todas las peticiones de Axios y adjunta 
 * el token JWT del usuario, necesario para acceder a la API de Spring Boot.
 */
const AuthAxiosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Obtenemos el token del store de Zustand (sincronizado desde Auth0)
    const token = useAuthStore(state => state.token);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    
    useEffect(() => {
        console.log("[AXIOS] Configurando Interceptor. Token actual:", token ? "Presente" : "Ausente");

        // 1. Elimina cualquier interceptor existente antes de añadir uno nuevo
        // Esto evita múltiples interceptores si el componente se renderiza dos veces.
        http.interceptors.request.clear();

        if (isAuthenticated && token) {
            // 2. Añade el interceptor SÓLO si hay un usuario autenticado y un token.
            const interceptor = http.interceptors.request.use(
                (config) => {
                    // Si la cabecera 'Authorization' no está definida, la establecemos.
                    if (!config.headers.Authorization) {
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log(`[AXIOS] 🔑 Adjuntando Token JWT a: ${config.url}`);
                    }
                    return config;
                },
                (error) => {
                    // Manejo de errores de petición (ej. antes de ser enviada)
                    return Promise.reject(error);
                }
            );

            // 3. Función de limpieza para remover el interceptor cuando el componente se desmonte
            return () => {
                http.interceptors.request.eject(interceptor);
                console.log("[AXIOS] 🧹 Interceptor removido.");
            };
        }
        
        // Si no hay token o no está autenticado, no añadimos el interceptor.
        // Esto permite que peticiones a rutas públicas sigan funcionando, aunque aquí todas
        // las rutas de la API están protegidas.
        return () => {};

    }, [token, isAuthenticated]); // Se ejecuta cada vez que el token o el estado de autenticación cambia

    return <>{children}</>;
};

export default AuthAxiosProvider;
