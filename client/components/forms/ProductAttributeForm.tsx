import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Importaciones de UI (ajustadas a rutas relativas)
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '../ui/form';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '../ui/select';

// Importación de Tipos y Servicios (ajustadas a rutas relativas)
import { ProductAttribute } from '../../types';
import { 
    createProductAttribute, 
    updateProductAttribute,
} from '../../api/services/product-attribute'; 

// --- 1. ESQUEMA ZOD (Mantenido dentro del Formulario) ---

// Usamos el tipo literal de ProductAttribute
const allowedDataTypes: [ProductAttribute['dataType'], ...ProductAttribute['dataType'][]] = ['String', 'Number', 'Boolean'];

export const productAttributeSchema = z.object({
    name: z.string().min(2, "El nombre del atributo es requerido.").max(50),
    dataType: z.enum(allowedDataTypes, {
        required_error: "El tipo de dato es requerido.",
    }),
});

export type ProductAttributeFormValues = z.infer<typeof productAttributeSchema>;


// --- 2. PROPS DEL COMPONENTE ---

interface ProductAttributeFormProps {
    initialData?: ProductAttribute | null;
    onSuccess: () => void;
    onClose: () => void;
}


// --- 3. COMPONENTE DE FORMULARIO ---

const ProductAttributeForm: React.FC<ProductAttributeFormProps> = ({
    initialData,
    onSuccess,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;

    const form = useForm<ProductAttributeFormValues>({
        resolver: zodResolver(productAttributeSchema),
        defaultValues: {
            name: initialData?.name || "",
            dataType: initialData?.dataType || "String", // Default a String
        },
    });

    // Mutación para Creación/Actualización
    const mutation = useMutation({
        // Usamos el tipo Omit<ProductAttribute, 'id'> que espera el servicio
        mutationFn: (data: Omit<ProductAttribute, 'id'>) => {
            if (isEditMode && initialData?.id) {
                return updateProductAttribute(initialData.id, data);
            }
            return createProductAttribute(data);
        },
        onSuccess: () => {
            toast.success(
                `Atributo ${isEditMode ? "actualizado" : "creado"} con éxito.`,
            );
            // Invalida la query para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            // Manejo de error de conflicto (409) del backend
            const message = 
                error.response?.data?.message || 
                `Error al ${isEditMode ? "actualizar" : "crear"} el atributo.`;
            toast.error(message);
        },
    });

    const onSubmit = (values: ProductAttributeFormValues) => {
        // El payload 'values' coincide con Omit<ProductAttribute, 'id'>
        mutation.mutate(values); 
    };

    const isSubmitting = mutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo de Nombre */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Atributo (Ej: Talla, Color)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ej: Color, Talla, Material"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo de Tipo de Dato */}
                <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Dato</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isSubmitting}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tipo de dato..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {allowedDataTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type} ({type === 'String' ? 'Texto' : type === 'Number' ? 'Número' : 'Sí/No'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-6" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditMode ? (
                        "Guardar Cambios"
                    ) : (
                        "Crear Atributo"
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default ProductAttributeForm;