import React, { useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";

interface SubMenuProps {
    label: string;
    icon: React.ReactNode;
    children: { to: string; label: string }[];
}

// Determina si alguna ruta hija está activa para mantener el menú padre abierto
const useIsAnyChildActive = (children: { to: string; label: string }[]) => {
    const location = useLocation();
    return children.some(child => location.pathname.startsWith(child.to) && child.to !== '/');
}

export const SubMenu: React.FC<SubMenuProps> = ({ label, icon, children }) => {
    // Usamos el estado activo de una ruta hija para inicializar el menú como abierto.
    const initiallyOpen = useIsAnyChildActive(children);
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    
    // Si una ruta hija está activa, forzamos el menú a estar abierto.
    React.useEffect(() => {
        if (initiallyOpen) {
            setIsOpen(true);
        }
    }, [initiallyOpen]);

    const activeStyle = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    const baseStyle = "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";

    // El NavLink del padre no tiene una 'to' para que no sea clickable en sí mismo, solo el toggle.
    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 transition-colors font-medium justify-between ${
                    initiallyOpen ? activeStyle : baseStyle
                }`}
            >
                <span className="flex items-center gap-2">
                    {icon}
                    {label}
                </span>
                <svg
                    className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            {isOpen && (
                <div className="pl-6 border-l border-gray-300 dark:border-gray-700 ml-3 space-y-1">
                    {children.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded-md px-3 py-2 transition-colors text-sm ${
                                    isActive 
                                        ? "text-emerald-600 dark:text-emerald-400 font-semibold" 
                                        : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                }`
                            }
                            end
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};