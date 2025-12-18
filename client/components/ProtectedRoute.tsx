import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}


const REQUIRED_ROLE = 'ROLE_ADMIN'; 
const ROLE_CLAIM_KEY = 'https://nomosstore.com/roles';
const UNAUTHORIZED_FLAG = 'unauthorized_access'; 

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);
    const isAuthReady = useAuthStore(state => state.isAuthReady);
    const auth0LogoutFn = useAuthStore(state => state.auth0LogoutFn); 
    

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-xl font-medium text-emerald-600">Verificando permisos...</div>
            </div>
        );
    }


    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;
    }
    





    const userRoles: string[] = (user as any)?.[ROLE_CLAIM_KEY] || [];
    


    const hasSufficientRole = userRoles.includes(REQUIRED_ROLE) || 
                              userRoles.some(role => role !== 'ROLE_CLIENT');
    
    

    if (!hasSufficientRole) {

        localStorage.setItem(UNAUTHORIZED_FLAG, 'true');
        
        console.error(`[AUTH BLOCKED] Usuario ${user?.email || 'N/A'} sin rol. Requerido: ${REQUIRED_ROLE}. Roles actuales: ${userRoles.join(', ')}`);
        


        if (auth0LogoutFn) {


            auth0LogoutFn(); 
        }
        



        return <Navigate to="/login" replace />;
    }


    return <>{children}</>;
};

export default ProtectedRoute;