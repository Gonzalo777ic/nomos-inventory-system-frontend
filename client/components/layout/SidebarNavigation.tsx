import React from 'react';
import { NavLink } from "react-router-dom";
import { SubMenu } from './SubMenu'; // Importamos el componente desplegable
import { 
    Home, 
    Package, 
    DollarSign, 
    Truck, 
    Settings, 
    BarChart3,
    // Íconos adicionales para las subcategorías
    ShoppingCart, // Catálogo de Productos
    Archive, // Inventario Físico (Lotes)
    Users, // Proveedores / Clientes / Usuarios
    ClipboardList, // Órdenes de Abastecimiento / Reportes / Registros
    Tag, // Promociones, Precios, Categorías
    CreditCard, // Cobranzas
    RefreshCw, // Devoluciones
    Map, // Guías de Remisión / Ubicación
    PackageOpen, // Entregas / Delivery
    ClipboardCheck, // Roles / Auditoría
    Scale, // Unidades de Medida
    Ruler, // Atributos
    Percent, // Impuestos
    Megaphone, // Anuncios
    Clock, // Horarios
    AlertTriangle, // Alertas
    Briefcase, // 🎯 NUEVO ÍCONO PARA MARCAS
    Warehouse, // 🎯 NUEVO ÍCONO PARA ALMACÉN
    Wallet,
} from 'lucide-react'; 

// Definimos el tipo para las props de NavItem
interface NavItemProps {
    to: string;
    label: string;
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

// Interfaz que usa SubMenu (ahora con un ícono para el hijo)
interface SubMenuItem {
    to: string; 
    label: string; 
    icon: React.ReactNode; // El ícono para la subcategoría
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
                    { to: "/products", label: "Catálogo de Productos", icon: <ShoppingCart className="h-4 w-4" /> },
                    { to: "/inventory", label: "Inventario Físico (Lotes)", icon: <Archive className="h-4 w-4" /> },
                    // 🎯 AÑADIDO: Gestión de Almacenes
                    { to: "/warehouses", label: "Almacenes y Ubicaciones", icon: <Warehouse className="h-4 w-4" /> }, 
                    { to: "/suppliers", label: "Proveedores", icon: <Users className="h-4 w-4" /> },
                    { to: "/purchases", label: "Órdenes de Abastecimiento", icon: <ClipboardList className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>

            {/* 3. VENTAS Y COBRANZAS (Store-Service) */}
            <SubMenu label="Ventas & Caja" icon={<DollarSign className="h-5 w-5" />}>
                {[
                    { to: "/sales", label: "Registro de Ventas", icon: <ClipboardList className="h-4 w-4" /> },
                    { to: "/quotations", label: "Cotizaciones", icon: <Tag className="h-4 w-4" /> },
                    { to: "/promotions", label: "Promociones y Ofertas", icon: <Tag className="h-4 w-4" /> },
                    { to: "/collections", label: "Gestión de Cobranzas", icon: <CreditCard className="h-4 w-4" /> },
                    { to: "/returns", label: "Gestión de Devoluciones", icon: <RefreshCw className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>

            {/* 4. LOGÍSTICA (Logistics-Service) */}
            <SubMenu label="Logística & Envíos" icon={<Truck className="h-5 w-5" />}>
                {[
                    { to: "/shipping-guides", label: "Guías de Remisión", icon: <Map className="h-4 w-4" /> },
                    { to: "/deliveries", label: "Asignación de Delivery", icon: <PackageOpen className="h-4 w-4" /> },
                    { to: "/realtime-location", label: "Ubicación en Tiempo Real", icon: <Map className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>
            
            {/* 5. CONFIGURACIÓN MAESTRA (Auth/Inventory/Store - Tablas de Apoyo) */}
            <SubMenu label="Maestros & Config" icon={<Settings className="h-5 w-5" />}>
                {[
                    { to: "/users", label: "Usuarios y Roles", icon: <Users className="h-4 w-4" /> },
                    { to: "/clients", label: "Clientes", icon: <Users className="h-4 w-4" /> },
                    // 🎯 NUEVO: Marcas (Brand)
                    { to: "/brands", label: "Marcas (Fabricantes)", icon: <Briefcase className="h-4 w-4" /> },
                    { to: "/categories", label: "Clasificación (Categorías)", icon: <Tag className="h-4 w-4" /> },
                    { to: "/uom", label: "Unidades de Medida", icon: <Scale className="h-4 w-4" /> },
                    { to: "/attributes", label: "Atributos de Producto", icon: <Ruler className="h-4 w-4" /> },
                    { to: "/taxes", label: "Tasas de Impuesto", icon: <Percent className="h-4 w-4" /> },
                    { to: "/payment-methods", label: "Métodos de Pago", icon: <Wallet className="h-4 w-4" /> },
                    { to: "/announcements", label: "Anuncios y Comunicados", icon: <Megaphone className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>
            
            {/* 6. REPORTES Y SISTEMA (General) */}
            <SubMenu label="Reportes & Sistema" icon={<BarChart3 className="h-5 w-5" />}>
                {[
                    { to: "/reports", label: "Generador de Reportes", icon: <BarChart3 className="h-4 w-4" /> },
                    { to: "/alerts", label: "Alertas de Stock", icon: <AlertTriangle className="h-4 w-4" /> },
                    { to: "/movements", label: "Historial de Movimientos", icon: <ClipboardList className="h-4 w-4" /> },
                    { to: "/audit", label: "Registro de Auditoría", icon: <ClipboardCheck className="h-4 w-4" /> },
                    { to: "/store-schedule", label: "Horarios de Atención", icon: <Clock className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>
        </nav>
    );
};