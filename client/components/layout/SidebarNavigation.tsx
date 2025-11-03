import React from 'react';
import { NavLink } from "react-router-dom";
import { SubMenu } from './SubMenu'; // Importamos el componente desplegable
// 🎯 ÍCONOS DE LUCIDE-REACT IMPORTADOS
import { 
    Home, 
    Package, 
    DollarSign, 
    Truck, 
    Settings, 
    BarChart3,
    Icon, 
} from 'lucide-react'; 

// Definimos el tipo para las props de NavItem
interface NavItemProps {
    to: string;
    label: string;
    // Utilizamos React.ElementType para poder pasar cualquier componente de ícono de Lucide
    icon: React.ElementType<any>; 
}

// Función para un NavItem simple (ej: Dashboard)
function NavItem({ to, label, icon: IconComponent }: NavItemProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 transition-colors font-medium ${
                    isActive 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" 
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
            }
            end
        >
            {/* Renderizamos el componente de ícono */}
            <IconComponent className="h-5 w-5" /> 
            <span>{label}</span>
        </NavLink>
    );
}

// Componente principal del menú lateral
export const SidebarNavigation: React.FC = () => {

    return (
        <nav className="mt-6 space-y-2 text-sm">
            
            {/* 1. INICIO */}
            <NavItem to="/dashboard" label="Dashboard" icon={Home} />
            
            {/* 2. INVENTARIO Y ABASTECIMIENTO (Inventory-Service) */}
            <SubMenu label="Inventario" icon={<Package className="h-5 w-5" />}>
                {[
                    { to: "/products", label: "Catálogo de Productos" }, // Product, Category, ProductAttribute
                    { to: "/inventory", label: "Inventario Físico (Lotes)" }, // InventoryItem, Warehouse
                    { to: "/suppliers", label: "Proveedores" }, // Supplier
                    { to: "/purchases", label: "Órdenes de Abastecimiento" }, // PurchaseOrder
                ]}
            </SubMenu>

            {/* 3. VENTAS Y COBRANZAS (Store-Service) */}
            <SubMenu label="Ventas & Caja" icon={<DollarSign className="h-5 w-5" />}>
                {[
                    { to: "/sales", label: "Registro de Ventas" }, // Sale, SaleDetail, Invoice
                    { to: "/quotations", label: "Cotizaciones" }, // Quotation
                    { to: "/promotions", label: "Promociones y Ofertas" }, // Promotion, PriceList
                    { to: "/collections", label: "Gestión de Cobranzas" }, // Collection, PaymentMethod
                    { to: "/returns", label: "Gestión de Devoluciones" }, // Return
                ]}
            </SubMenu>

            {/* 4. LOGÍSTICA (Logistics-Service) */}
            <SubMenu label="Logística & Envíos" icon={<Truck className="h-5 w-5" />}>
                {[
                    { to: "/shipping-guides", label: "Guías de Remisión" }, // ShippingGuide
                    { to: "/deliveries", label: "Asignación de Delivery" }, // DeliveryAssignment
                    { to: "/realtime-location", label: "Ubicación en Tiempo Real" }, // RealTimeLocation
                ]}
            </SubMenu>
            
            {/* 5. CONFIGURACIÓN MAESTRA (Auth/Inventory/Store - Tablas de Apoyo) */}
            <SubMenu label="Maestros & Config" icon={<Settings className="h-5 w-5" />}>
                {[
                    { to: "/users", label: "Usuarios y Roles" }, // User, Role
                    { to: "/clients", label: "Clientes" }, // Client
                    { to: "/categories", label: "Clasificación (Categorías)" }, // Category
                    { to: "/uom", label: "Unidades de Medida" }, // UnitOfMeasure
                    { to: "/attributes", label: "Atributos de Producto" }, // ProductAttribute
                    { to: "/taxes", label: "Tasas de Impuesto" }, // TaxRate
                    { to: "/announcements", label: "Anuncios y Comunicados" }, // Announcement
                ]}
            </SubMenu>
            
            {/* 6. REPORTES Y SISTEMA (General) */}
            <SubMenu label="Reportes & Sistema" icon={<BarChart3 className="h-5 w-5" />}>
                {[
                    { to: "/reports", label: "Generador de Reportes" }, // Reports (custom page)
                    { to: "/alerts", label: "Alertas de Stock" }, // Notification
                    { to: "/movements", label: "Historial de Movimientos" }, // InventoryMovement
                    { to: "/audit", label: "Registro de Auditoría" }, // AuditLog
                    { to: "/store-schedule", label: "Horarios de Atención" }, // StoreSchedule, ClosureDate
                ]}
            </SubMenu>
        </nav>
    );
};
