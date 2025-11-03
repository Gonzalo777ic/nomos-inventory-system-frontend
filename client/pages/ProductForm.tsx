import React, { useState, useEffect } from 'react';
import { Product, Brand, Category, Supplier, UnitOfMeasure } from '../types'; // 🎯 Importamos los tipos completos
import { createProduct, updateProduct } from '../api/services/products'; // 🎯 El archivo product.ts ya fue corregido
import { getBrands } from '../api/services/brand'; // 🎯 Importamos el servicio Brand
// NOTA: Asumimos que los servicios para Category, Supplier y UnitOfMeasure existen y funcionan
// import { getCategories } from '../api/services/category'; 
// import { getSuppliers } from '../api/services/supplier';
// import { getUnitsOfMeasure } from '../api/services/unitOfMeasure';

import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

// Definición de las propiedades que espera el formulario
interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData: Product | null;
}

// 🎯 Interfaz para el estado local del formulario (usamos IDs y string para price)
interface FormData {
    sku: string;
    name: string;
    // Usamos IDs numéricas para las FKs
    brandId: number | ''; 
    categoryId: number | '';
    defaultSupplierId: number | '';
    unitOfMeasureId: number | '';
    
    price: string; 
    minStockThreshold: string; // Para el input de texto
}

// 🎯 Tipos de estado para almacenar las listas de datos maestros
interface MasterData {
    brands: Brand[];
    categories: Category[];
    suppliers: Supplier[];
    unitsOfMeasure: UnitOfMeasure[];
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = initialData !== null && initialData.id !== undefined;
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true); // Nuevo estado para cargar maestros

    const [masterData, setMasterData] = useState<MasterData>({
        brands: [],
        categories: [],
        suppliers: [],
        unitsOfMeasure: [],
    });

    // Estado inicial del formulario usando las IDs
    const [formData, setFormData] = useState<FormData>({
        sku: initialData?.sku || '',
        name: initialData?.name || '',
        brandId: initialData?.brandId || '',
        categoryId: initialData?.categoryId || '',
        defaultSupplierId: initialData?.defaultSupplierId || '',
        unitOfMeasureId: initialData?.unitOfMeasureId || '',
        price: initialData?.price ? initialData.price.toString() : '',
        minStockThreshold: initialData?.minStockThreshold ? initialData.minStockThreshold.toString() : '0',
    });
    
    // 1. Efecto para cargar datos maestros (Brands, Categories, Suppliers, UoM)
    useEffect(() => {
        const loadMasterData = async () => {
            setIsDataLoading(true);
            try {
                // 🎯 Implementación de carga de Brands (ya tenemos el servicio)
                const loadedBrands = await getBrands();
                
                // 🛑 Simulación de carga para las otras entidades
                const loadedCategories: Category[] = [{ id: 1, name: "Electrónica" }, { id: 2, name: "Alimentos" }];
                const loadedSuppliers: Supplier[] = [{ id: 101, name: "TechGlobal", email: 'a', phone: 'a', taxId: 'a', address: 'a', contactName: 'a' }];
                const loadedUnits: UnitOfMeasure[] = [{ id: 1, name: "Unidad", abbreviation: "UND" }, { id: 2, name: "Kilogramo", abbreviation: "KG" }];
                
                setMasterData({
                    brands: loadedBrands,
                    categories: loadedCategories,
                    suppliers: loadedSuppliers,
                    unitsOfMeasure: loadedUnits,
                });
                
            } catch (error) {
                console.error("Error al cargar datos maestros:", error);
                toast.error("Error al cargar datos maestros para el formulario.");
            } finally {
                setIsDataLoading(false);
            }
        };

        if (isOpen) {
             // Sincroniza el estado del formulario con initialData
             setFormData({
                sku: initialData?.sku || '',
                name: initialData?.name || '',
                brandId: initialData?.brandId || '',
                categoryId: initialData?.categoryId || '',
                defaultSupplierId: initialData?.defaultSupplierId || '',
                unitOfMeasureId: initialData?.unitOfMeasureId || '',
                price: initialData?.price ? initialData.price.toString() : '',
                minStockThreshold: initialData?.minStockThreshold ? initialData.minStockThreshold.toString() : '0',
            });
            loadMasterData();
        }
    }, [isOpen, initialData]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Convertimos a número si el campo es una ID numérica, si no, guardamos el valor (incluyendo '')
        const parsedValue = ['brandId', 'categoryId', 'defaultSupplierId', 'unitOfMeasureId', 'minStockThreshold'].includes(name)
            ? (value === '' ? '' : parseInt(value, 10))
            : value;
            
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Validar y Parsear datos
        const priceValue = parseFloat(formData.price);
        const minStockThresholdValue = parseInt(formData.minStockThreshold.toString(), 10);
        
        // Validaciones clave (ahora incluimos las IDs)
        if (
            isNaN(priceValue) || priceValue <= 0 || 
            !formData.sku || !formData.name || 
            formData.brandId === '' || formData.categoryId === '' || 
            formData.defaultSupplierId === '' || formData.unitOfMeasureId === ''
        ) {
            toast.error('Por favor, completa todos los campos requeridos y asegúrate de que el precio sea válido.');
            setIsLoading(false);
            return;
        }

        try {
            // 2. Crear el objeto Product para la API (Omite 'id')
            const productData: Omit<Product, 'id'> = {
                sku: formData.sku,
                name: formData.name,
                brandId: formData.brandId as number,
                categoryId: formData.categoryId as number,
                defaultSupplierId: formData.defaultSupplierId as number,
                unitOfMeasureId: formData.unitOfMeasureId as number,
                price: priceValue,
                minStockThreshold: minStockThresholdValue,
            };

            let resultProduct: Product;

            if (isEditMode) {
                // Modo Edición (PUT)
                if (!initialData?.id) throw new Error("ID de producto no definido para edición.");
                resultProduct = await updateProduct(initialData.id, productData);
                toast.success(`Producto "${resultProduct.name}" actualizado con éxito.`);
            } else {
                // Modo Creación (POST)
                resultProduct = await createProduct(productData);
                toast.success(`Producto "${resultProduct.name}" creado con éxito.`);
            }

            onSubmit(resultProduct);

        } catch (error) {
            console.error('Error al guardar el producto:', error);
            // Manejo de errores específicos del backend (ej: SKU duplicado)
            toast.error('Error al guardar el producto. Revisa los datos y la conexión.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        // Modal Overlay y Contenido (Simplificado para el código React)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {isDataLoading ? (
                        <div className="flex justify-center items-center h-40">
                             <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                             <span className="ml-3 text-gray-500">Cargando datos maestros...</span>
                        </div>
                    ) : (
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
                            
                            {/* Fila 2: Brand y Category (Dropdowns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Brand/Marca (FK) */}
                                <div>
                                    <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                                    <select
                                        name="brandId"
                                        id="brandId"
                                        value={formData.brandId}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    >
                                        <option value="">Selecciona una Marca</option>
                                        {masterData.brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Category/Categoría (FK) */}
                                <div>
                                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                                    <select
                                        name="categoryId"
                                        id="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    >
                                        <option value="">Selecciona una Categoría</option>
                                        {masterData.categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fila 3: Supplier y UnitOfMeasure (Dropdowns) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Supplier/Proveedor (FK) */}
                                <div>
                                    <label htmlFor="defaultSupplierId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor por Defecto</label>
                                    <select
                                        name="defaultSupplierId"
                                        id="defaultSupplierId"
                                        value={formData.defaultSupplierId}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    >
                                        <option value="">Selecciona un Proveedor</option>
                                        {masterData.suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* UnitOfMeasure/Unidad de Medida (FK) */}
                                <div>
                                    <label htmlFor="unitOfMeasureId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad de Medida</label>
                                    <select
                                        name="unitOfMeasureId"
                                        id="unitOfMeasureId"
                                        value={formData.unitOfMeasureId}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    >
                                        <option value="">Selecciona U.M.</option>
                                        {masterData.unitsOfMeasure.map((unit) => (
                                            <option key={unit.id} value={unit.id}>{unit.abbreviation} - {unit.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Fila 4: Precio y Stock Mínimo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio Base ($)</label>
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
                                
                                <div>
                                    <label htmlFor="minStockThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Mínimo (Alerta)</label>
                                    <input
                                        type="number"
                                        name="minStockThreshold"
                                        id="minStockThreshold"
                                        value={formData.minStockThreshold}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                                    />
                                </div>
                            </div>

                            {/* Botón de Submit */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || isDataLoading}
                                    className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>{isEditMode ? 'Guardar Cambios' : 'Crear Producto'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductForm;
