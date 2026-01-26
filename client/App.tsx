import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import AuthAxiosProvider from "./components/AuthAxiosProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./hooks/useAuth";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Purchases from "./pages/Purchases";
import Quotations from "./pages/Quotations";
import Promotions from "./pages/Promotions";
import Collections from "./pages/Collections";
import Returns from "./pages/Returns";
import ShippingGuides from "./pages/ShippingGuides";
import Deliveries from "./pages/Deliveries";
import RealtimeLocation from "./pages/RealtimeLocation";
import Users from "./pages/Users";
import Clients from "./pages/Clients";
import Brands from "./pages/Brands";
import Categories from "./pages/Categories";
import UOM from "./pages/UOM";
import Attributes from "./pages/Attributes";
import Taxes from "./pages/Taxes";
import Announcements from "./pages/Announcements";
import AccountingMovements from "./pages/AccountingMovements";
import Audit from "./pages/Audit";
import StoreSchedule from "./pages/StoreSchedule";
import Warehouses from "./pages/Warehouses";
import PaymentMethods from "./pages/PaymentMethods";

import { QuotationReviewAdmin } from "./components/forms/QuotationReviewAdmin";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import CreditDocuments from "./pages/CreditDocuments";
import CreditDocumentDetail from "./pages/CreditDocumentDetail";
import LegalEntities from "./pages/LegalEntities";
import GlobalReturnsHistoryPage from "./pages/GlobalReturnsHistoryPage";
import SaleReturnDetailPage from "./pages/SaleReturnDetailPage";
import InventoryMovements from "./pages/InventoryMovements";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-xl font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
      Iniciando sesión...
    </div>
  </div>
);

const AuthSync = ({ children }: { children: React.ReactNode }) => {
  useAuth();
  return <>{children}</>;
};

const AppContent = () => {
  const { isLoading, error } = useAuth0();

  if (isLoading) return <LoadingScreen />;
  if (error)
    return (
      <div className="p-8 text-red-600 font-bold">
        Error de Autenticación: {error.message}
      </div>
    );

  return (
    <AuthSync>
      <AuthAxiosProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/store-schedule" element={<StoreSchedule />} />
                <Route path="/shipping-guides" element={<ShippingGuides />} />

                {}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "ROLE_ADMIN",
                        "ROLE_SELLER",
                        "ROLE_SUPPLIER",
                      ]}
                    />
                  }
                >
                  <Route path="/quotations" element={<Quotations />} />
                  <Route
                    path="/quotations/review/:id"
                    element={<QuotationReviewAdmin />}
                  />
                </Route>

                {}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={["ROLE_ADMIN", "ROLE_INVENTORY_MANAGER"]}
                    />
                  }
                >
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/warehouses" element={<Warehouses />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/accounting-movements" element={<AccountingMovements />} />
                  <Route path="/inventory-movements" element={<InventoryMovements />} />
                </Route>

                {}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={["ROLE_ADMIN", "ROLE_SELLER"]}
                    />
                  }
                >
                  <Route path="/sales" element={<Sales />} />
                  {}
                  <Route path="/promotions" element={<Promotions />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:id" element={<CollectionDetailPage />} />
                  <Route path="/credit-documents" element={<CreditDocuments />} />
                  <Route path="/credit-documents/:id" element={<CreditDocumentDetail />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/returns/history" element={<GlobalReturnsHistoryPage />} />
                  <Route path="/returns/:id" element={<SaleReturnDetailPage />} />
                </Route>

                {}
                <Route
                  element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}
                >
                  <Route path="/users" element={<Users />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/uom" element={<UOM />} />
                  <Route path="/legal-entities" element={<LegalEntities />} />
                  <Route path="/attributes" element={<Attributes />} />
                  <Route path="/taxes" element={<Taxes />} />
                  <Route path="/payment-methods" element={<PaymentMethods />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/reports" element={<Reports />} />
                </Route>

                <Route
                  path="/realtime-location"
                  element={<RealtimeLocation />}
                />
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
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    console.error(
      "Faltan variables de entorno de Auth0 en el archivo .env (VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE)"
    );
    return <div>Error de configuración: Faltan variables de entorno.</div>;
  }
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email read:products write:products",
      }}
      cacheLocation="localstorage"
    >
      <AppContent />
      <Toaster position="bottom-right" />
    </Auth0Provider>
  );
};

export default App;
