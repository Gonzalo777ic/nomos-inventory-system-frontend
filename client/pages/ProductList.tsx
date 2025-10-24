import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, X } from 'lucide-react'; 
import ProductForm from './ProductForm';
import { Product, getProducts, deleteProduct } from '../api/services/products'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


const ProductList: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);
    const [productToDeleteName, setProductToDeleteName] = useState<string>(''); 

    // Obtener productos usando React Query
    // Nota: Aunque el producto ya no tiene 'stock' directo, la lista lo asume.
    // En un sistema real, aquí necesitarías obtener el stock actual del StockEntryController.
    const { data: products, isLoading, isError, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    
    // Función de mutación para eliminación
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Producto eliminado con éxito.');
            setIsDeleteConfirmOpen(false);
            setProductToDeleteId(null);
            setProductToDeleteName('');
        },
        onError: () => {
            // Nota: Aquí el error 404 (Not Found) se capturaría si el backend falla.
            toast.error('Error al eliminar el producto. Verifica la consola.');
        }
    });

    const handleFormSubmit = async () => {
        setIsFormOpen(false);
        setSelectedProduct(null);
        await queryClient.invalidateQueries({ queryKey: ['products'] });
    };

    const handleOpenForm = (product: Product | null = null) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleConfirmDelete = (product: Product) => {
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

    if (isLoading) {
        return <div className="p-6 flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> <span className="ml-3 text-lg">Cargando productos...</span></div>;
    }

    if (isError) {
        return <div className="p-6 bg-red-100 text-red-800 rounded-lg border border-red-400">Error al cargar productos: {error instanceof Error ? error.message : 'Error desconocido'}</div>;
    }

    // 🎯 Función para redirigir/mostrar mensaje para el stock
    const handleAddInitialStock = (product: Product) => {
        // Aquí iría la lógica para abrir el modal o redirigir al formulario de StockEntry.
        // Por ahora, solo mostramos un mensaje para fines de desarrollo.
        toast.info(`¡Producto creado! Ahora debes ir al módulo de Inventario para asignar stock inicial a: ${product.name}`);
        // En un caso real: router.push('/inventory/add-stock/' + product.id);
    };

    return (
        <div className="p-6 space-y-6"> 
            {/* Modal/Sheet de Creación/Edición de Producto */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full">
                        <ProductForm 
                            isOpen={isFormOpen}
                            onClose={() => setIsFormOpen(false)}
                            onSubmit={handleFormSubmit}
                            initialData={selectedProduct} 
                        />
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
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
                            <button 
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                disabled={deleteMutation.isPending}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteExecute}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                <span>{deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Encabezado y Acciones */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo de Productos</h1>
                <button 
                    onClick={() => handleOpenForm(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    <span>Añadir Producto</span>
                </button>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imagen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre / Marca</th> 
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock (Ver Inventario)</th> {/* 🎯 ETIQUETA ACTUALIZADA */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
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
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{product.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Marca: {product.brand}</div> 
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>
                                            N/A
                                        </span>
                                    </td> {/* 🎯 VALOR HARDCODEADO TEMPORAL */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenForm(product)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => product.id && handleConfirmDelete(product)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    No hay productos en el catálogo. ¡Crea uno para empezar!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
