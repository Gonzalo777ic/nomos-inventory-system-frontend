import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthAxiosProvider from './components/AuthAxiosProvider';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth'; 

// Importaciones de páginas (Asegurando que todas las rutas existan)
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory'; 
import Sales from './pages/Sales';       
import Reports from './pages/Reports';   
import Alerts from './pages/Alerts';     
import Suppliers from './pages/Suppliers'; 
import NotFound from './pages/NotFound';

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
    // [DEBUG] Comprobación de que AppContent está intentando renderizar
    console.log("[DEBUG] 2. Renderizando AppContent. Verificando Auth0 state.");

    // 🛑 Obtener isLoading del hook de Auth0
    const { isLoading, error } = useAuth0();

    // 🛑 Si Auth0 está cargando, muestra la pantalla de carga
    if (isLoading) {
        console.log("[DEBUG] 2a. Auth0 está Cargando (isLoading=true). Mostrando LoadingScreen.");
        return <LoadingScreen />;
    }

    if (error) {
        console.error("[DEBUG] 2b. Error de Auth0 detectado:", error);
        return <div className="p-8 text-red-600 font-bold">Error de Autenticación: {error.message}</div>;
    }
    
    console.log("[DEBUG] 2c. Auth0 ha terminado de cargar. Renderizando rutas.");

    return (
        <AuthSync> {/* Nuevo componente de sincronización */}
            <AuthAxiosProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Routes>
                            {/* RUTAS SIN LAYOUT (públicas o de autenticación) */}
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<NotFound />} /> 

                            {/* RUTAS DENTRO DEL LAYOUT (PROTEGIDAS) */}
                            {/* ProtectedRoute verifica la autenticación. Layout dibuja el menú. */}
                            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/inventory" element={<Inventory />} />
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
    // [DEBUG] Comprobación de que App se está montando
    console.log("[DEBUG] 1. Inicializando App (Auth0Provider) con credenciales.");

    // ⚠️ REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES REALES DE AUTH0
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'AUTH0_DOMAIN_REDACTED'; // ⬅️ Usando tu valor de "store"
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'AUTH0_CLIENT_ID_REDACTED'; // ⬅️ Usando tu valor de "store"
    // La URL de retorno DEBE ser la base de tu frontend (ej: http://localhost:5173 o https://nomos.app)
    const redirectUri = window.location.origin; 
    
    // Configuración para que Auth0 retorne información adicional (como roles)
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://nomos.inventory.api'; // ⬅️ Usando tu valor de "store"

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience: audience,
                scope: 'openid profile email read:products write:products', // Ajusta los scopes según tu API
            }}
            // Añadir cacheLocation="localstorage" puede ayudar a la carga si no está ya en el root.
            cacheLocation="localstorage"
        >
            <AppContent />
        </Auth0Provider>
    );
};

export default App;
