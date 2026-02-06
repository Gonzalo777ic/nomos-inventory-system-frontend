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
    
    

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:w-[540px] flex flex-col h-full bg-white dark:bg-gray-900 border-l dark:border-gray-800">
                

                
                
                
            </SheetContent>
        </Sheet>
    );
1|1};