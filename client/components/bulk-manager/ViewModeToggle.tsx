import React from 'react';
import { List, FolderTree, Layers, LayoutList } from 'lucide-react';

interface ViewModeToggleProps {
    currentMode: 'flat' | 'categorized';
    onModeChange: (mode: 'flat' | 'categorized') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ currentMode, onModeChange }) => {
    
    const baseClass = "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20";
    
    const activeClass = "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200 dark:border-gray-600";
    
    const inactiveClass = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50";

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">
                Vista:
            </span>
            
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onModeChange('flat')}
                    className={`${baseClass} ${currentMode === 'flat' ? activeClass : inactiveClass}`}
                    title="Ver todos los productos en una lista simple"
                    aria-label="Cambiar a vista de lista"
                >
                    <List className="w-4 h-4" />
                    <span>Lista</span>
                </button>

                <button
                    onClick={() => onModeChange('categorized')}
                    className={`${baseClass} ${currentMode === 'categorized' ? activeClass : inactiveClass}`}
                    title="Ver productos agrupados por categorías y subcategorías"
                    aria-label="Cambiar a vista por categorías"
                >
                    <FolderTree className="w-4 h-4" />
                    <span>Por Categoría</span>
                </button>
            </div>
        </div>
    );
};