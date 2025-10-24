import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useToast } from '../ui/use-toast';
import { InventoryItem } from '../../types';
// 🎯 Importar useMutation de React Query
import { createInventoryItem, updateInventoryItem } from '../../api/services/inventory-items'; 
import { useMutation } from '@tanstack/react-query';


// Esquema de validación con Zod (sin cambios)
const inventoryItemSchema = z.object({
    productId: z.number().positive("El ID del producto es requerido."),
    currentStock: z.coerce.number().int().min(1, "El stock debe ser al menos 1."),
    unitCost: z.coerce.number().min(0.01, "El costo unitario es requerido."),
    lotNumber: z.string().min(1, "El número de lote es requerido.").max(50),
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD).").nullable().optional(),
    location: z.string().min(1, "La ubicación es requerida.").max(100),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

interface InventoryItemFormProps {
    productId: number;
    defaultItem?: InventoryItem; // Si se proporciona, es modo edición (para el lote individual)
    onSuccess: () => void; // 🎯 Modificado para no esperar el ítem, solo la señal de éxito
    onClose?: () => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ productId, defaultItem, onSuccess, onClose }) => {
    const { toast } = useToast();
    const isEditing = !!defaultItem;

    const form = useForm<InventoryItemFormValues>({
        resolver: zodResolver(inventoryItemSchema),
        defaultValues: {
            productId: productId,
            currentStock: defaultItem?.currentStock || 0,
            unitCost: defaultItem?.unitCost || 0,
            lotNumber: defaultItem?.lotNumber || '',
            expirationDate: defaultItem?.expirationDate?.split('T')[0] || '',
            location: defaultItem?.location || '',
        },
    });

    // 🎯 Configuración de la Mutación de React Query para CREAR
    const createMutation = useMutation({
        mutationFn: createInventoryItem,
        onSuccess: (item) => {
            toast({
                title: "Stock Añadido",
                description: `Se ha creado el lote ${item.lotNumber} con ${item.currentStock} unidades.`,
            });
            // 🎯 Llamar al onSuccess del componente padre (que invalida la query)
            onSuccess(); 
        },
        onError: (error) => {
            console.error("Error al crear el lote de inventario:", error);
            toast({
                title: "Error",
                description: `Ocurrió un error al intentar crear el lote.`,
                variant: "destructive",
            });
        },
    });

    // 🎯 Configuración de la Mutación de React Query para EDITAR
    const updateMutation = useMutation({
        mutationFn: (data: { id: number, payload: any }) => updateInventoryItem(data.id, data.payload),
        onSuccess: (item) => {
            toast({
                title: "Lote Actualizado",
                description: `El lote ${item.lotNumber} ha sido modificado correctamente.`,
            });
            // 🎯 Llamar al onSuccess del componente padre (que invalida la query)
            onSuccess(); 
        },
        onError: (error) => {
            console.error("Error al actualizar el lote de inventario:", error);
            toast({
                title: "Error",
                description: `Ocurrió un error al intentar actualizar el lote.`,
                variant: "destructive",
            });
        },
    });

    // Asegura que el productId no cambie si el componente se reutiliza (sin cambios)
    useEffect(() => {
        form.setValue('productId', productId);
    }, [productId, form]);

    const onSubmit = (values: InventoryItemFormValues) => {
        const payload = {
            product: { id: values.productId },
            currentStock: values.currentStock,
            unitCost: values.unitCost,
            lotNumber: values.lotNumber,
            expirationDate: values.expirationDate || null, 
            location: values.location,
        };

        if (isEditing && defaultItem) {
            updateMutation.mutate({ id: defaultItem.id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* ... (campos del formulario sin cambios) ... */}
                <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cantidad Stock</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Existencias" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Costo Unitario</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="Costo del lote" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lotNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Lote</FormLabel>
                            <FormControl>
                                <Input placeholder="Lote-001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha de Vencimiento (Opcional)</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ubicación en Almacén</FormLabel>
                            <FormControl>
                                <Input placeholder="Pasillo A, Estante 3" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isEditing ? "Guardar Cambios" : "Añadir Stock"}
                </Button>
            </form>
        </Form>
    );
};

export default InventoryItemForm;