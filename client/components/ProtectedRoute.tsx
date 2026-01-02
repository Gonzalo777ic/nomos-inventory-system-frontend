import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

const ROLE_CLAIM_KEY = "https://nomosstore.com/roles";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  // 1. Mientras Auth0 se inicializa, mostramos pantalla de carga
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-medium text-emerald-600 animate-pulse">Verificando permisos...</div>
      </div>
    );
  }

  // 2. Si NO está autenticado, mandamos a login (Caso base)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si está autenticado, verificamos roles
  const userRoles: string[] = (user as any)?.[ROLE_CLAIM_KEY] || [];
  const isStaff = userRoles.some((role) => role !== "ROLE_CLIENT");

  // 🔑 CORRECCIÓN CRUCIAL: Si está autenticado pero NO tiene roles de staff, 
  // mostramos un error en lugar de redirigir a /login para evitar el bucle infinito.
  if (!isStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Restringido</h1>
        <p className="text-gray-600 text-center max-w-md">
          Tu cuenta ({user?.email}) no tiene asignado un rol administrativo o de gestión en Auth0. 
          Contacta al administrador para que te asigne el rol ROLE_ADMIN, ROLE_SUPPLIER, etc.
        </p>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Volver a Intentar
        </button>
      </div>
    );
  }

  // 4. Verificación granular por roles permitidos (para rutas específicas)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    if (!hasPermission) {
      // Si no tiene permiso específico, lo mandamos al dashboard (que es Staff)
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;