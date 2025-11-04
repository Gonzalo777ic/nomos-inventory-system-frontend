import React, { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react'; 
import ProductForm from './ProductForm'; 
import { Product, ProductListItem } from '../types/index'; 
import { getProducts, deleteProduct } from '../api/services/products'; 
// Importamos la función para obtener el stock total
import { getProductTotalStock } from '../api/services/inventory-items'; 
// Usaremos useQueries para cargar el stock de manera eficiente
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { toast } from 'sonner';

// Importamos los componentes de UI (asumiendo Shadcn/UI o similar)
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Tipo extendido para la lista con el stock agregado
type ProductListWithStock = ProductListItem & { currentStock: number; };


const ProductList: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); 
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);
    const [productToDeleteName, setProductToDeleteName] = useState<string>(''); 
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Obtener la lista base de productos (sin stock agregado)
    const { 
        data: products = [], 
        isLoading: isLoadingProducts, 
        isError, 
        error 
    } = useQuery<ProductListItem[]>({
        queryKey: ['products'],
        queryFn: getProducts as () => Promise<ProductListItem[]>,
    });
    
    // 2. Obtener el stock total por producto usando useQueries (como en Inventory.tsx)
    const stockQueries = useQueries({
        queries: products.map(product => ({
            queryKey: ['productStock', product.id],
            queryFn: () => getProductTotalStock(Number(product.id)),
            // Aseguramos que solo se ejecute si hay un ID válido
            enabled: product.id !== undefined, 
            staleTime: 1000 * 60 * 5, 
        })),
    });

    // 3. Combinar los datos de productos y stock en una sola lista (Memoizada)
    const productListWithStock: ProductListWithStock[] = useMemo(() => {
        return products.map((product, index) => {
            const stockQueryResult = stockQueries[index];
            // Usamos 0 si la query está pendiente o no tiene datos (mejor que 'N/A' si el backend no lo provee)
            const currentStock = stockQueryResult?.data !== undefined ? stockQueryResult.data : 0;
            
            return { 
                ...product, 
                currentStock: currentStock as number, 
            } as ProductListWithStock;
        });
    }, [products, stockQueries]);

    // Chequeamos si alguna de las queries de stock está aún en proceso
    const isStockLoading = stockQueries.some(query => query.isLoading);

    // Filtrado (adaptado del Inventory)
    const filteredProducts = productListWithStock.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función de mutación para eliminación
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Forzamos la actualización del stock después de una eliminación (si afecta)
            queryClient.invalidateQueries({ queryKey: ['productStock'] }); 
            toast.success('Producto eliminado con éxito.');
            setIsDeleteConfirmOpen(false);
            setProductToDeleteId(null);
            setProductToDeleteName('');
        },
        onError: () => {
            toast.error('Error al eliminar el producto. Verifica la consola.');
        }
    });

    const handleFormSubmit = async () => {
        setIsFormOpen(false);
        setSelectedProduct(null);
        // Al añadir/editar, actualizamos la lista base y el stock
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.invalidateQueries({ queryKey: ['productStock'] });
    };

    const handleOpenForm = (product: ProductListItem | null = null) => {
        // Asegúrate de que el producto seleccionado (con FKs) se pase al formulario
        setSelectedProduct(product as Product | null); 
        setIsFormOpen(true);
    };

    const handleConfirmDelete = (product: ProductListItem) => {
        if (product.id) {
            setProductToDeleteId(product.id);
            setProductToDeleteName(product.name);
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleDeleteExecute = () => {
        if (productToDeleteId) {
            deleteMutation.mutate(productToDeleteId);
        }
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
        setProductToDeleteId(null);
        setProductToDeleteName('');
    };

    if (isLoadingProducts) {
        return <div className="p-6 flex justify-center items-center h-64 dark:text-gray-300"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> <span className="ml-3 text-lg">Cargando catálogo...</span></div>;
    }

    if (isError) {
        return <div className="p-6 bg-red-100 text-red-800 rounded-lg border border-red-400">Error al cargar productos: {error instanceof Error ? error.message : 'Error desconocido'}</div>;
    }

    return (
        // APLICACIÓN DEL MODO OSCURO EN EL CONTENEDOR PRINCIPAL
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800 min-h-screen"> 
            
            {/* Modal/Sheet de Creación/Edición de Producto (RESTAURADO) */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* El formulario ya usa dark:bg-gray-900 en su interior */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full"> 
                        {/* El formulario recibe un 'Product' (entidad base con FKs) */}
                        <ProductForm 
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onSubmit={handleFormSubmit}
                            initialData={selectedProduct} 
                        />
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación (YA CORREGIDO) */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Confirmar Eliminación</h3>
                            <button onClick={handleDeleteCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            ¿Estás seguro de que deseas eliminar el producto **{productToDeleteName}** (ID: {productToDeleteId})? Esta acción es irreversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button 
                                variant="outline"
                                onClick={handleDeleteCancel}
                                disabled={deleteMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDeleteExecute}
                                variant="destructive" // Asumo que existe esta variante en tu librería de UI
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                <span>{deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Encabezado y Acciones */}
            <div className="flex justify-between items-center pb-4">
                {/* TEXTO CORREGIDO PARA MODO OSCURO */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Catálogo de Productos</h1>
                <div className="flex space-x-4">
                    {/* Barra de búsqueda adoptada del Inventory */}
                    <div className="relative flex items-center w-full max-w-xs">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                        {/* INPUT CORREGIDO PARA MODO OSCURO */}
                        <Input
                            placeholder="Buscar producto, SKU o marca..."
                            className="pl-9 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100 focus:border-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => handleOpenForm(null)}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Añadir Producto</span>
                    </Button>
                </div>
            </div>

            {/* Tabla de Productos (Estilo Unificado) */}
            {/* FONDO Y SOMBRA CORREGIDOS PARA MODO OSCURO */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        {/* CABECERA DE TABLA CORREGIDA PARA MODO OSCURO */}
                        <TableRow className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-100/80 dark:hover:bg-gray-700/80">
                            {/* TEXTO DE CABECERA CORREGIDO PARA MODO OSCURO */}
                            <TableHead className="w-10 text-gray-600 dark:text-gray-400">Imagen</TableHead>
                            <TableHead className="w-[100px] text-gray-600 dark:text-gray-400">SKU</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Nombre</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Marca</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Categoría</TableHead>
                            <TableHead className="w-[100px] text-gray-600 dark:text-gray-400">U. Medida</TableHead>
                            <TableHead className="text-right text-gray-600 dark:text-gray-400">Precio</TableHead>
                            <TableHead className="text-center w-[120px] text-gray-600 dark:text-gray-400">Stock</TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400">Proveedor</TableHead>
                            <TableHead className="text-center w-[100px] text-gray-600 dark:text-gray-400">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isStockLoading ? (
                            <TableRow>
                                {/* TEXTO DE CARGA CORREGIDO */}
                                <TableCell colSpan={10} className="text-center py-10 text-base text-indigo-500 dark:text-indigo-400">
                                    <Loader2 className="h-5 w-5 mr-3 inline-block animate-spin" /> Calculando existencias...
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                // FILA CORREGIDA PARA MODO OSCURO Y SINTAXIS
                                <TableRow key={product.id} className="border-gray-200 dark:border-gray-800 hover:bg-emerald-50/20 dark:hover:bg-gray-800 transition-colors duration-150">
                                    <TableCell>
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name} 
                                            className="h-10 w-auto rounded object-cover shadow"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; 
                                                target.src = "https://placehold.co/40x60/ccc/333?text=N/A";
                                            }}
                                        />
                                    </TableCell>
                                    {/* TEXTO DE CELDAS CORREGIDO PARA MODO OSCURO */}
                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">{product.sku}</TableCell>
                                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</TableCell>
                                    <TableCell className="text-gray-700 dark:text-gray-300">{product.brandName}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{product.categoryName}</TableCell>
                                    <TableCell className="text-gray-600 dark:text-gray-400">{product.unitOfMeasureName}</TableCell>
                                    <TableCell className="text-right font-mono text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                                            product.currentStock === 0 ? 'bg-red-400 text-white' : 
                                            product.currentStock <= 5 ? 'bg-yellow-400 text-gray-900' :
                                            'bg-green-500 text-white'
                                        }`}>
                                            {product.currentStock} 
                                        </span>
                                    </TableCell> 
                                    <TableCell className="text-gray-700 dark:text-gray-300">{product.supplierName}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center space-x-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => handleOpenForm(product)}
                                                className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => product.id && handleConfirmDelete(product)}
                                                className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {/* TEXTO DE NO ENCONTRADO CORREGIDO */}
                                <TableCell colSpan={10} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    No hay productos que coincidan con la búsqueda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ProductList;
