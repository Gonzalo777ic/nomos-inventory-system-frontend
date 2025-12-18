import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { http } from '../api/http'; 
import { httpStore } from '../api/httpStore';

/**
 * Componente que intercepta todas las peticiones de Axios y adjunta 
 * el token JWT del usuario, necesario para acceder a la API de Spring Boot.
 */
const AuthAxiosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const token = useAuthStore(state => state.token);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    
    useEffect(() => {
        console.log("[AXIOS] Configurando Interceptor. Token actual:", token ? "Presente" : "Ausente");


        http.interceptors.request.clear();
        httpStore.interceptors.request.clear();

        if (isAuthenticated && token) {
            
            const requestInterceptor = (config: any) => {

                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log(`[AXIOS] 🔑 Adjuntando Token JWT a: ${config.url}`);
                }
                return config;
            };

            const errorInterceptor = (error: any) => {

                return Promise.reject(error);
            };


            const interceptorIdHttp = http.interceptors.request.use(requestInterceptor, errorInterceptor);
            const interceptorIdHttpStore = httpStore.interceptors.request.use(requestInterceptor, errorInterceptor);


            return () => {
                http.interceptors.request.eject(interceptorIdHttp);
                httpStore.interceptors.request.eject(interceptorIdHttpStore);
                console.log("[AXIOS] 🧹 Interceptores removidos.");
            };
        }
        
        return () => {};

    }, [token, isAuthenticated]);

    return <>{children}</>;
};

export default AuthAxiosProvider;