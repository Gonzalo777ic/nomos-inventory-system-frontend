import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Promotion, PromotionPayload, PromotionService, PromotionTarget } from '../../api/services/promotionService.ts';
import { useToast } from '../../hooks/use-toast.ts';
import PromotionTargetForm from './PromotionTargetForm.tsx'; // <-- Importamos el sub-formulario
// UI Components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Checkbox } from '../ui/checkbox.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form.tsx';
import { Loader2, Plus, Pencil } from 'lucide-react';

// Utilidad para formatear LocalDateTime a 'YYYY-MM-DDTHH:MM' para input datetime-local
const formatLocalDateTime = (isoString: string | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localIso = new Date(date.getTime() - offset).toISOString();
  return localIso.substring(0, 16); // "YYYY-MM-DDTHH:MM"
};

// Esquema de validación para el formulario
const formSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  type: z.enum(['PORCENTAJE', 'MONTO_FIJO', 'TRES_POR_DOS']),
  discountValue: z.number().min(0.01, { message: "El valor debe ser positivo." }),
  startDate: z.string().min(1, { message: "Fecha de inicio es requerida." }),
  endDate: z.string().min(1, { message: "Fecha de fin es requerida." }),
  isActive: z.boolean(),
  appliesTo: z.enum(['PRODUCT', 'CATEGORY', 'SALE_TOTAL']),
}).refine(data => data.startDate < data.endDate, {
  message: "La fecha de inicio debe ser anterior a la fecha de fin.",
  path: ["endDate"],
});

type PromotionFormData = z.infer<typeof formSchema>;

interface PromotionFormProps {
  initialData?: Promotion;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}


const PromotionForm: React.FC<PromotionFormProps> = ({ initialData, onSuccess, trigger }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targets, setTargets] = useState<PromotionTarget[]>([]); // Estado para los Targets
  const [targetsLoading, setTargetsLoading] = useState(false); // Estado para la carga de Targets

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: (initialData?.type as PromotionFormData['type']) || 'PORCENTAJE',
      discountValue: initialData?.discountValue || 0,
      startDate: formatLocalDateTime(initialData?.startDate),
      endDate: formatLocalDateTime(initialData?.endDate),
      isActive: initialData?.isActive ?? true,
      appliesTo: (initialData?.appliesTo as PromotionFormData['appliesTo']) || 'PRODUCT',
    },
    mode: "onChange",
  });
  
  const appliesToWatch = form.watch('appliesTo');

  // --- Efecto para cargar los PromotionTargets al abrir el modal en modo edición ---
  useEffect(() => {
    if (open && isEditing && initialData.id) {
        setTargetsLoading(true);
        PromotionService.getTargetsByPromotion(initialData.id)
            .then(data => setTargets(data))
            .catch(e => {
                console.error("Error al cargar targets:", e);
                toast({ title: "Error", description: "No se pudieron cargar los objetivos de la promoción.", variant: "destructive" });
            })
            .finally(() => setTargetsLoading(false));
    } else if (open && !isEditing) {
        // Limpiar targets al crear
        setTargets([]);
    }
  }, [open, isEditing, initialData]);
  
  // Convertir el string de fecha/hora de HTML a formato ISO para el backend
  const dateStringToISO = (dateString: string) => {
    return new Date(dateString).toISOString();
  };

  // --- Manejo del Submit con Targets ---
  const onSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    
    // 1. Validar Targets si aplica
    if (data.appliesTo !== 'SALE_TOTAL' && targets.length === 0) {
        toast({ title: "Validación Requerida", description: "Debe añadir al menos un Producto/Categoría objetivo.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    if (data.appliesTo !== 'SALE_TOTAL' && targets.some(t => t.targetId === 0)) {
         toast({ title: "Validación Requerida", description: "Todos los objetivos deben tener un ID de Producto/Categoría válido.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    // 2. Crear Payload de Promoción
    const promoPayload: PromotionPayload = {
        ...data,
        startDate: dateStringToISO(data.startDate),
        endDate: dateStringToISO(data.endDate),
        discountValue: parseFloat(data.discountValue.toFixed(4)),
    };

    try {
      let savedPromotion: Promotion;
      if (isEditing) {
        savedPromotion = await PromotionService.update(initialData!.id, promoPayload);
        toast({ title: "Actualizado", description: `Promoción '${data.name}' actualizada.` });
      } else {
        savedPromotion = await PromotionService.create(promoPayload);
        toast({ title: "Creado", description: `Promoción '${data.name}' creada.` });
      }
      
      // 3. Si no aplica a SALE_TOTAL, actualizar los Targets
      if (data.appliesTo !== 'SALE_TOTAL') {
          // Filtramos solo los campos necesarios para el payload de bulk update
          const targetsToSave = targets.map(t => ({ 
              promotionId: savedPromotion.id, 
              targetType: t.targetType, 
              targetId: t.targetId 
          } as PromotionTarget));
          
          await PromotionService.bulkUpdateTargets(savedPromotion.id, targetsToSave);
          toast({ title: "Targets Guardados", description: "Objetivos de promoción actualizados con éxito.", });
      } else if (isEditing && data.appliesTo === 'SALE_TOTAL' && targets.length > 0) {
          // Caso especial: Si cambia de PRODUCT/CATEGORY a SALE_TOTAL, limpiamos targets
          await PromotionService.bulkUpdateTargets(savedPromotion.id, []);
      }

      onSuccess();
      setOpen(false);
      form.reset(data); // Resetea solo si fue exitoso y estamos creando
    } catch (e: any) {
      console.error("Error al guardar promoción o targets:", e);
      const message = e.response?.status === 409 
        ? "El nombre de la promoción ya existe."
        : "Ocurrió un error en el servidor al guardar la promoción.";

      toast({ title: "Error al Guardar", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (defaultTrigger y el resto del return/render omitido por brevedad, solo se actualiza el contenido)
  
  // El trigger por defecto (Botón de Creación o Ícono de Edición)
  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary-dark">
        <Pencil className="h-4 w-4" />
    </Button>
  ) : (
    <Button onClick={() => form.reset({ name: '', type: 'PORCENTAJE', discountValue: 0, startDate: formatLocalDateTime(new Date().toISOString()), endDate: '', isActive: true, appliesTo: 'PRODUCT' })}>
      <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar: ${initialData?.name}` : "Crear Nueva Promoción"}</DialogTitle>
          <DialogDescription>
            Defina las reglas y la vigencia del descuento.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            
            {/* ... (Campos Name, Type, DiscountValue - se mantienen igual) ... */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Promoción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 10% OFF Verano, 3x2 Bebidas" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Descuento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PORCENTAJE">PORCENTAJE (%)</SelectItem>
                                    <SelectItem value="MONTO_FIJO">MONTO FIJO ($)</SelectItem>
                                    <SelectItem value="TRES_POR_DOS">3x2 (Promoción Especial)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Valor (Decimal)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Ej: 0.10 (para 10%) o 5.00 (para $5)" 
                                    type="number" 
                                    step="0.01" 
                                    {...field} 
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    disabled={isSubmitting} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {/* FECHA DE INICIO */}
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha y Hora de Inicio</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {/* FECHA DE FIN */}
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fecha y Hora de Fin</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* APLICA A... */}
                <FormField
                    control={form.control}
                    name="appliesTo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aplica a:</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); setTargets([]); }} defaultValue={field.value} disabled={isSubmitting}> {/* <-- Limpiar targets al cambiar */}
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el alcance" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PRODUCT">PRODUCTO Específico</SelectItem>
                                    <SelectItem value="CATEGORY">CATEGORÍA Completa</SelectItem>
                                    <SelectItem value="SALE_TOTAL">TOTAL de la Venta</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {/* ESTADO ACTIVO (Sin cambios) */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md h-full mt-6">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Promoción Activa
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Determina si el descuento está disponible para el sistema.
                                </p>
                            </div>
                        </FormItem>
                    )}
                />
            </div>
            
            {/* --- SECCIÓN DE ASIGNACIÓN DE TARGETS --- */}
            {(appliesToWatch === 'PRODUCT' || appliesToWatch === 'CATEGORY') && !targetsLoading && (
                <PromotionTargetForm 
                    promotionId={initialData?.id || 0} // 0 si es nueva, el ID real si es edición
                    appliesTo={appliesToWatch}
                    targets={targets}
                    setTargets={setTargets}
                />
            )}
            
            {targetsLoading && (
                 <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-gray-500">Cargando objetivos existentes...</span>
                </div>
            )}
            {/* -------------------------------------- */}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || targetsLoading}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Crear Promoción'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionForm;