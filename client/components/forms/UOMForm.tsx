import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UnitOfMeasure, UnitOfMeasureSchema, UnitOfMeasureFormValues } from '../../types'; // Ajustar ruta de importación
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnitOfMeasure, updateUnitOfMeasure } from '../../api/services/unitOfMeasure'; // Ajustar ruta de importación
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '../ui/form';
// Eliminamos la importación de Textarea ya que 'description' fue removida.

interface UOMFormProps {
    initialData?: UnitOfMeasure | null;
    onSuccess: () => void;
    onClose: () => void;
}

const UOMForm: React.FC<UOMFormProps> = ({ initialData, onSuccess, onClose }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;

    const form = useForm<UnitOfMeasureFormValues>({
        resolver: zodResolver(UnitOfMeasureSchema),
        defaultValues: {
            name: initialData?.name || '',
            // Corregido: Usamos 'abbreviation' en lugar de 'symbol'
            abbreviation: initialData?.abbreviation || '',
            // Eliminado: description
        },
    });

    const mutation = useMutation({
        // La validación ahora asegura que 'data' solo contiene 'name' y 'abbreviation'
        mutationFn: (data: UnitOfMeasureFormValues) => 
            isEditMode && initialData?.id
                ? updateUnitOfMeasure(initialData.id, data)
                : createUnitOfMeasure(data),
        onSuccess: () => {
            toast.success(`Unidad de medida ${isEditMode ? 'actualizada' : 'creada'} con éxito.`);
            queryClient.invalidateQueries({ queryKey: ['unitsOfMeasure'] });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la unidad.`;
            toast.error(errorMessage);
        },
    });

    const onSubmit = (values: UnitOfMeasureFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la Unidad</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ej: Kilogramo, Unidad, Caja" 
                                    {...field} 
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="abbreviation" // Corregido: Usamos 'abbreviation'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Abreviatura (Símbolo)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ej: kg, u, cj" 
                                    {...field} 
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Eliminado el FormField para 'description' */}

                <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        isEditMode ? 'Guardar Cambios' : 'Crear Unidad de Medida'
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default UOMForm;