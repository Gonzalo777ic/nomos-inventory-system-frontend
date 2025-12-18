import React from 'react';
import { Product } from '../types'; 

import ProductImageCarousel from './ProductImageCarousel'; 

import { X, Tag, ShoppingBag, Truck, DollarSign, Package, Loader2, Image as ImageIcon } from 'lucide-react';


interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null; 
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
    
    if (!isOpen || !product) return null;


    const supplierName = (product as any)?.supplierName || 'No Definido';
    const brandName = (product as any)?.brandName || 'No Definido';
    const categoryName = (product as any)?.categoryName || 'No Definido';

    const unitOfMeasureName = (product as any)?.unitOfMeasureName || 'N/A'; 
    

    const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
        <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
            <div className="text-emerald-500 flex-shrink-0 mt-0.5">
                {icon}
            </div>
            {}
            <div className="min-w-0 flex-1"> 
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p 
                    className="text-base font-bold text-gray-900 dark:text-white truncate"
                    title={String(value)}
                >
                    {value}
                </p>
            </div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                <div className="p-6">
                    {}
                    <div className="flex justify-between items-start border-b pb-4 mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{product.name}</h3>
                            <p className="text-md text-emerald-600 dark:text-emerald-400 mt-1">SKU: {product.sku}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {}
                        <div className="relative border p-4 rounded-xl bg-white dark:bg-gray-700 shadow-xl min-h-[400px]">
                            <ProductImageCarousel 
                                productId={product.id as number} 
                                productName={product.name} 
                            />
                        </div>

                        {}
                        <div className="space-y-6">
                            <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300">Detalles y Logística</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem icon={<Tag className="w-5 h-5" />} label="Marca" value={brandName} />
                                <DetailItem icon={<ShoppingBag className="w-5 h-5" />} label="Categoría" value={categoryName} />
                                <DetailItem icon={<Truck className="w-5 h-5" />} label="Proveedor Preferido" value={supplierName} />
                                {}
                                <DetailItem icon={<Package className="w-5 h-5" />} label="Unidad de Medida" value={unitOfMeasureName} />
                            </div>
                            
                            <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300 border-t pt-4">Finanzas y Stock</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem 
                                    icon={<DollarSign className="w-5 h-5" />} 
                                    label="Precio Base" 
                                    value={`$${product.price.toFixed(2)}`} 
                                />
                                <DetailItem 
                                    icon={<Loader2 className="w-5 h-5" />} 
                                    label="Stock Mínimo (Alerta)" 
                                    value={product.minStockThreshold} 
                                />
                            </div>
                            
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción General</p>
                                <p className="mt-1 text-gray-700 dark:text-gray-200">
                                    Información adicional del producto. En este modo de vista, el foco está en la imagen y los datos clave no son editables.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductDetailModal;