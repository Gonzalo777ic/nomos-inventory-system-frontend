import React from 'react';
import { NavLink } from "react-router-dom";
import { SubMenu } from './SubMenu';
import { 
    Home, 
    Package, 
    DollarSign, 
    Truck, 
    Settings, 
    BarChart3,

    ShoppingCart,
    Archive,
    Users,
    ClipboardList,
    Tag,
    CreditCard,
    RefreshCw,
    Map,
    PackageOpen,
    ClipboardCheck,
    Scale,
    Ruler,
    Percent,
    Megaphone,
    Clock,
    AlertTriangle,
    Briefcase,
    Warehouse,
    Wallet,
} from 'lucide-react'; 


interface NavItemProps {
    to: string;
    label: string;
    icon: React.ElementType<any>; 
}


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
            {}
            <IconComponent className="h-5 w-5" /> 
            <span>{label}</span>
        </NavLink>
    );
}


interface SubMenuItem {
    to: string; 
    label: string; 
    icon: React.ReactNode;
}


export const SidebarNavigation: React.FC = () => {

    return (
        <nav className="mt-6 space-y-2 text-sm">
            
            {}
            <NavItem to="/dashboard" label="Dashboard" icon={Home} />
            
            {}
            <SubMenu label="Inventario" icon={<Package className="h-5 w-5" />}>
                {[
                    { to: "/products", label: "Catálogo de Productos", icon: <ShoppingCart className="h-4 w-4" /> },
                    { to: "/inventory", label: "Inventario Físico (Lotes)", icon: <Archive className="h-4 w-4" /> },

                    { to: "/warehouses", label: "Almacenes y Ubicaciones", icon: <Warehouse className="h-4 w-4" /> }, 
                    { to: "/suppliers", label: "Proveedores", icon: <Users className="h-4 w-4" /> },
                    { to: "/purchases", label: "Órdenes de Abastecimiento", icon: <ClipboardList className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>

            {}
            <SubMenu label="Ventas & Caja" icon={<DollarSign className="h-5 w-5" />}>
                {[
                    { to: "/sales", label: "Registro de Ventas", icon: <ClipboardList className="h-4 w-4" /> },
                    { to: "/quotations", label: "Cotizaciones", icon: <Tag className="h-4 w-4" /> },
                    { to: "/promotions", label: "Promociones y Ofertas", icon: <Tag className="h-4 w-4" /> },
                    { to: "/collections", label: "Gestión de Cobranzas", icon: <CreditCard className="h-4 w-4" /> },
                    { to: "/returns", label: "Gestión de Devoluciones", icon: <RefreshCw className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>

            {}
            <SubMenu label="Logística & Envíos" icon={<Truck className="h-5 w-5" />}>
                {[
                    { to: "/shipping-guides", label: "Guías de Remisión", icon: <Map className="h-4 w-4" /> },
                    { to: "/deliveries", label: "Asignación de Delivery", icon: <PackageOpen className="h-4 w-4" /> },
                    { to: "/realtime-location", label: "Ubicación en Tiempo Real", icon: <Map className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>
            
            {}
            <SubMenu label="Maestros & Config" icon={<Settings className="h-5 w-5" />}>
                {[
                    { to: "/users", label: "Usuarios y Roles", icon: <Users className="h-4 w-4" /> },
                    { to: "/clients", label: "Clientes", icon: <Users className="h-4 w-4" /> },

                    { to: "/brands", label: "Marcas (Fabricantes)", icon: <Briefcase className="h-4 w-4" /> },
                    { to: "/categories", label: "Clasificación (Categorías)", icon: <Tag className="h-4 w-4" /> },
                    { to: "/uom", label: "Unidades de Medida", icon: <Scale className="h-4 w-4" /> },
                    { to: "/attributes", label: "Atributos de Producto", icon: <Ruler className="h-4 w-4" /> },
                    { to: "/taxes", label: "Tasas de Impuesto", icon: <Percent className="h-4 w-4" /> },
                    { to: "/payment-methods", label: "Métodos de Pago", icon: <Wallet className="h-4 w-4" /> },
                    { to: "/announcements", label: "Anuncios y Comunicados", icon: <Megaphone className="h-4 w-4" /> },
                ] as SubMenuItem[]}
            </SubMenu>
            
            {}
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