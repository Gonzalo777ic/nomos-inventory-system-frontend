import React, { useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const REQUIRED_ROLE = 'ROLE_ADMIN'; 
const ROLE_CLAIM_KEY = 'https://nomosstore.com/roles';
const UNAUTHORIZED_FLAG = 'unauthorized_access'; // Bandera de persistencia para el mensaje

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const isAuthReady = useAuthStore(state => state.isAuthReady);
    const auth0LogoutFn = useAuthStore(state => state.auth0LogoutFn); 
    
    // Eliminamos isRedirecting. Ahora usamos el chequeo síncrono.

    // 1. Estado de carga inicial (para evitar flicker)
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-xl font-medium text-emerald-600">Verificando permisos...</div>
            </div>
        );
    }

    // 2. Redirección por No Autenticado (Estado Limpio)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // 3. 🛑 LÓGICA CLAVE DE VERIFICACIÓN DE ROL SÍNCRONA
    // Esto se ejecuta en cada renderizado ANTES de que se intente renderizar el children.
    const userRoles = (user as any)?.[ROLE_CLAIM_KEY] || [];
    const hasRequiredRole = userRoles.includes(REQUIRED_ROLE);
    
    
    // 4. LÓGICA ASÍNCRONA DE LOGOUT (Solo como Side Effect)
    // Este useEffect dispara el logout y la redirección de página COMPLETA.
    useEffect(() => {
        if (!hasRequiredRole && isAuthenticated && auth0LogoutFn) {
            console.error(`[AUTH BLOCKED] Usuario ${user.email} intentó acceder. Se requiere: ${REQUIRED_ROLE}`);
            
            // PASO 1: Persistir el mensaje de error.
            localStorage.setItem(UNAUTHORIZED_FLAG, 'true');
            
            // PASO 2: Disparar el logout y la redirección de página completa.
            // Esto detendrá la aplicación React y redirigirá al Login, donde se mostrará el toast.
            auth0LogoutFn();
        }
    // Añadimos las dependencias
    }, [hasRequiredRole, isAuthenticated, auth0LogoutFn, user]);

    
    // 5. 🛑 FIX DEL FLICKER: RENDERIZADO CONDICIONAL INMEDIATO
    if (!hasRequiredRole) {
        // Al denegar el acceso aquí, el Dashboard NUNCA se renderiza.
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-xl font-medium text-red-600">Acceso no autorizado. Redirigiendo...</div>
            </div>
        );
    }

    // 6. Acceso Permitido
    return <>{children}</>;
};

export default ProtectedRoute;
