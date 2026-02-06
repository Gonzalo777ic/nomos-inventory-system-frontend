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

                
                
                
            </SheetContent>
        </Sheet>
    );
1|1};