import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// Roles permitidos para este sistema de Inventario (solo ADMIN)
const REQUIRED_ROLE = 'ROLE_ADMIN'; 
// La clave del custom claim donde Auth0 inyecta los roles
const ROLE_CLAIM_KEY = 'https://nomosstore.com/roles';


const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Seleccionar propiedades individualmente para evitar el bucle infinito de Zustand
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const isAuthReady = useAuthStore(state => state.isAuthReady);
    
    // 🎯 NUEVO: Importar la función logout
    const logout = useAuthStore(state => state.logout);
    
    if (!isAuthReady) {
        console.log("[DEBUG] ProtectedRoute: Esperando a que AuthStore esté listo...");
        return null;
    }

    // 1. Verificar Autenticación
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Verificar Rol
    const userRoles = (user as any)?.[ROLE_CLAIM_KEY] || [];
    const hasRequiredRole = userRoles.includes(REQUIRED_ROLE);


    if (!hasRequiredRole) {
        // [DEBUG] Bloqueo de Acceso
        console.error(`[AUTH BLOCKED] Usuario ${user?.email} intentó acceder. Roles obtenidos: [${userRoles.join(', ')}]. Se requiere rol: ${REQUIRED_ROLE}`);
        
        // Mostrar un mensaje de acceso denegado en lugar de un redirect brusco
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
                <p className="text-gray-700 dark:text-gray-300">Tu cuenta ({user?.email}) no tiene el rol necesario (<span className="font-mono bg-red-100 text-red-700 px-1 rounded">{REQUIRED_ROLE}</span>) para acceder a este sistema de inventario.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Por favor, contacta al administrador del sistema.</p>
                <button 
                    // 🎯 CORRECCIÓN: Llamar a logout() antes de redirigir para cerrar la sesión de Auth0
                    onClick={() => {
                        logout(); // Cierra la sesión en Auth0 y limpia el estado local
                        window.location.href = "/login"; // Fuerza la redirección a la página de login
                    }} 
                    className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition"
                >
                    Volver a Iniciar Sesión
                </button>
            </div>
        );
    }
    
    // Acceso permitido
    return <>{children}</>;
};

export default ProtectedRoute;
