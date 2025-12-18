import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentMethodConfig, PaymentMethodPayload, PaymentMethodService } from '../../api/services/paymentMethodConfig';
import { useToast } from '../../hooks/use-toast.ts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Label } from '../ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form.tsx';
import { Loader2, Plus, Pencil } from 'lucide-react';


const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }).max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
  type: z.enum(['TARJETA', 'EFECTIVO', 'ELECTRÓNICO', 'OTRO'], {
    required_error: "Debe seleccionar un tipo de pago.",
  }),
});

type PaymentMethodFormData = z.infer<typeof formSchema>;


interface PaymentMethodFormProps {
  initialData?: PaymentMethodConfig;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ initialData, onSuccess, trigger }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: (initialData?.type as PaymentMethodFormData['type']) || 'EFECTIVO',
    },
    mode: "onChange",
  });

  const onSubmit = async (data: PaymentMethodFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {

        await PaymentMethodService.update(initialData.id, data as PaymentMethodPayload);
        toast({
          title: "Actualizado",
          description: `Método '${data.name}' actualizado con éxito.`,
        });
      } else {

        await PaymentMethodService.create(data as PaymentMethodPayload);
        toast({
          title: "Creado",
          description: `Método '${data.name}' creado con éxito.`,
        });
        form.reset({ name: '', type: 'EFECTIVO' });
      }

      onSuccess();
      setOpen(false);
    } catch (e: any) {
      console.error("Error al guardar método de pago:", e);

      const message = e.response?.status === 409 
        ? "El nombre del método de pago ya existe. Use un nombre diferente."
        : "Ocurrió un error al guardar. Verifique su conexión o permisos.";

      toast({
        title: "Error al Guardar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary-dark">
        <Pencil className="h-4 w-4" />
    </Button>
  ) : (
    <Button onClick={() => form.reset({ name: '', type: 'EFECTIVO' })}>
      <Plus className="mr-2 h-4 w-4" /> Nuevo Método
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar: ${initialData?.name}` : "Crear Nuevo Método de Pago"}</DialogTitle>
          <DialogDescription>
            Defina el nombre y tipo de clasificación del método de pago.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Método</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Yape, VISA, Efectivo" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de clasificación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">EFECTIVO</SelectItem>
                      <SelectItem value="TARJETA">TARJETA (Débito/Crédito)</SelectItem>
                      <SelectItem value="ELECTRÓNICO">ELECTRÓNICO (Yape, Plin, Transferencia)</SelectItem>
                      <SelectItem value="OTRO">OTRO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Método'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodForm;