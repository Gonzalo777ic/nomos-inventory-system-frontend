/// <reference types="vite/client" />
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthAxiosProvider from './components/AuthAxiosProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/auth'; 
import { Toaster } from 'react-hot-toast'; 

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
import Warehouses from './pages/Warehouses'; 
import PaymentMethods from './pages/PaymentMethods'; 

const queryClient = new QueryClient();

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-medium text-emerald-600 dark:text-emerald-400">Cargando aplicación...</div>
    </div>
);

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
                    .then(token => useAuthStore.getState().setToken(token))
                    .catch(err => console.error("Error al obtener el token:", err));
            }
        }
    }, [isAuthenticated, isLoading, user, getAccessTokenSilently, syncAuth, auth0LogoutFunc, setAuth0Logout]);

    return <>{children}</>;
};

const AppContent = () => {
    const { isLoading, error } = useAuth0();

    if (isLoading) return <LoadingScreen />;
    if (error) return <div className="p-8 text-red-600 font-bold">Error de Autenticación: {error.message}</div>;

    const ADMIN_ONLY = ['ROLE_ADMIN'];
    const SALES_ROLES = ['ROLE_ADMIN', 'ROLE_SELLER'];

    return (
        <AuthSync> 
            <AuthAxiosProvider>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            
                            {/* Grupo Protegido Principal */}
                            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/products" element={<Products />} /> 
                                <Route path="/purchases" element={<Purchases />} /> 
                                <Route path="/alerts" element={<Alerts />} />
                                <Route path="/store-schedule" element={<StoreSchedule />} />
                                <Route path="/shipping-guides" element={<ShippingGuides />} />

                                {/* Solo Inventario */}
                                <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_INVENTORY_MANAGER']} />}>
                                    <Route path="/inventory" element={<Inventory />} />
                                    <Route path="/warehouses" element={<Warehouses />} />
                                    <Route path="/suppliers" element={<Suppliers />} />
                                    <Route path="/movements" element={<Movements />} />
                                </Route>

                                {/* Solo Ventas */}
                                <Route element={<ProtectedRoute allowedRoles={SALES_ROLES} />}>
                                    <Route path="/sales" element={<Sales />} />
                                    <Route path="/quotations" element={<Quotations />} />
                                    <Route path="/promotions" element={<Promotions />} />
                                    <Route path="/collections" element={<Collections />} />
                                    <Route path="/returns" element={<Returns />} />
                                </Route>

                                {/* Solo Admin */}
                                <Route element={<ProtectedRoute allowedRoles={ADMIN_ONLY} />}>
                                    <Route path="/users" element={<Users />} />
                                    <Route path="/clients" element={<Clients />} />
                                    <Route path="/brands" element={<Brands />} />
                                    <Route path="/categories" element={<Categories />} />
                                    <Route path="/uom" element={<UOM />} />
                                    <Route path="/attributes" element={<Attributes />} />
                                    <Route path="/taxes" element={<Taxes />} />
                                    <Route path="/payment-methods" element={<PaymentMethods />} />
                                    <Route path="/announcements" element={<Announcements />} />
                                    <Route path="/audit" element={<Audit />} />
                                    <Route path="/reports" element={<Reports />} />
                                </Route>

                                <Route path="/realtime-location" element={<RealtimeLocation />} />
                                <Route path="/deliveries" element={<Deliveries />} />
                            </Route>

                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<NotFound />} /> 
                        </Routes>
                    </BrowserRouter>
                </QueryClientProvider>
            </AuthAxiosProvider>
        </AuthSync>
    );
};

const App = () => {
    // 🔑 import.meta.env ahora será reconocido por la referencia al inicio del archivo
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'AUTH0_DOMAIN_REDACTED'; 
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'AUTH0_CLIENT_ID_REDACTED'; 
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://nomos.inventory.api'; 

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: audience,
                scope: 'openid profile email read:products write:products',
            }}
            cacheLocation="localstorage"
        >
            <AppContent />
            <Toaster position="bottom-right" />
        </Auth0Provider>
    );
};

export default App;