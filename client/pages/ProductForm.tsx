import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { createProduct, Product } from '../api/services/products';
import { Package, DollarSign, Book, Image, Truck } from 'lucide-react';

// Interfaz para los datos del formulario (coincide con Omit<Product, 'id'>)
interface ProductFormData {
    sku: string;
    name: string;
    author: string;
    price: string; // Usamos string para el input
    stock: string; // Usamos string para el input
    imageUrl: string;
    supplier: string;
}

// Valores iniciales
const initialFormData: ProductFormData = {
    sku: '',
    name: '',
    author: '',
    price: '',
    stock: '',
    imageUrl: 'https://placehold.co/100x150/000000/FFFFFF?text=Product',
    supplier: '',
};

interface ProductFormProps {
    onProductCreated: (newProduct: Product) => void;
    onClose: () => void;
}


const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated, onClose }) => {
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validación y conversión a tipos numéricos
        const price = parseFloat(formData.price);
        const stock = parseInt(formData.stock, 10);

        if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0 || !formData.name || !formData.sku) {
            setError("Por favor, rellena todos los campos obligatorios y verifica que el precio/stock sean válidos.");
            setIsLoading(false);
            return;
        }

        try {
            const productToCreate: Omit<Product, 'id'> = {
                sku: formData.sku,
                name: formData.name,
                author: formData.author,
                price: price,
                stock: stock,
                imageUrl: formData.imageUrl,
                supplier: formData.supplier,
            };
            
            const newProduct = await createProduct(productToCreate);
            
            onProductCreated(newProduct);
            onClose(); // Cerrar el formulario/modal
            // Aquí se usaría un toast para mostrar éxito (si tienes use-toast.ts implementado)
            console.log("Producto creado con éxito:", newProduct);
            
        } catch (err) {
            console.error("Error al crear el producto:", err);
            setError("Error al crear el producto. Revisa la consola o intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const InputField: React.FC<{ name: keyof ProductFormData, label: string, type: string, icon: React.ElementType, required?: boolean }> = ({ name, label, type, icon: Icon, required = false }) => (
        <div className="space-y-1">
            <label htmlFor={name} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon className="w-4 h-4 mr-2 text-emerald-600" />
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                step={type === 'number' && name === 'price' ? "0.01" : undefined}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-900 rounded-lg space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Añadir Nuevo Producto</h2>
            
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="name" label="Nombre del Producto" type="text" icon={Book} required />
                <InputField name="sku" label="SKU (Código)" type="text" icon={Package} required />
                <InputField name="author" label="Autor/Marca" type="text" icon={Book} />
                <InputField name="supplier" label="Proveedor" type="text" icon={Truck} />
                <InputField name="price" label="Precio de Venta (USD)" type="number" icon={DollarSign} required />
                <InputField name="stock" label="Stock Inicial" type="number" icon={Package} required />
            </div>

            {/* URL de Imagen (Simulación de Subida) */}
            <InputField name="imageUrl" label="URL de Imagen (Simulación)" type="url" icon={Image} />
            <img src={formData.imageUrl} alt="Preview" className="h-24 w-auto object-cover rounded-lg shadow-md border dark:border-gray-700" />
            
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isLoading ? 'Guardando...' : 'Crear Producto'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;