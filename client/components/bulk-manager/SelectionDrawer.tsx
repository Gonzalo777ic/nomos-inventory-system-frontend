import React, { useState } from 'react';
import { 
    ChevronUp, ChevronDown, X, Trash2, Tag, Check, Package, AlertCircle 
} from 'lucide-react';
import { ProductListItem } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';

interface SelectionDrawerProps {
    selectedProducts: ProductListItem[];
    onClear: () => void;
    onAssign: () => void;
    onRemoveItem: (id: number) => void;
}

export const SelectionDrawer: React.FC<SelectionDrawerProps> = ({
    selectedProducts,
    onClear,
    onAssign,
    onRemoveItem
}) => {
    const [isExpanded, setIsExpanded] = useState(false);


    if (selectedProducts.length === 0) return null;

    return (
        <div className={`
            fixed bottom-0 left-0 right-0 z-40 
            bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]
            transition-all duration-300 ease-in-out flex flex-col
            ${isExpanded ? 'h-[60vh]' : 'h-auto'}
        `}>
            
            {}
            <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {}
                <div className="flex items-center gap-4">
                    <div className={`
                        p-2 rounded-full bg-gray-100 dark:bg-gray-800 transition-transform duration-300
                        ${isExpanded ? 'rotate-180' : 'rotate-0'}
                    `}>
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                {selectedProducts.length}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Productos seleccionados
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 hidden sm:block">
                            {isExpanded ? "Clic para colapsar" : "Clic para ver detalles y revisar selección"}
                        </p>
                    </div>
                </div>

                {}
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <Button 
                        variant="ghost" 
                        onClick={onClear}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <span className="hidden sm:inline mr-2">Cancelar</span>
                        <X className="w-5 h-5" />
                    </Button>
                    
                    <Button 
                        onClick={onAssign}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                    >
                        <Tag className="w-4 h-4 mr-2" />
                        Asignar Atributo
                    </Button>
                </div>
            </div>

            {}
            {isExpanded && (
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50 dark:bg-black/20">
                    <div className="px-4 py-2 border-b dark:border-gray-800 flex justify-between items-center text-xs text-gray-500 uppercase tracking-wider">
                        <span>Detalle de la selección</span>
                        <span 
                            onClick={onClear} 
                            className="cursor-pointer hover:text-red-500 flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> Limpiar todo
                        </span>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {selectedProducts.map((product) => (
                                <div 
                                    key={product.id}
                                    className="group relative flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all animate-in zoom-in-95 duration-200"
                                >
                                    {}
                                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>

                                    {}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 rounded-sm text-gray-500 border-gray-200 dark:border-gray-700">
                                                {product.sku}
                                            </Badge>
                                            {product.categoryName && (
                                                <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                                                    {product.categoryName}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {}
                                    <button
                                        onClick={() => onRemoveItem(product.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Quitar de la selección"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};