import React, { useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { getProducts } from "@/api/services/products";
import { Quotation, QuotationPayload } from "@/types/index";


const detailSchema = z.object({
  isNewProduct: z.boolean().default(false),
  productId: z.string().optional(),
  productName: z.string().min(2, "El nombre del producto es requerido"),
  quantity: z.coerce.number().min(1, "Cantidad mínima 1"),
  quotedPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  skuSuggestion: z.string().optional()
});

const formSchema = z.object({
  notes: z.string().optional(),
  details: z.array(detailSchema).min(1, "Agrega al menos un producto")
});


interface Props {
  supplierId: number;
  initialData?: Quotation;
  onSubmit: (data: QuotationPayload) => void;
  isLoading: boolean;
}

export const QuotationFormSupplier: React.FC<Props> = ({ supplierId, initialData, onSubmit, isLoading }) => {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: getProducts });


  const defaultValues = useMemo(() => {

    if (initialData) {
        return {
            notes: initialData.notes || "",
            details: initialData.details.map(d => ({

                isNewProduct: !d.product, 

                productId: d.product?.id?.toString() || "",
                productName: d.productName || "",
                quantity: d.quantity,
                quotedPrice: d.quotedPrice,
                skuSuggestion: d.skuSuggestion || ""
            }))
        };
    }

    return {
        notes: "",
        details: [{ isNewProduct: false, productId: "", productName: "", quantity: 1, quotedPrice: 0, skuSuggestion: "" }]
    };
  }, [initialData]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  });



  useEffect(() => {
      form.reset(defaultValues);
  }, [initialData, defaultValues, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details"
  });

  const handleSubmit = (values: any) => {
    console.log("Validación exitosa, enviando payload...", values);
    

    const payload: QuotationPayload = {
      supplierId: supplierId,
      requestDate: new Date().toISOString().split('T')[0],


      status: initialData ? initialData.status : 'BORRADOR', 
      notes: values.notes,
      details: values.details.map((d: any) => ({
        productId: d.isNewProduct ? null : (d.productId ? Number(d.productId) : null),
        productName: d.productName,
        quantity: d.quantity,
        quotedPrice: d.quotedPrice,
        skuSuggestion: d.skuSuggestion
      }))
    };
    
    onSubmit(payload);
  };

  const onInvalid = (errors: any) => console.error("Errores de validación:", errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-6">
        
        {}
        <FormField
             control={form.control}
             name="notes"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Notas Generales</FormLabel>
                 <FormControl><Input {...field} placeholder="Detalles de entrega, vigencia, etc." /></FormControl>
               </FormItem>
             )}
        />

        <div className="border rounded-md p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between mb-4">
             <h3 className="font-semibold">Items de la Cotización</h3>
             <Button type="button" variant="outline" size="sm" onClick={() => append({ isNewProduct: false, productId: "", productName: "", quantity: 1, quotedPrice: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4"/> Agregar Item
             </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const isNew = form.watch(`details.${index}.isNewProduct`);
              
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                    
                    {}
                    <div className="col-span-12 md:col-span-2 flex items-center space-x-2 mb-2 md:mb-0">
                        <FormField
                            control={form.control}
                            name={`details.${index}.isNewProduct`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox 
                                            checked={field.value} 
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);

                                                form.setValue(`details.${index}.productId`, "");
                                                form.setValue(`details.${index}.productName`, ""); 
                                            }} 
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal text-xs cursor-pointer">
                                        ¿Producto Nuevo?
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>

                    {}
                    <div className="col-span-12 md:col-span-4">
                       {isNew ? (
                           <FormField
                             control={form.control}
                             name={`details.${index}.productName`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs">Nombre Sugerido</FormLabel>
                                 <FormControl><Input {...field} placeholder="Ej: Nuevo Modelo 2026" /></FormControl>
                                 <FormMessage className="text-xs" />
                               </FormItem>
                             )}
                           />
                       ) : (
                           <FormField
                             control={form.control}
                             name={`details.${index}.productId`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs">Producto Catálogo</FormLabel>
                                 <Select 
                                    onValueChange={(val) => {
                                        field.onChange(val);

                                        const p = products?.find(prod => prod.id.toString() === val);
                                        if (p) {
                                            form.setValue(`details.${index}.productName`, p.name);
                                        }
                                    }} 
                                    value={field.value}
                                 >
                                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {products?.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                 </Select>
                                 <FormMessage className="text-xs" />
                               </FormItem>
                             )}
                           />
                       )}
                    </div>

                    {}
                    <div className="col-span-6 md:col-span-2">
                        <FormField
                             control={form.control}
                             name={`details.${index}.quantity`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs">Cantidad</FormLabel>
                                 <Input type="number" {...field} />
                                 <FormMessage className="text-xs" />
                               </FormItem>
                             )}
                        />
                    </div>
                    {}
                    <div className="col-span-5 md:col-span-3">
                        <FormField
                             control={form.control}
                             name={`details.${index}.quotedPrice`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-xs">Precio Oferta ($)</FormLabel>
                                 <Input type="number" step="0.01" {...field} />
                                 <FormMessage className="text-xs" />
                               </FormItem>
                             )}
                        />
                    </div>

                    <div className="col-span-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                    </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4"/> 
                {isLoading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Guardar Borrador')}
            </Button>
        </div>
      </form>
    </Form>
  );
};