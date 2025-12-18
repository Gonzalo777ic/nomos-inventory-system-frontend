import React, { useState, useEffect, useCallback } from 'react';
import { Product, Brand, Category, Supplier, UnitOfMeasure } from '../types'; 
import { createProduct, updateProduct } from '../api/services/products'; 
import { getBrands } from '../api/services/brand'; 
import { getCategories } from '../api/services/category'; 
import { getSuppliers } from '../api/services/supplier'; 
import { getUnitsOfMeasure } from '../api/services/unitOfMeasure'; 
import { createProductSupplierRelation } from '../api/services/productSupplier'; 
import ImageUploader from './ImageUploader'; 

import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';


interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    initialData: Product | null;
}

interface FormData {
    sku: string;
    name: string;
    brandId: number | ''; 
    categoryId: number | '';
    preferredSupplierId: number | ''; 
    unitOfMeasureId: number | '';
    price: string; 
    minStockThreshold: string; 
    imageUrl?: string; 
}


interface MasterData {
    brands: Brand[];
    categories: Category[];
    suppliers: Supplier[]; 
    unitsOfMeasure: UnitOfMeasure[];
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [currentProductId, setCurrentProductId] = useState<number | undefined>(initialData?.id);
    const isEditMode = initialData !== null && initialData.id !== undefined;
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    
    useEffect(() => {
        const loadMasterData = async () => {
            setIsDataLoading(true);
            console.log("[ProductForm] ⌛ Iniciando carga de datos maestros...");
            try {
                const [loadedBrands, loadedCategories, loadedSuppliers, loadedUnits] = await Promise.all([
                    getBrands(),
                    getCategories(),
                    getSuppliers(),
                    getUnitsOfMeasure(),
                ]);
                
                let initialPreferredSupplierId: number | '' = '';
                
                if (isEditMode && initialData) {
                    const initialSupplierName = (initialData as any)?.supplierName;
                    const preferredSupplier = loadedSuppliers.find(
                        (s) => s.name === initialSupplierName
                    );
                    
                    if (preferredSupplier) {
                        initialPreferredSupplierId = preferredSupplier.id;
                        console.log(`[ProductForm] 🟢 Proveedor Preferido encontrado por Nombre: ID ${preferredSupplier.id}`);
                    } else if (initialSupplierName) {
                        console.warn(`[ProductForm] 🟡 Advertencia: Proveedor '${initialSupplierName}' de initialData no encontrado en la lista maestra.`);
                    }
                }
                
                setMasterData({
                    brands: loadedBrands,
                    categories: loadedCategories,
                    suppliers: loadedSuppliers,
                    unitsOfMeasure: loadedUnits,
                });

                 setFormData({
                    sku: initialData?.sku || '',
                    name: initialData?.name || '',
                    brandId: initialData?.brandId || '',
                    categoryId: initialData?.categoryId || '',
                    preferredSupplierId: initialPreferredSupplierId || (initialData as any)?.defaultSupplierId || '', 
                    unitOfMeasureId: initialData?.unitOfMeasureId || '',
                    price: initialData?.price ? initialData.price.toString() : '',
                    minStockThreshold: initialData?.minStockThreshold ? initialData.minStockThreshold.toString() : '0',
                    imageUrl: (initialData as any)?.imageUrl || undefined,
                });
                
                console.log(`[ProductForm] ✅ Carga exitosa. Marcas: ${loadedBrands.length}, Categorías: ${loadedCategories.length}, Proveedores: ${loadedSuppliers.length}, UoM: ${loadedUnits.length}`);
                
            } catch (error) {
                console.error("[ProductForm] 🚨 Error al cargar datos maestros:", error);
                toast.error("Error al cargar datos maestros para el formulario.");
            } finally {
                setIsDataLoading(false);
                console.log("[ProductForm] 🏁 Carga de datos maestros finalizada.");
            }
        };

        if (isOpen) {
             loadMasterData();
        }
    }, [isOpen, initialData, isEditMode]);

