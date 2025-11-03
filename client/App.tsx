import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthAxiosProvider from './components/AuthAxiosProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth'; 
import { Toaster } from 'react-hot-toast'; // 🎯 Importar Toaster

// Importaciones de páginas y layout
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products'; 
import Inventory from './pages/Inventory'; 
import Sales from './pages/Sales';       
import Reports from './pages/Reports';   
import Alerts from './pages/Alerts';     
import Suppliers from './pages/Suppliers'; 
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';

const queryClient = new QueryClient();

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium text-emerald-600">Cargando aplicación...</div>
    </div>
);


// Componente que encapsula la lógica de sincronización
const AuthSync = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, getAccessTokenSilently, isLoading, logout: auth0LogoutFunc } = useAuth0();
    const syncAuth = useAuthStore((state) => state.syncAuth);
    const setAuth0Logout = useAuthStore((state) => state.setLogoutFunction); // Nueva acción
    
    useEffect(() => {
        if (!isLoading) {
            // 🎯 CORRECCIÓN CLAVE 1: Inyectar la función de Auth0 logout en la store
            setAuth0Logout(auth0LogoutFunc);
            
            // Sincroniza el estado de Auth0 con tu store de Zustand
            syncAuth(isAuthenticated, user); 
            
            if (isAuthenticated) {
                // Si está autenticado, intenta obtener el token y guardarlo
                getAccessTokenSilently()
                    .then(token => {
                        useAuthStore.getState().setToken(token);
                    })
                    .catch(err => console.error("Error al obtener el token:", err));
            }
        }
    }, [isAuthenticated, isLoading, user, getAccessTokenSilently, syncAuth, auth0LogoutFunc, setAuth0Logout]);

    return <>{children}</>;
};


const AppContent = () => {
    const { isLoading, error } = useAuth0();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="p-8 text-red-600 font-bold">Error de Autenticación: {error.message}</div>;
    }
    
    return (
        <AuthSync> 
            <AuthAxiosProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Routes>
                            {/* RUTAS SIN LAYOUT */}
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<NotFound />} /> 

                            {/* RUTAS DENTRO DEL LAYOUT (PROTEGIDAS) */}
                            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/inventory" element={<Inventory />} /> 
                                <Route path="/products" element={<Products />} /> 
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/alerts" element={<Alerts />} />
                                <Route path="/suppliers" element={<Suppliers />} />
                                <Route path="/app" element={<Dashboard />} /> 
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </QueryClientProvider>
            </AuthAxiosProvider>
        </AuthSync>
    );
};


// 🛑 Componente principal que envuelve la aplicación con Auth0Provider y Toaster
const App = () => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'AUTH0_DOMAIN_REDACTED'; 
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'AUTH0_CLIENT_ID_REDACTED'; 
    const redirectUri = window.location.origin; 
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://nomos.inventory.api'; 

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience: audience,
                scope: 'openid profile email read:products write:products',
            }}
            cacheLocation="localstorage"
        >
            <AppContent />
            {/* 🎯 CORRECCIÓN CLAVE 2: Colocar el Toaster aquí */}
            <Toaster 
                position="bottom-right" 
                containerClassName="p-4"
                toastOptions={{
                    error: {
                        style: {
                            background: '#FEE2E2',
                            color: '#B91C1C',
                        },
                    },
                }}
            />
        </Auth0Provider>
    );
};

export default App;