import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// 🔑 CONFIGURACIÓN CLAVE
const REQUIRED_ROLE = 'ROLE_ADMIN'; 
const ROLE_CLAIM_KEY = 'https://nomosstore.com/roles';
const UNAUTHORIZED_FLAG = 'unauthorized_access'; 

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Obtenemos los estados esenciales del store
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const isAuthReady = useAuthStore(state => state.isAuthReady);
    const auth0LogoutFn = useAuthStore(state => state.auth0LogoutFn); 
    
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
        // Esto cubre el caso de que el logout (Paso 4) ya haya limpiado el estado.
        return <Navigate to="/login" replace />;
    }
    
    // 3. LÓGICA CLAVE DE VERIFICACIÓN DE ROL SÍNCRONA
    // Recuperar los roles. Si el user está en el store, debería contener los claims de roles.
    // **NOTA:** Esto ASUME que el 'user' en el store ya está enriquecido con los claims del ID Token.
    // Si no es el caso, debes usar la función getAuthToken() y esperar a que resuelva,
    // pero por ahora, sigamos la estructura existente.
    const userRoles: string[] = (user as any)?.[ROLE_CLAIM_KEY] || [];
    
    // **Mejora:** Chequeamos si tiene el rol REQUIRED_ROLE o cualquier rol interno (no-CLIENTE),
    // asumiendo que solo los clientes puros no deberían ver rutas internas.
    const hasSufficientRole = userRoles.includes(REQUIRED_ROLE) || 
                              userRoles.some(role => role !== 'ROLE_CLIENT');
    
    
    // 4. 🛑 REDIRECCIÓN INMEDIATA POR ACCESO DENEGADO (¡La solución al bucle!)
    if (!hasSufficientRole) {
        // Prepara el mensaje de error para Login.tsx
        localStorage.setItem(UNAUTHORIZED_FLAG, 'true');
        
        console.error(`[AUTH BLOCKED] Usuario ${user?.email || 'N/A'} sin rol. Requerido: ${REQUIRED_ROLE}. Roles actuales: ${userRoles.join(', ')}`);
        
        // 🏆 FIX CLAVE: Disparamos el logout y luego la redirección.
        // La llamada a auth0LogoutFn() debe ser ASÍNCRONA y solo un SIDE EFFECT.
        if (auth0LogoutFn) {
            // El logout detendrá la sesión de Auth0 y disparará una redirección a /login
            // por la configuración de Auth0Provider. Por seguridad, lo disparamos.
            auth0LogoutFn(); 
        }
        
        // 🛑 Usamos Navigate para romper el bucle de renderizado inmediatamente
        // y asegurar que la ruta actual no se complete.
        // Esto garantiza que el usuario siempre vea la pantalla de login.
        return <Navigate to="/login" replace />;
    }

    // 5. Acceso Permitido
    return <>{children}</>;
};

export default ProtectedRoute;