    const [masterData, setMasterData] = useState<MasterData>({
        brands: [],
        categories: [],
        suppliers: [],
        unitsOfMeasure: [],
    });

    const [formData, setFormData] = useState<FormData>({
        sku: initialData?.sku || '',
        name: initialData?.name || '',
        brandId: initialData?.brandId || '',
        categoryId: initialData?.categoryId || '',
        preferredSupplierId: (initialData as any)?.defaultSupplierId || '', 
        unitOfMeasureId: initialData?.unitOfMeasureId || '',
        price: initialData?.price ? initialData.price.toString() : '',
        minStockThreshold: initialData?.minStockThreshold ? initialData.minStockThreshold.toString() : '0',
        imageUrl: (initialData as any)?.imageUrl || undefined,
    });
    
    useEffect(() => {
        const loadMasterData = async () => {
            setIsDataLoading(true);
            console.log("[ProductForm] ⌛ Iniciando carga de datos maestros...");
            try {
                const [loadedBrands, loadedCategories, loadedSuppliers, loadedUnits] = await Promise.all([
                    getBrands(),
                    getCategories(),
                    getSuppliers(),
                    getUnitsOfMeasure(),
                ]);
                
                setMasterData({
                    brands: loadedBrands,
                    categories: loadedCategories,
                    suppliers: loadedSuppliers,
                    unitsOfMeasure: loadedUnits,
                });
                console.log(`[ProductForm] ✅ Carga exitosa. Marcas: ${loadedBrands.length}, Categorías: ${loadedCategories.length}, Proveedores: ${loadedSuppliers.length}, UoM: ${loadedUnits.length}`);
                
            } catch (error) {
                console.error("[ProductForm] 🚨 Error al cargar datos maestros:", error);
                toast.error("Error al cargar datos maestros para el formulario.");
            } finally {
                setIsDataLoading(false);
                console.log("[ProductForm] 🏁 Carga de datos maestros finalizada.");
            }
        };

        if (isOpen) {
             setFormData({
                sku: initialData?.sku || '',
                name: initialData?.name || '',
                brandId: initialData?.brandId || '',
                categoryId: initialData?.categoryId || '',
                preferredSupplierId: (initialData as any)?.defaultSupplierId || '', 
                unitOfMeasureId: initialData?.unitOfMeasureId || '',
                price: initialData?.price ? initialData.price.toString() : '',
                minStockThreshold: initialData?.minStockThreshold ? initialData.minStockThreshold.toString() : '0',
                imageUrl: (initialData as any)?.imageUrl || undefined,
            });
            loadMasterData();
        }
    }, [isOpen, initialData]); 


