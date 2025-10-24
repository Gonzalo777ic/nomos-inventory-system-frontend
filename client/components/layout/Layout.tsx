// client/components/layout/Layout.tsx

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { ThemeToggle } from "./ThemeToggle";
import React from "react"; 

// 🎯 CORRECCIÓN: Layout NO recibe props, usa <Outlet /> para renderizar rutas hijas.
// Eliminamos la interfaz LayoutProps y la desestructuración de children
export default function Layout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block border-r bg-gray-100 p-4 dark:bg-gray-900">
        <Brand />
        <nav className="mt-6 space-y-1 text-sm">
          <NavItem to="/dashboard" label="Dashboard" /> 
          <NavItem to="/products" label="Productos" />  
          <NavItem to="/inventory" label="Inventario" />
          <NavItem to="/sales" label="Ventas" />
          <NavItem to="/reports" label="Reportes" />
          <NavItem to="/alerts" label="Alertas" />
          <NavItem to="/suppliers" label="Proveedores" />

        </nav>
      </aside>
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-800">
          {/* 🎯 Usamos <Outlet /> para renderizar la ruta hija (Dashboard, Inventory, etc.) */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
        N
      </span>
      Nomos
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
            isActive 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" 
                : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        }`
      }
      end
    >
      <span>{label}</span>
    </NavLink>
  );
}

function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user); 
  const logout = useAuthStore((s) => s.logout);
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/80 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">{user?.email || "Usuario Desconocido"}</span>
            <button
              onClick={() => {
                logout(); 
                navigate("/login", { replace: true });
              }}
              className="rounded-md border border-gray-300 px-3 py-1 bg-white text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
