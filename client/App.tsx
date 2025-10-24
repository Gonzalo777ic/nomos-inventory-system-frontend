import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthAxiosProvider from './components/AuthAxiosProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth'; 

// Importaciones de páginas
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
import Layout from './components/layout/Layout'; // Layout para las rutas protegidas

const queryClient = new QueryClient();

// Componente simple de carga (para mostrar algo mientras Auth0 inicializa)
const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium text-emerald-600">Cargando aplicación...</div>
    </div>
);


// Este componente encapsula la lógica de sincronización del estado de Auth0 con Zustand
const AuthSync = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
    const syncAuth = useAuthStore((state) => state.syncAuth);
    
    // 🛑 IMPORTANTE: Este useEffect es clave para sincronizar y obtener el token.
    useEffect(() => {
        if (!isLoading) {
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
    }, [isAuthenticated, isLoading, user, getAccessTokenSilently, syncAuth]);

    return <>{children}</>;
};


const AppContent = () => {
    // 🛑 Obtener isLoading del hook de Auth0
    const { isLoading, error } = useAuth0();

    // 🛑 Si Auth0 está cargando, muestra la pantalla de carga
    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="p-8 text-red-600 font-bold">Error de Autenticación: {error.message}</div>;
    }
    
    return (
        <AuthSync> {/* Componente de sincronización */}
            <AuthAxiosProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Routes>
                            {/* RUTAS SIN LAYOUT (públicas o de autenticación) */}
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/404" element={<NotFound />} />
                            {/* Catch-all para rutas no definidas */}
                            <Route path="*" element={<NotFound />} /> 

                            {/* RUTAS DENTRO DEL LAYOUT (PROTEGIDAS) */}
                            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                
                                {/* 🎯 CORRECCIÓN: /inventory carga el componente Inventory (Gestión de Stock) */}
                                <Route path="/inventory" element={<Inventory />} /> 
                                
                                {/* 🎯 NUEVA RUTA: /products carga el CRUD de Productos (Catálogo) */}
                                <Route path="/products" element={<Products />} /> 

                                <Route path="/sales" element={<Sales />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/alerts" element={<Alerts />} />
                                <Route path="/suppliers" element={<Suppliers />} />

                                {/* Redirige la ruta raíz de la app a /dashboard si está logueado */}
                                <Route path="/app" element={<Dashboard />} /> 
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </QueryClientProvider>
            </AuthAxiosProvider>
        </AuthSync>
    );
};


// 🛑 Este es el componente principal que debe envolver toda la aplicación con Auth0Provider
const App = () => {
    // ⚠️ REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES REALES DE AUTH0
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-663twfpev8syoqq5.us.auth0.com'; 
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'UAn2A8nk0ZMwYrHt1JtvlXGRh7IBU8G5'; 
    // La URL de retorno DEBE ser la base de tu frontend 
    const redirectUri = window.location.origin; 
    
    // Configuración para que Auth0 retorne información adicional (como roles)
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://nomos.inventory.api'; 

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience: audience,
                scope: 'openid profile email read:products write:products', // Ajusta los scopes según tu API
            }}
            cacheLocation="localstorage"
        >
            <AppContent />
        </Auth0Provider>
    );
};

export default App;
