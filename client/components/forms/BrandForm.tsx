import React from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Brand } from '../../types'; 
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrand, updateBrand } from '../../api/services/brand'; 
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from '../ui/form';



export const BrandSchema = z.object({
    name: z.string().min(2, "El nombre es obligatorio y debe tener al menos 2 caracteres.").max(100),
    code: z.string().max(10, "El código no debe exceder 10 caracteres.").nullable().optional().or(z.literal('')),
    website: z.string().url("Debe ser una URL válida.").nullable().optional().or(z.literal('')),
    logoUrl: z.string().url("Debe ser una URL válida.").nullable().optional().or(z.literal('')),
});

type BrandFormValues = z.infer<typeof BrandSchema>;


interface BrandFormProps {
    initialData?: Brand | null;
    onSuccess: () => void;
    onClose: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ initialData, onSuccess, onClose }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!initialData;

    const form = useForm<BrandFormValues>({
        resolver: zodResolver(BrandSchema),
        defaultValues: {
            name: initialData?.name || '',
            code: initialData?.code || '',
            website: initialData?.website || '',
            logoUrl: initialData?.logoUrl || '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: BrandFormValues) => {

            const cleanedData = {
                ...data,
                code: data.code || null,
                website: data.website || null,
                logoUrl: data.logoUrl || null,
            };

            return isEditMode && initialData?.id
                ? updateBrand(initialData.id, cleanedData)
                : createBrand(cleanedData);
        },
        onSuccess: () => {
            toast.success(`Marca ${isEditMode ? 'actualizada' : 'creada'} con éxito.`);
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la marca.`;
            toast.error(errorMessage);
        },
    });

    const onSubmit = (values: BrandFormValues) => {
        mutation.mutate(values); 
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre de la Marca</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ej: Sony, Samsung, HP" 
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
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Código (Abreviatura)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ej: SNY, SSG, HP (Opcional)" 
                                    {...field} 
                                    value={field.value ?? ''} 
                                    onChange={e => field.onChange(e.target.value)}
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sitio Web (URL) - Opcional</FormLabel>
                            <FormControl>
                                <Input 
                                    type="url"
                                    placeholder="Ej: https://www.marca.com" 
                                    {...field} 
                                    value={field.value ?? ''}
                                    onChange={e => field.onChange(e.target.value)}
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL del Logo - Opcional</FormLabel>
                            <FormControl>
                                <Input 
                                    type="url"
                                    placeholder="Ej: https://cdn.com/logo.png" 
                                    {...field} 
                                    value={field.value ?? ''}
                                    onChange={e => field.onChange(e.target.value)}
                                    disabled={mutation.isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        isEditMode ? 'Guardar Cambios' : 'Crear Marca'
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default BrandForm;