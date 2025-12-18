import React, { useState } from 'react';
import { NavLink, useLocation } from "react-router-dom";


interface SubMenuProps {
    label: string;
    icon: React.ReactNode;
    children: { to: string; label: string; icon: React.ReactNode }[];
}


const useIsAnyChildActive = (children: { to: string; label: string }[]) => {
    const location = useLocation();

    return children.some(child => 
        location.pathname === child.to || 
        (location.pathname.startsWith(child.to) && child.to !== '/' && location.pathname !== child.to)
    );
}

export const SubMenu: React.FC<SubMenuProps> = ({ label, icon, children }) => {

    const initiallyOpen = useIsAnyChildActive(children);
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    

    React.useEffect(() => {
        if (initiallyOpen) {
            setIsOpen(true);
        }
    }, [initiallyOpen]);

    const activeStyle = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    const baseStyle = "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";

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
                {}
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
            {}
            <div 
                className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ transitionProperty: 'max-height, opacity' }}
            >
                <div className="pl-6 border-l border-gray-300 dark:border-gray-700 ml-3 space-y-1 py-1">
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
                            {}
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};
