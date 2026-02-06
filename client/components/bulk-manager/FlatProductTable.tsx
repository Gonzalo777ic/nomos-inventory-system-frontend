import React from 'react';
import { ProductListItem } from '../../types';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { Package, Image as ImageIcon } from 'lucide-react';

interface FlatProductTableProps {
    products: ProductListItem[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    onRangeSelect: (id: number) => void;
    onSelectAll: () => void;
}

export const FlatProductTable: React.FC<FlatProductTableProps> = ({
    products,
    selectedIds,
    onToggle,
    onRangeSelect,
    onSelectAll
}) => {
    

    const isAllSelected = products.length > 0 && selectedIds.length >= products.length && products.every(p => selectedIds.includes(p.id));
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;


    const handleRowClick = (id: number, event: React.MouseEvent) => {

        if (event.shiftKey) {

            window.getSelection()?.removeAllRanges();
            onRangeSelect(id);
        } else {
            onToggle(id);
        }
    };

    const handleCheckboxClick = (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        handleRowClick(id, event);
    };

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <Package className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron productos</p>
                <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto"> {}
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                <Checkbox 
                                    checked={isAllSelected}
                                    onCheckedChange={onSelectAll}
                                    aria-label="Seleccionar todos"
                                />
                            </TableHead>
                            <TableHead className="w-[80px]">Imagen</TableHead>
                            <TableHead className="w-[120px]">SKU</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => {
                            const isSelected = selectedIds.includes(product.id);
                            
                            return (
                                <TableRow 
                                    key={product.id}
                                    onClick={(e) => handleRowClick(product.id, e)}
                                    className={`
                                        cursor-pointer select-none transition-colors border-b dark:border-gray-800
                                        ${isSelected 
                                            ? "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                                            : "hover:bg-gray-50 dark:hover:bg-gray-800"}
                                    `}
                                >
                                    {}
                                    <TableCell className="text-center">
                                        <Checkbox 
                                            checked={isSelected}
                                            onClick={(e) => handleCheckboxClick(product.id, e)}
                                        />
                                    </TableCell>

                                    {}
                                    <TableCell>
                                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {product.imageUrl ? (
                                                <img 
                                                    src={product.imageUrl} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = ""; 
                                                        (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>

                                    {}
                                    <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                        {product.sku}
                                    </TableCell>

                                    {}
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </TableCell>

                                    {}
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.categoryName || "-"}
                                    </TableCell>

                                    {}
                                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.brandName || "-"}
                                    </TableCell>

                                    {}
                                    <TableCell className="text-right font-mono text-sm">
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${(product.currentStock || 0) > 0 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                                        `}>
                                            {product.currentStock || 0}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};