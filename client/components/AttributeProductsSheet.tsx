import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Tag, AlertCircle } from 'lucide-react';

import { getProductsByAttribute } from '@/api/services/productAttributeValue'; 

interface Props {
    attributeId: number | null;
    attributeName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const AttributeProductsSheet: React.FC<Props> = ({ attributeId, attributeName, isOpen, onClose }) => {
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ['products-by-attribute', attributeId],
        queryFn: () => getProductsByAttribute(attributeId!),
        enabled: !!attributeId && isOpen, 
        staleTime: 1000 * 60 * 5, 
    });
    

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:w-[540px] flex flex-col h-full bg-white dark:bg-gray-900 border-l dark:border-gray-800">
                <SheetHeader className="pb-4 border-b dark:border-gray-800">
                    <SheetTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                        <Tag className="w-5 h-5 text-emerald-600" />
                        Uso de: "{attributeName}"
                    </SheetTitle>
                    <SheetDescription className="dark:text-gray-400">
                        Listado de productos que tienen configurado este atributo actualmente.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 py-4 overflow-hidden relative">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-500 gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                            <span className="text-sm">Buscando productos...</span>
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col justify-center items-center h-full text-red-500 gap-2">
                            <AlertCircle className="w-8 h-8" />
                            <span className="text-sm">Error al cargar datos</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-400 gap-2 text-center p-8">
                            <Package className="w-12 h-12 opacity-20" />
                            <p>Ningún producto utiliza el atributo <strong>{attributeName}</strong> todavía.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-3">
                                {products.map((item) => (
                                    <div 
                                        key={item.productId} 
                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white dark:bg-gray-700 p-2 rounded-md border border-gray-200 dark:border-gray-600 group-hover:border-emerald-200 transition-colors">
                                                <Package className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                                                    {item.productName}
                                                </h4>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    SKU: {item.productSku}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">Valor</span>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-mono">
                                                {item.attributeValue}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
                
                
            </SheetContent>
        </Sheet>
    );
1|1};