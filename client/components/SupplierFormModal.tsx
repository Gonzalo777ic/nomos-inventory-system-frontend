import React, { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';


import { Supplier, SupplierSchema } from '../types'; 
import { createSupplier, updateSupplier } from '../api/services/supplier';

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplierToEdit: Supplier | null;
}


const formSchema = SupplierSchema.omit({ id: true });


type SupplierFormValues = z.infer<typeof formSchema>;


const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, supplierToEdit }) => {
    const queryClient = useQueryClient();
    const isEditing = !!supplierToEdit;
    

    const defaultFormValues: SupplierFormValues = {
        name: '',
        taxId: '',
        email: '',
        phone: '',
        address: '',
        contactName: '',
    };
    
    const form = useForm<SupplierFormValues>({

        resolver: zodResolver(formSchema), 
        defaultValues: defaultFormValues,
    });


    useEffect(() => {
        if (isEditing && supplierToEdit) {

            const resetValues: SupplierFormValues = {
                name: supplierToEdit.name,
                taxId: supplierToEdit.taxId,
                email: supplierToEdit.email,
                phone: supplierToEdit.phone,
                address: supplierToEdit.address,
                contactName: supplierToEdit.contactName,
            };
            form.reset(resetValues);
        } else if (!isEditing) {
            form.reset(defaultFormValues);
        }
    }, [supplierToEdit, isEditing, form.reset]);


    const supplierMutation = useMutation({

        mutationFn: (data: SupplierFormValues) => { 
            if (isEditing && supplierToEdit?.id) {
                return updateSupplier(supplierToEdit.id, data);
            }
            return createSupplier(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success(`Proveedor ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
            onClose();
            form.reset(defaultFormValues); 
        },
        onError: (error: any) => {
            console.error("Error saving supplier:", error);
            toast.error(`Fallo al guardar: ${error.message || 'Error de conexión.'}`);
        },
    });



    const handleSubmit = form.handleSubmit((data) => {
        supplierMutation.mutate(data as SupplierFormValues);
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    
                    {}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Compañía</Label>
                            <Input id="name" {...form.register('name')} />
                            {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="contactName">Contacto Clave</Label>
                            <Input id="contactName" {...form.register('contactName')} />
                            {form.formState.errors.contactName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.contactName.message}</p>}
                        </div>
                    </div>
                    
                    {}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="taxId">RUC / ID Fiscal</Label>
                            <Input id="taxId" {...form.register('taxId')} />
                            {form.formState.errors.taxId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.taxId.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...form.register('email')} />
                            {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
                        </div>
                    </div>

                    {}
                    <div className="space-y-1">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" type="tel" {...form.register('phone')} />
                        {form.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="address">Dirección Completa</Label>
                        <Input id="address" {...form.register('address')} />
                        {form.formState.errors.address && <p className="text-red-500 text-xs mt-1">{form.formState.errors.address.message}</p>}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={supplierMutation.isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={supplierMutation.isPending}>
                            {supplierMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SupplierFormModal;
