import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import ProductForm from './ProductForm'; // Importar el formulario
import { Product, getProducts } from '../api/services/products'; // Importar la función de obtener productos
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Usaremos React Query para manejo de datos

// 🎯 Definición de la Interfaz del Producto (copiada del servicio)
// Asumo que tienes una definición global en client/types/index.ts, pero la mantenemos aquí por ahora
// Deberías mover esta interfaz a client/types/index.ts
// interface Product { ... } // Reutilizar la interfaz del ProductForm

const ProductList: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false); // Controlar visibilidad del formulario/modal

    // Obtener productos usando React Query
    const { data: products, isLoading, isError, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    
    // Función de callback para cuando un producto es creado exitosamente
    const handleProductCreated = (newProduct: Product) => {
        // Invalida la caché de 'products' para que React Query recargue la lista
        queryClient.invalidateQueries({ queryKey: ['products'] });
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> <span className="ml-3 text-lg">Cargando productos...</span></div>;
    }

    if (isError) {
        // Muestra un error si la llamada al backend falla
        return <div className="p-6 bg-red-100 text-red-800 rounded-lg border border-red-400">Error al cargar productos: {error.message}</div>;
    }


    return (
        <div className="space-y-6">
            {/* Modal/Sheet de Creación de Producto (Simulación) */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full">
                        <ProductForm 
                            onProductCreated={handleProductCreated}
                            onClose={() => setIsFormOpen(false)}
                        />
                    </div>
                </div>
            )}
            
            {/* Encabezado y Acciones */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventario de Productos</h1>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    <span>Añadir Producto</span>
                </button>
            </div>

            {/* ... (Resto de la UI de búsqueda y tabla) ... */}
            
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imagen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre / Autor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    {/* Reemplazamos dummyProducts con la data real de React Query */}
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
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Por: {product.author}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.stock < 10 
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        }`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => console.log('Editar producto:', product.id)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => console.log('Eliminar producto:', product.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                                    No hay productos en el inventario. ¡Crea uno para empezar!
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