import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { http } from '../api/http'; 
import { httpStore } from '../api/httpStore'; // 🛑 IMPORTAR EL NUEVO CLIENTE 🛑

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

        // 1. Limpia los interceptores existentes para evitar duplicados
        http.interceptors.request.clear();
        httpStore.interceptors.request.clear(); // 🛑 LIMPIAR TAMBIÉN HTTPSTORE 🛑

        if (isAuthenticated && token) {
            
            const requestInterceptor = (config: any) => { // Usamos 'any' para evitar problemas de tipado
                // Si la cabecera 'Authorization' no está definida, la establecemos.
                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log(`[AXIOS] 🔑 Adjuntando Token JWT a: ${config.url}`);
                }
                return config;
            };

            const errorInterceptor = (error: any) => {
                // Manejo de errores de petición
                return Promise.reject(error);
            };

            // 🛑 2. AÑADE EL INTERCEPTOR A AMBOS CLIENTES 🛑
            const interceptorIdHttp = http.interceptors.request.use(requestInterceptor, errorInterceptor);
            const interceptorIdHttpStore = httpStore.interceptors.request.use(requestInterceptor, errorInterceptor);

            // 3. Función de limpieza
            return () => {
                http.interceptors.request.eject(interceptorIdHttp);
                httpStore.interceptors.request.eject(interceptorIdHttpStore); // 🛑 REMOVER AMBOS 🛑
                console.log("[AXIOS] 🧹 Interceptores removidos.");
            };
        }
        
        return () => {};

    }, [token, isAuthenticated]);

    return <>{children}</>;
};

export default AuthAxiosProvider;