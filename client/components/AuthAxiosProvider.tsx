// client/components/AuthAxiosProvider.tsx (Crear/Copiar este archivo)

import React, { useEffect } from 'react';
import axios from 'axios'; // Asumo que usas axios, si usas fetch, adapta http.ts
import { useAuth } from '../hooks/useAuth'; 
import { useAuthStore } from '../store/auth'; // Asegúrate de que esta ruta sea correcta

const AuthAxiosProvider = ({ children }: { children: React.ReactNode }) => {
    // Obtener la función para renovar el token y el estado de la tienda
    const { getAuthToken } = useAuth();
    const { isAuthReady } = useAuthStore(); 

    useEffect(() => {
        if (!isAuthReady) return;

        // 1. Crear el interceptor de peticiones
        const requestInterceptor = axios.interceptors.request.use(async (config) => {
            // ✅ Solo añade el token a las llamadas a tu propio backend
            if (config.url?.startsWith('http://localhost:8082') || config.url?.startsWith('/api')) {
                const result = await getAuthToken(); // Obtener el token actualizado
                if (result?.token) {
                    config.headers.Authorization = `Bearer ${result.token}`;
                }
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        // 2. Limpiar el interceptor al desmontar el componente
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [isAuthReady, getAuthToken]);

    return <>{children}</>;
};

export default AuthAxiosProvider;