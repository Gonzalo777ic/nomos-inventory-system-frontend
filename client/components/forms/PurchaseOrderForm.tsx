import React, { useMemo, useEffect, useCallback } from "react"; 
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle, Trash2, Calendar, ShoppingCart, EyeOff } from "lucide-react";


import { 
    PurchaseOrder, 
    PurchaseOrderPayload, 
    Supplier,
    Product,
    JavaOrderStatus
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
  quantity: z.coerce.number()
    .min(1, "La cantidad debe ser al menos 1")
    .int("La cantidad debe ser un número entero"),
  unitCost: z.coerce.number()
    .min(0.01, "El costo unitario debe ser positivo"),
});


export const purchaseOrderSchema = z.object({
  supplierId: z.coerce.number({ required_error: "Proveedor es obligatorio" }).min(1, "Selecciona un proveedor"),
  orderDate: z.string().nonempty("Fecha de Orden es obligatoria"),
  deliveryDate: z.string().nonempty("Fecha de Entrega es obligatoria"), 
  status: z.enum(['PENDIENTE', 'RECIBIDO_PARCIAL', 'COMPLETO', 'CANCELADO'] as const), 
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



  const isImmutableField = isEditing; 
  

  const isStatusNonEditable = defaultPurchaseOrder && (defaultPurchaseOrder.status !== 'PENDIENTE');


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
  

  const javaStatuses: { value: JavaOrderStatus, label: string }[] = useMemo(() => ([
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'RECIBIDO_PARCIAL', label: 'Recibido Parcial' },
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
            status: (defaultPurchaseOrder?.status || 'PENDIENTE') as z.infer<typeof purchaseOrderSchema>['status'],
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
              status: defaultPurchaseOrder.status as z.infer<typeof purchaseOrderSchema>['status'],
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
          toast({ title: "Éxito", description: "Orden de Compra creada.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); 
          onSuccess();
      },
      onError: (error) => {
          console.error(error);
          const errorMessage = (error as any)?.response?.data?.message || "Fallo al crear la Orden de Compra.";
          toast({ title: "Error de Creación", description: errorMessage, variant: "destructive" });
      }
  });

  const updateMutation = useMutation({
      mutationFn: (data: { id: number, payload: PurchaseOrderPayload }) => updatePurchaseOrder(data.id, data.payload),
      onSuccess: () => {
          toast({ title: "Éxito", description: "Orden de Compra actualizada.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders', orderId] });
          onSuccess();
      },
      onError: (error) => {
          console.error(error);
          const errorMessage = (error as any)?.response?.data?.message || "Fallo al actualizar la Orden de Compra.";
          toast({ title: "Error de Actualización", description: errorMessage, variant: "destructive" });
      }
  });


  const deleteMutation = useMutation({
      mutationFn: (id: number) => deletePurchaseOrder(id),
      onSuccess: () => {
          toast({ title: "Éxito", description: "Orden de Compra eliminada.", variant: "default" });
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] }); 
          onSuccess();
      },
      onError: (error) => {
          console.error(error);
          const errorMessage = (error as any)?.response?.data?.message || "Fallo al eliminar la Orden de Compra.";
          toast({ 
              title: "Error de Eliminación", 
              description: errorMessage, 
              variant: "destructive" 
          });
      }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;


  const handleDelete = useCallback(() => {
      if (!orderId) return;

      if (window.confirm(`¿Está seguro de que desea eliminar la Orden de Compra OC-${orderId}? Esta acción es irreversible y solo es posible si el estado es PENDIENTE.`)) {
          deleteMutation.mutate(orderId);
      }
  }, [orderId, deleteMutation]);


  const onSubmit = (values: PurchaseOrderFormValues) => {

      if (isEditing && isStatusNonEditable) {
        toast({ title: "Advertencia", description: "Esta orden ya no se puede modificar.", variant: "destructive" });
        return;
      }
      
      const detailPayloads = values.details.map(detail => {
          return {
              product: { id: detail.productId }, 
              quantity: detail.quantity,
              unitCost: detail.unitCost, 
          }
      });

      const payload: PurchaseOrderPayload = {
          supplier: { id: values.supplierId }, 
          orderDate: values.orderDate,
          deliveryDate: values.deliveryDate,
          status: values.status as JavaOrderStatus, 
          totalAmount: totalAmount, 
          details: detailPayloads
      };

      if (isEditing && orderId) {
          updateMutation.mutate({ id: orderId, payload });
      } else {

          createMutation.mutate({ ...payload, status: 'PENDIENTE' }); 
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
  

  const ReadOnlyHeader = readOnly && (
      <div className="p-3 mb-4 bg-blue-100 text-blue-700 border-l-4 border-blue-500 rounded-lg flex items-center">
        <EyeOff className="w-5 h-5 mr-2"/>
        <p className="font-medium">Esta es una vista de **Detalle** de la Orden de Compra. Los campos están deshabilitados.</p>
      </div>
  );
  
  const StatusLockedHeader = isEditing && isStatusNonEditable && !readOnly && (
      <div className="p-3 mb-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-lg flex items-center">
        <EyeOff className="w-5 h-5 mr-2"/>
        <p className="font-medium">️ Esta orden se encuentra en estado **{defaultPurchaseOrder.status}** y ya no puede ser modificada.</p>
      </div>
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {ReadOnlyHeader}
        {StatusLockedHeader} {}

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="col-span-1 md:col-span-3">
              <h3 className="text-lg font-semibold flex items-center"><ShoppingCart className="w-5 h-5 mr-2"/> Información de la Orden</h3>
          </div>
          
          {}
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value.toString()}

                    disabled={isImmutableField} 
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

          {}
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Orden (Origen)</FormLabel>
                <FormControl>
                  <div className="relative">
                    {}
                    <Input type="date" {...field} disabled={isImmutableField} /> 
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {}
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega Esperada</FormLabel>
                <FormControl>
                  <div className="relative">
                    {}
                    <Input type="date" {...field} disabled={isDisabled} /> 
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {}
          {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value}

                        disabled={isDisabled} 
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {javaStatuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
          )}
        </div>

        {}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <PlusCircle className="w-5 h-5 mr-2"/> Productos a Comprar ({fields.length})
          </h3>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="grid grid-cols-12 gap-2 p-3 border rounded-lg items-end relative"
              >
                {}
                <FormField
                  control={form.control}
                  name={`details.${index}.productId`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-6 md:col-span-5">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Producto</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          const id = Number(val);
                          const selectedProduct = products?.find(p => p.id === id);
                          form.setValue(`details.${index}.productName`, selectedProduct?.name || '');
                          detailField.onChange(id);
                        }} 
                        value={detailField.value.toString()}
                        disabled={isDisabled} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona producto" />
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

                {}
                <FormField
                  control={form.control}
                  name={`details.${index}.quantity`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-3 md:col-span-2">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Cantidad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Cantidad" 
                          {...detailField} 
                          onChange={(e) => detailField.onChange(e.target.valueAsNumber)}
                          disabled={isDisabled} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {}
                <FormField
                  control={form.control}
                  name={`details.${index}.unitCost`}
                  render={({ field: detailField }) => (
                    <FormItem className="col-span-3 md:col-span-3">
                      <FormLabel className={index === 0 ? "block" : "sr-only"}>Costo Unitario</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Costo" 
                          {...detailField} 
                          onChange={(e) => detailField.onChange(e.target.valueAsNumber)}
                          disabled={isDisabled} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {}
                <div className="col-span-12 md:col-span-1 flex items-center justify-end md:justify-start">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total: {((form.watch(`details.${index}.quantity`) || 0) * (form.watch(`details.${index}.unitCost`) || 0)).toFixed(2)}
                    </p>
                </div>

                {}
                {!isDisabled && (
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="ghost" 
                      size="icon" 
                      className="col-span-1 w-8 h-8 absolute top-0 right-0 m-1 text-red-500 hover:bg-red-50"
                      disabled={fields.length === 1 && !isEditing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                )}
              </div>
            ))}
          </div>

          {!isDisabled && ( 
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ productId: 0, productName: '', quantity: 1, unitCost: 0.01 })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          )}
        </div>

        {}
        <div className="flex justify-between items-center pt-4 border-t">
            <h4 className="text-xl font-bold">Total Estimado: $ {totalAmount.toFixed(2)}</h4>
            
            <div className="flex space-x-2"> 
                {}
                {canMutate && ( 
                    <Button 
                        type="button" 
                        onClick={handleDelete} 
                        variant="destructive"
                        disabled={isSubmitting}
                    >
                        {deleteMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Eliminar
                    </Button>
                )}

                {}
                {!readOnly && ( 
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isEditing ? (
                        "Guardar Cambios"
                      ) : (
                        "Crear Orden"
                      )}
                    </Button>
                )}
            </div>
        </div>
        
        {}
        {readOnly && (
            <div className="flex justify-end">
                <Button type="button" onClick={onSuccess} variant="secondary">
                    Cerrar Detalle
                </Button>
            </div>
        )}

      </form>
    </Form>
  );
};

export default PurchaseOrderForm;