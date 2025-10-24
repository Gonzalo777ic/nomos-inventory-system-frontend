import React, { useState, useEffect } from 'react';
import { Product, createProduct, updateProduct } from '../api/services/products';
import { Loader2, X } from 'lucide-react'; 
import { toast } from 'sonner';

// Define las propiedades que espera el formulario
interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData: Product | null;
}

// Interfaz para el estado local del formulario
interface FormData {
    sku: string;
    name: string;
    brand: string; // Corregido: usa 'brand'
    price: string; // Usamos string para manejar la entrada de usuario (decimales)
    // 🛑 ELIMINADO: Ya no se captura el stock aquí.
    imageUrl: string;
    supplier: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = initialData !== null && initialData.id !== undefined;
    const [isLoading, setIsLoading] = useState(false);

    // Estado inicial del formulario
    const [formData, setFormData] = useState<FormData>({
        sku: initialData?.sku || '',
        name: initialData?.name || '',
        brand: initialData?.brand || '', // Usa 'brand'
        price: initialData?.price ? initialData.price.toString() : '',
        // 🛑 ELIMINADO: Stock inicializado.
        imageUrl: initialData?.imageUrl || '',
        supplier: initialData?.supplier || '',
    });

    // Sincroniza el estado del formulario si cambian los datos iniciales (ej. para edición)
    useEffect(() => {
        if (initialData) {
            setFormData({
                sku: initialData.sku || '',
                name: initialData.name || '',
                brand: initialData.brand || '',
                price: initialData.price ? initialData.price.toString() : '',
                // stock: initialData.stock ? initialData.stock.toString() : '', // ELIMINADO
                imageUrl: initialData.imageUrl || '',
                supplier: initialData.supplier || '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Validar y Parsear datos
        const priceValue = parseFloat(formData.price);
        // const stockValue = parseInt(formData.stock, 10); // ELIMINADO

        if (isNaN(priceValue) || priceValue <= 0 || !formData.sku || !formData.name || !formData.supplier) {
            toast.error('Por favor, completa los campos requeridos (SKU, Nombre, Marca, Precio > 0).');
            setIsLoading(false);
            return;
        }

        try {
            // 2. Crear el objeto Product para la API
            const productData: Omit<Product, 'id'> = {
                sku: formData.sku,
                name: formData.name,
                brand: formData.brand,
                price: priceValue,
                // 🛑 ELIMINADO: Ya no enviamos el stock
                // stock: isEditMode ? (initialData.stock || 0) : 0, 
                imageUrl: formData.imageUrl || "https://placehold.co/40x60/ccc/333?text=N/A",
                supplier: formData.supplier,
            };

            let resultProduct: Product;

            if (isEditMode) {
                // Modo Edición (PUT)
                if (!initialData.id) throw new Error("ID de producto no definido para edición.");
                resultProduct = await updateProduct(initialData.id, productData);
                toast.success(`Producto "${resultProduct.name}" actualizado con éxito.`);
            } else {
                // Modo Creación (POST)
                resultProduct = await createProduct(productData);
                toast.success(`Producto "${resultProduct.name}" creado con éxito.`);
                // 🎯 Aquí se podría disparar la acción para ir al formulario de Stock
                // Pero por ahora, solo llamamos a onSubmit para cerrar y refrescar la lista.
            }

            onSubmit(resultProduct);

        } catch (error) {
            console.error('Error al guardar el producto:', error);
            toast.error('Error al guardar el producto. Revisa la conexión con el backend y las rutas.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fila 1: SKU y Nombre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU (Código)</label>
                        <input
                            type="text"
                            name="sku"
                            id="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Producto</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        />
                    </div>
                </div>

                {/* Fila 2: Marca y Precio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                        <input
                            type="text"
                            name="brand"
                            id="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio ($)</label>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            step="0.01"
                            min="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                        />
                    </div>
                </div>

                {/* Fila 3: Proveedor */}
                <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
                    <input
                        type="text"
                        name="supplier"
                        id="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    />
                </div>

                {/* Fila 4: URL de Imagen */}
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL de Imagen (Opcional)</label>
                    <input
                        type="url"
                        name="imageUrl"
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                    />
                </div>

                {/* Botón de Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isEditMode ? 'Guardar Cambios' : 'Crear Producto'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
