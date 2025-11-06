import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthAxiosProvider from './components/AuthAxiosProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth'; 
import { Toaster } from 'react-hot-toast'; 

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

// Importaciones de NUEVAS páginas placeholder
import Purchases from './pages/Purchases';
import Quotations from './pages/Quotations';
import Promotions from './pages/Promotions';
import Collections from './pages/Collections';
import Returns from './pages/Returns';
import ShippingGuides from './pages/ShippingGuides';
import Deliveries from './pages/Deliveries';
import RealtimeLocation from './pages/RealtimeLocation';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Brands from './pages/Brands';
import Categories from './pages/Categories';
import UOM from './pages/UOM';
import Attributes from './pages/Attributes';
import Taxes from './pages/Taxes';
import Announcements from './pages/Announcements';
import Movements from './pages/Movements';
import Audit from './pages/Audit';
import StoreSchedule from './pages/StoreSchedule';
// 🎯 NUEVA IMPORTACIÓN: Warehouse
import Warehouses from './pages/Warehouses'; 
import PaymentMethods from './pages/PaymentMethods'; 


const queryClient = new QueryClient();

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-medium text-emerald-600 dark:text-emerald-400">Cargando aplicación...</div>
    </div>
);


// Componente que encapsula la lógica de sincronización
const AuthSync = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, getAccessTokenSilently, isLoading, logout: auth0LogoutFunc } = useAuth0();
    const syncAuth = useAuthStore((state) => state.syncAuth);
    const setAuth0Logout = useAuthStore((state) => state.setLogoutFunction); 
    
    useEffect(() => {
        if (!isLoading) {
            setAuth0Logout(auth0LogoutFunc);
            
            syncAuth(isAuthenticated, user); 
            
            if (isAuthenticated) {
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
        return <div className="p-8 text-red-600 font-bold dark:text-red-400">Error de Autenticación: {error.message}</div>;
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
                                
                                {/* --- RUTAS AÑADIDAS DEL SIDEBAR --- */}
                                
                                {/* Inventario y Abastecimiento */}
                                <Route path="/purchases" element={<Purchases />} />
                                {/* 🎯 NUEVA RUTA: Warehouse */}
                                <Route path="/warehouses" element={<Warehouses />} />
                                
                                {/* Ventas y Caja */}
                                <Route path="/quotations" element={<Quotations />} />
                                <Route path="/promotions" element={<Promotions />} />
                                <Route path="/collections" element={<Collections />} />
                                <Route path="/returns" element={<Returns />} />
                                
                                {/* Logística y Envíos */}
                                <Route path="/shipping-guides" element={<ShippingGuides />} />
                                <Route path="/deliveries" element={<Deliveries />} />
                                <Route path="/realtime-location" element={<RealtimeLocation />} />
                                
                                {/* Maestros y Configuración */}
                                <Route path="/users" element={<Users />} />
                                <Route path="/clients" element={<Clients />} />
                                <Route path="/brands" element={<Brands />} />
                                <Route path="/categories" element={<Categories />} />
                                <Route path="/uom" element={<UOM />} />
                                <Route path="/attributes" element={<Attributes />} />
                                <Route path="/taxes" element={<Taxes />} />
                                <Route path="/payment-methods" element={<PaymentMethods />} />
                                <Route path="/announcements" element={<Announcements />} />

                                {/* Reportes y Sistema */}
                                <Route path="/movements" element={<Movements />} />
                                <Route path="/audit" element={<Audit />} />
                                <Route path="/store-schedule" element={<StoreSchedule />} />

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