    const handleImageUpdate = useCallback((newImageUrl: string | undefined) => {
        setFormData(prev => ({ ...prev, imageUrl: newImageUrl }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const parsedValue = ['brandId', 'categoryId', 'preferredSupplierId', 'unitOfMeasureId', 'minStockThreshold'].includes(name)
            ? (value === '' ? '' : parseInt(value, 10))
            : value;
            
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        
        console.log(`[ProductForm] Cambio: ${name}=${parsedValue}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const priceValue = parseFloat(formData.price);
        const minStockThresholdValue = parseInt(formData.minStockThreshold.toString(), 10);
        const preferredSupplierId = formData.preferredSupplierId as number | '';
        
        console.log("[ProductForm] 🔍 Validando y parseando datos...");
        
        if (
            isNaN(priceValue) || priceValue <= 0 || 
            !formData.sku || !formData.name || 
            formData.brandId === '' || formData.categoryId === '' || 
            formData.unitOfMeasureId === '' ||
            preferredSupplierId === ''
        ) {
            console.error("[ProductForm] ❌ Error de validación en Frontend. Faltan campos, precio inválido o Proveedor Preferido no seleccionado.");
            toast.error('Por favor, completa todos los campos requeridos, incluyendo el Proveedor Preferido.');
            setIsLoading(false);
            return;
        }

        try {
            const productData: Omit<Product, 'id'> = {
                sku: formData.sku,
                name: formData.name,
                imageUrl: formData.imageUrl, 
                brandId: formData.brandId as number,
                categoryId: formData.categoryId as number,
                unitOfMeasureId: formData.unitOfMeasureId as number,
                price: priceValue,
                minStockThreshold: minStockThresholdValue,
            };
            
            console.log(`[ProductForm] 📤 Paso 1: Enviando DTO de Producto:`, productData);
            
            let resultProduct: Product;
            const supplierId = preferredSupplierId as number;

            if (isEditMode) {
                if (!initialData?.id) throw new Error("ID de producto no definido para edición.");
                resultProduct = await updateProduct(initialData.id, productData);
                
                await createProductSupplierRelation({
                    productId: resultProduct.id as number,
                    supplierId: supplierId,
                    supplierProductCode: null,
                    unitCost: 0.0, 
                    leadTimeDays: 0,
                    isPreferred: true, 
                    isActive: true,
                });
                
                console.log(`[ProductForm] ✅ Producto ID ${resultProduct.id} actualizado y relación de proveedor POST intentada.`);
                toast.success(`Producto "${resultProduct.name}" actualizado con éxito.`);
            } else {
                resultProduct = await createProduct(productData);
                
                await createProductSupplierRelation({
                    productId: resultProduct.id as number,
                    supplierId: supplierId,
                    supplierProductCode: null,
                    unitCost: 0.0, 
                    leadTimeDays: 0,
                    isPreferred: true,
                    isActive: true,
                });

                 setCurrentProductId(resultProduct.id);
                console.log(`[ProductForm] ✅ Nuevo producto ID ${resultProduct.id} creado y relación de proveedor establecida.`);
                toast.success(`Producto "${resultProduct.name}" creado con éxito.`);
            }

            onSubmit(resultProduct);

        } catch (error) {
            console.error('[ProductForm] 🚨 Error al guardar/actualizar producto o su relación:', error);
            
            const axiosError = error as any;
            const status = axiosError.response?.status;
            let errorMessage = axiosError.message || 'Error de conexión/servidor.';
            
            if (status === 409) {
                 errorMessage = 'Ya existe una relación de Proveedor Principal para este producto (409 Conflict).';
            } else if (status === 500) {
                 errorMessage = 'Error interno del servidor (500).';
            } else if (status === 400) {
                 errorMessage = axiosError.response?.data?.message || 'Solicitud incorrecta (400).';
            }

            toast.error(`Error al guardar: ${errorMessage}`);
            
        } finally {
            setIsLoading(false);
            console.log("[ProductForm] 🏁 Envío finalizado.");
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${currentProductId ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto transform transition-all duration-300`}>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {}
                            <form 
                                onSubmit={handleSubmit} 

                                className={`space-y-4 ${currentProductId ? 'lg:col-span-2' : 'lg:col-span-3'}`} 
                            >
                                {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {}
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
                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {}
                                {}
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
                                
                                {}
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
                                
                                {}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {}
                                    <div>
                                        <label htmlFor="preferredSupplierId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor Preferido</label>
                                        <select
                                            name="preferredSupplierId"
                                            id="preferredSupplierId"
                                            value={formData.preferredSupplierId}
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

                                    {}
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
                                
                                {}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {}
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

                                {}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isDataLoading}
                                        className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{isEditMode ? 'Guardar Cambios' : (currentProductId ? 'Guardar y Continuar' : 'Crear Producto')}</span>
                                    </button>
                                </div>
                            </form>
                            
                            {}
                            {currentProductId && (
                                <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pl-6 border-gray-200 dark:border-gray-700">
                                    <ImageUploader 
                                        productId={currentProductId}
                                        onUpdateProductImage={handleImageUpdate}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductForm;