import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, CheckCheck, Pencil } from 'lucide-react';
import { isAxiosError } from 'axios'; 

import { useToast } from '../../hooks/use-toast.ts'; 

import { TaxRate, TaxRateService } from '../../api/services/taxRate.ts'; 
import { Button } from '../ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form.tsx';
import { Input } from '../ui/input.tsx';


const TaxRateSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  rate: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const cleaned = val.replace(',', '.');
        return parseFloat(cleaned);
      }
      return val;
    },
    z.number({ required_error: "La tasa es obligatoria." })
    .min(0.0, "La tasa no puede ser negativa.").max(1.0, "La tasa no puede ser mayor a 1.0 (100%).")
  ),
});

type TaxRateFormValues = z.infer<typeof TaxRateSchema>;

interface TaxRateFormProps {
  onSuccess: () => void;
  
  initialData?: TaxRate; 
  
  trigger?: React.ReactNode; 
}

const TaxRateForm: React.FC<TaxRateFormProps> = ({ onSuccess, initialData, trigger }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  

  const isEditMode = !!initialData;

  const form = useForm<TaxRateFormValues>({ 
    resolver: zodResolver(TaxRateSchema), 
    defaultValues: {

      name: initialData?.name || "",
      rate: initialData?.rate || 0.18,
    },
  });


  useEffect(() => {
    if (initialData) {
        form.reset({
            name: initialData.name,
            rate: initialData.rate,
        });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<TaxRateFormValues> = async (data) => {
    const rateData = { 
      name: data.name,
      rate: data.rate,
    };
    

    try {
      if (isEditMode && initialData?.id) {



        await TaxRateService.update(initialData.id, rateData); 
        toast({
          title: "Tasa Actualizada",
          description: `La tasa '${rateData.name}' ha sido actualizada.`,
        });
      } else {

        await TaxRateService.create(rateData);
        toast({
          title: "Tasa Creada",
          description: `La tasa '${rateData.name}' (${(rateData.rate * 100).toFixed(2)}%) se ha guardado correctamente.`,
        });
        form.reset({ name: "", rate: 0.18 });
      }

      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} tasa:`, error);
      let errorMessage = `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la tasa.`;
      
      if (isAxiosError(error)) {
          if (error.response?.status === 409) {
              errorMessage = "Ya existe una tasa con este nombre. Por favor, use un nombre único.";
          } else if (error.response?.status === 401) {
              errorMessage = "No tienes permisos de Administrador para realizar esta acción.";
          }
      }

      toast({
        title: "Error de Guardado",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Nueva Tasa
    </Button>
  );

  const editTrigger = (
    <Button variant="ghost" size="icon">
      <Pencil className="w-4 h-4" />
    </Button>
  );


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (isEditMode ? editTrigger : defaultTrigger)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Editar Tasa: ${initialData?.name}` : "Crear Nueva Tasa de Impuesto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Impuesto</FormLabel>
                  <FormControl>
                    {/* El campo 'name' no debería ser editable en modo edición si ya hay ventas usándolo. 
                        Lo ponemos como disabled para mantener la integridad, solo la tasa cambia. */}
                    <Input placeholder="Ej: IGV General" {...field} disabled={isEditMode} /> 
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa (0.0 a 1.0)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: 0.18"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              {form.formState.isSubmitting 
                ? "Guardando..." 
                : isEditMode ? "Guardar Cambios" : "Guardar Tasa"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaxRateForm;