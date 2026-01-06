import React, { useMemo, useEffect, useCallback } from "react"; 
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle, Trash2, Calendar, ShoppingCart, EyeOff, Lock } from "lucide-react";

import { 
    PurchaseOrder, 
    PurchaseOrderPayload, 
    Supplier,
    Product,
    OrderStatus
} from '@/types/index';
import { 
    createPurchaseOrder, 
    updatePurchaseOrder,
    deletePurchaseOrder
} from '@/api/services/purchase-order';
import { getSuppliers } from '@/api/services/supplier'; 
import { getProducts } from '@/api/services/products'; 

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form'; 


const detailSchema = z.object({
  productId: z.coerce.number({ required_error: "Producto es obligatorio" }).min(1, "Selecciona un producto"), 
  productName: z.string().optional(), 
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1").int(),
  unitCost: z.coerce.number().min(0.01, "El costo unitario debe ser positivo"),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.coerce.number().min(1, "Selecciona un proveedor"),
  orderDate: z.string().nonempty("Fecha de Orden es obligatoria"),
  deliveryDate: z.string().nonempty("Fecha de Entrega es obligatoria"), 
  status: z.enum(['BORRADOR', 'PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'COMPLETO', 'CANCELADO'] as const), 
  details: z.array(detailSchema).min(1, "La orden debe tener al menos un producto."),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  defaultPurchaseOrder?: PurchaseOrder; 
  onSuccess: () => void;
  readOnly: boolean;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  defaultPurchaseOrder,
  onSuccess,
  readOnly = false, 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isEditing = !!defaultPurchaseOrder;
  const orderId = defaultPurchaseOrder?.id;



  const isStatusNonEditable = defaultPurchaseOrder && 
    !['BORRADOR', 'PENDIENTE'].includes(defaultPurchaseOrder.status);


  const isDisabled = readOnly || isStatusNonEditable; 


  const canMutate = isEditing && !readOnly && !isStatusNonEditable;
  

  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
      queryKey: ['suppliers'],
      queryFn: getSuppliers,
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
      queryKey: ['products'],
      queryFn: getProducts,
  });
  

  const javaStatuses: { value: OrderStatus, label: string }[] = useMemo(() => ([
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'PENDIENTE', label: 'Pendiente (Enviado)' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'COMPLETO', label: 'Completo' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ]), []);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema as any),
    defaultValues: useMemo(() => {
        const initialSupplierId = defaultPurchaseOrder?.supplier?.id || 0;
        
        const mappedDetails = defaultPurchaseOrder?.details.length 
          ? defaultPurchaseOrder.details.map(d => ({
              productId: d.product.id, 
              productName: d.product.name,
              quantity: d.quantity,
              unitCost: d.unitCost, 
            }))
          : [{ productId: 0, productName: '', quantity: 1, unitCost: 0.01 }];

        return {
            supplierId: initialSupplierId,
            orderDate: defaultPurchaseOrder?.orderDate || new Date().toISOString().split('T')[0],
            deliveryDate: defaultPurchaseOrder?.deliveryDate || '',
            status: (defaultPurchaseOrder?.status || 'BORRADOR'),
            details: mappedDetails,
        };
    }, [defaultPurchaseOrder]),
  });
  

  useEffect(() => {
      if (defaultPurchaseOrder) {
          const initialSupplierId = defaultPurchaseOrder.supplier.id || 0;
          const mappedDetails = defaultPurchaseOrder.details.map(d => ({
              productId: d.product.id, 
              productName: d.product.name,
              quantity: d.quantity,
              unitCost: d.unitCost, 
          }));

          form.reset({
              supplierId: initialSupplierId,
              orderDate: defaultPurchaseOrder.orderDate,
              deliveryDate: defaultPurchaseOrder.deliveryDate,
              status: defaultPurchaseOrder.status,
              details: mappedDetails,
          });
      }
  }, [defaultPurchaseOrder, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const totalAmount = form.watch('details').reduce((sum, detail) => {
    const q = detail.quantity || 0;
    const c = detail.unitCost || 0;
    return sum + (q * c);
  }, 0);
  

  const createMutation = useMutation({
      mutationFn: (data: PurchaseOrderPayload) => createPurchaseOrder(data),
      onSuccess: () => {
          toast({ title: "Éxito", description: "Orden creada en Borrador.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); 
          onSuccess();
      },
      onError: (error: any) => {
          const msg = error?.response?.data?.message || "Error al crear orden";
          toast({ title: "Error", description: msg, variant: "destructive" });
      }
  });

  const updateMutation = useMutation({
      mutationFn: (data: { id: number, payload: PurchaseOrderPayload }) => updatePurchaseOrder(data.id, data.payload),
      onSuccess: () => {
          toast({ title: "Éxito", description: "Cambios guardados.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
          onSuccess();
      },
      onError: (error: any) => {
          const msg = error?.response?.data?.message || "Error al guardar cambios";
          toast({ title: "Error", description: msg, variant: "destructive" });
      }
  });

  const deleteMutation = useMutation({
      mutationFn: (id: number) => deletePurchaseOrder(id),
      onSuccess: () => {
          toast({ title: "Eliminado", description: "La orden ha sido eliminada.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); 
          onSuccess();
      },
      onError: (error: any) => {
          toast({ title: "Error", description: "No se pudo eliminar la orden.", variant: "destructive" });
      }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleDelete = useCallback(() => {
      if (!orderId) return;
      if (window.confirm(`¿Eliminar definitivamente la orden OC-${orderId}?`)) {
          deleteMutation.mutate(orderId);
      }
  }, [orderId, deleteMutation]);

  const onSubmit = (values: PurchaseOrderFormValues) => {
      if (isEditing && isStatusNonEditable) {
        toast({ title: "Acción Bloqueada", description: "Esta orden ya fue procesada y no se puede editar.", variant: "destructive" });
        return;
      }
      
      const detailPayloads = values.details.map(detail => ({
          product: { id: detail.productId }, 
          quantity: detail.quantity,
          unitCost: detail.unitCost, 
      }));

      const payload: PurchaseOrderPayload = {
          supplier: { id: values.supplierId }, 
          orderDate: values.orderDate,
          deliveryDate: values.deliveryDate,
          status: values.status,
          totalAmount: totalAmount, 
          details: detailPayloads
      };

      if (isEditing && orderId) {
          updateMutation.mutate({ id: orderId, payload });
      } else {
          createMutation.mutate(payload); 
      }
  };
  
  if (isLoadingSuppliers || isLoadingProducts) {
      return (
          <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Cargando datos...</span>
          </div>
      );
  }
  

  const LockedHeader = isEditing && isStatusNonEditable && (
      <div className="p-3 mb-4 bg-amber-100 text-amber-800 border-l-4 border-amber-500 rounded-r-lg flex items-center shadow-sm">
        <Lock className="w-5 h-5 mr-2"/>
        <div>
            <p className="font-bold">Modo Solo Lectura</p>
            <p className="text-sm">Esta orden está en estado **{defaultPurchaseOrder?.status}**. Para modificar cantidades, debes cancelarla y crear una nueva.</p>
        </div>
      </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {LockedHeader}

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold flex items-center text-gray-700 dark:text-gray-200">
                  <ShoppingCart className="w-5 h-5 mr-2"/> Información General
              </h3>
          </div>
          
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value ? field.value.toString() : undefined}
                    disabled={isDisabled} 
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Emisión</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} disabled={isDisabled} /> 
                        <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Entrega</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" {...field} disabled={isDisabled} /> 
                        <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          
          {}
          {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Actual</FormLabel>
                    <Select value={field.value} disabled={true}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-100 dark:bg-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {javaStatuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
          )}
        </div>

        {}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center text-gray-700 dark:text-gray-200">
                <PlusCircle className="w-5 h-5 mr-2"/> Detalle de Productos ({fields.length})
              </h3>
              {!isDisabled && ( 
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: 0, productName: '', quantity: 1, unitCost: 0.01 })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              )}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="grid grid-cols-12 gap-3 p-4 border rounded-lg items-end bg-white dark:bg-gray-900 shadow-sm relative group"
              >
                <FormField
                  control={form.control}
                  name={`details.${index}.productId`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-5">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Producto</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          const id = Number(val);
                          const selectedProduct = products?.find(p => p.id === id);
                          form.setValue(`details.${index}.productName`, selectedProduct?.name || '');
                          detailField.onChange(id);
                        }} 
                        value={detailField.value ? detailField.value.toString() : undefined}
                        disabled={isDisabled} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {products?.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`details.${index}.quantity`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Cant.</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...detailField} 
                          onChange={(e) => detailField.onChange(e.target.valueAsNumber)}
                          disabled={isDisabled} 
                          className="text-center"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`details.${index}.unitCost`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-3">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Costo Unit.</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...detailField} 
                              onChange={(e) => detailField.onChange(e.target.valueAsNumber)}
                              disabled={isDisabled} 
                              className="pl-6"
                            />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2 flex flex-col items-end justify-center h-10">
                    {index === 0 && <span className="text-sm font-medium text-gray-500 mb-2">Subtotal</span>}
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                        $ {((form.watch(`details.${index}.quantity`) || 0) * (form.watch(`details.${index}.unitCost`) || 0)).toFixed(2)}
                    </span>
                </div>

                {!isDisabled && (
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={fields.length === 1 && !isEditing}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t mt-6 bg-gray-50 dark:bg-gray-800/30 -mx-6 -mb-6 p-6 rounded-b-lg">
            <div>
                <span className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Estimado</span>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    $ {totalAmount.toFixed(2)}
                </div>
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0"> 
                {canMutate && ( 
                    <Button 
                        type="button" 
                        onClick={handleDelete} 
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={isSubmitting}
                    >
                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Eliminar Orden
                    </Button>
                )}

                {!readOnly && !isDisabled && ( 
                    <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : isEditing ? (
                        "Guardar Cambios"
                      ) : (
                        "Crear Orden"
                      )}
                    </Button>
                )}
                
                {(readOnly || isDisabled) && (
                    <Button type="button" onClick={onSuccess} variant="secondary">
                        Cerrar
                    </Button>
                )}
            </div>
        </div>

      </form>
    </Form>
  );
};

export default PurchaseOrderForm;