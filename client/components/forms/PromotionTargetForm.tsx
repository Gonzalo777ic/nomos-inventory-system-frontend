import React, { useState, useEffect, useCallback } from 'react';
import { Promotion, PromotionTarget, PromotionService } from '../../api/services/promotionService.ts';
import { Button } from '../ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Input } from '../ui/input.tsx';
import { Plus, Trash2, Loader2, Package, Tag } from 'lucide-react';
import { getProducts } from '../../api/services/products.ts'; // Servicio existente de productos
import { getCategories } from '../../api/services/category.ts'; // Servicio ASUMIDO de categorías
import { Product } from '../../types'; // El tipo Product (para obtener el nombre y ID)
import { Category } from '../../types'; // El tipo Category (ASUMIDO)

// --- Placeholder para Servicios de Consulta (Asumimos que existen) ---
// NOTA: En una implementación real, estas listas vendrían de un servicio cacheado.
interface ReferenceItem { 
    id: number; 
    name: string; 
}

// --- Hook Real para obtener Productos y Categorías desde la API ---
const useReferenceData = () => {
    const [products, setProducts] = useState<ReferenceItem[]>([]);
    const [categories, setCategories] = useState<ReferenceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Obtener Productos
            const productData: Product[] = await getProducts();
            const simpleProducts: ReferenceItem[] = productData.map(p => ({ 
                id: p.id, 
                name: `${p.name} (SKU: ${p.sku})` // Usar SKU para mejor identificación
            }));
            setProducts(simpleProducts);

            // 2. Obtener Categorías (Asumiendo que Category[] tiene id y name)
            const categoryData: Category[] = await getCategories();
            const simpleCategories: ReferenceItem[] = categoryData.map(c => ({ 
                id: c.id, 
                // Asumo que Category tiene un campo 'name'
                name: (c as any).name || `Categoría ID: ${c.id}` 
            }));
            setCategories(simpleCategories);

        } catch (e: any) {
            console.error("Error fetching reference data:", e);
            setError("No se pudieron cargar productos o categorías desde la API.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { products, categories, loading, error };
};
// --- FIN Hook Real ---


interface PromotionTargetFormProps {
    promotionId: number; 
    appliesTo: Promotion['appliesTo'];
    targets: PromotionTarget[];
    setTargets: React.Dispatch<React.SetStateAction<PromotionTarget[]>>;
}

const PromotionTargetForm: React.FC<PromotionTargetFormProps> = ({ promotionId, appliesTo, targets, setTargets }) => {
    
    // Usamos el hook real
    const { products, categories, loading, error } = useReferenceData(); 
    
    const isProductTarget = appliesTo === 'PRODUCT';
    const referenceList = isProductTarget ? products : categories;
    const referenceName = isProductTarget ? 'Producto' : 'Categoría';
    const referenceIcon = isProductTarget ? <Package className="h-4 w-4 mr-2" /> : <Tag className="h-4 w-4 mr-2" />;
    
    // Si la promoción aplica al total... (Lógica sin cambios)
    if (appliesTo === 'SALE_TOTAL') {
        return (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                Esta promoción aplica al **Total de la Venta** y no requiere objetivos específicos.
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-500">Cargando datos de inventario...</span>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300">
                ⚠️ **Error de API:** {error}
            </div>
        );
    }

    // --- Lógica de Manejo de Targets (Sin Cambios) ---
    const handleAddTarget = () => {
        setTargets(prev => [
            ...prev,
            { 
                promotionId: promotionId, 
                targetType: appliesTo, 
                targetId: 0, 
                id: Date.now() 
            } as PromotionTarget
        ]);
    };

    const handleTargetChange = (index: number, value: string) => {
        const newTargets = [...targets];
        newTargets[index].targetId = parseInt(value);
        setTargets(newTargets);
    };

    const handleRemoveTarget = (index: number) => {
        const newTargets = targets.filter((_, i) => i !== index);
        setTargets(newTargets);
    };
    
    // ... (El resto del componente sigue igual)

    return (
        <div className="space-y-3">
            <h4 className="text-md font-semibold flex items-center">{referenceIcon} Asignar {referenceName}s Específicos:</h4>
            
            {targets.length === 0 && (
                <div className="p-3 border rounded-md text-center text-sm text-gray-500 dark:text-gray-400">
                    Aún no ha asignado ningún {referenceName.toLowerCase()} a esta promoción.
                </div>
            )}

            {targets.map((target, index) => (
                <div key={target.id || index} className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                        <Select 
                            onValueChange={(value) => handleTargetChange(index, value)} 
                            value={target.targetId > 0 ? target.targetId.toString() : ''}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={`Seleccione un ${referenceName.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceList.map(item => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name} (ID: {item.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        type="button" 
                        onClick={() => handleRemoveTarget(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddTarget} 
                className="mt-2 w-full"
            >
                <Plus className="h-4 w-4 mr-2" /> Añadir {referenceName}
            </Button>

            {targets.some(t => t.targetId === 0) && (
                 <p className="text-xs text-red-500 mt-1">Debe seleccionar un ID válido para todos los objetivos añadidos.</p>
            )}
        </div>
    );
};

export default PromotionTargetForm;