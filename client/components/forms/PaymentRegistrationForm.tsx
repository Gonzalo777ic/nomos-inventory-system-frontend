import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, DollarSign, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { PaymentMethodService } from "@/api/services/paymentMethodService";
import { CollectionService } from "@/api/services/collectionService";
import { CollectionPayload } from "@/types/inventory/collections";
import { Sale } from "@/types/index";


const formSchema = z.object({
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  paymentMethodId: z.string().min(1, "Selecciona un método de pago"),
  referenceNumber: z.string().optional(),
  collectionDate: z.date({ required_error: "La fecha es requerida" }),
});

interface Props {
  sale: Sale;
  balance: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentRegistrationForm: React.FC<Props> = ({ sale, balance, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();


  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: PaymentMethodService.getAll
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: balance,
      referenceNumber: "",
      collectionDate: new Date(),
    }
  });


  const createMutation = useMutation({
    mutationFn: CollectionService.create,
    onSuccess: () => {
      toast.success("Pago registrado correctamente");
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      onSuccess();
    },
    onError: () => toast.error("Error al registrar el pago")
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.amount > balance + 0.1) {
       form.setError("amount", { message: "El monto excede el saldo pendiente" });
       return;
    }

    const payload: CollectionPayload = {
        saleId: Number(sale.id),
        amount: values.amount,
        paymentMethodId: Number(values.paymentMethodId),
        referenceNumber: values.referenceNumber,
        collectionDate: values.collectionDate.toISOString()
    };
    
    createMutation.mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {}
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md flex justify-between items-center mb-2">
            <div>
                <p className="text-xs text-muted-foreground">Venta #{sale.id}</p>
                <p className="font-semibold text-sm">Cliente: {sale.clientId || 'Mostrador'}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
                <p className="text-xl font-bold text-red-600">${balance.toFixed(2)}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Monto a Pagar</FormLabel>
                <FormControl>
                    <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" step="0.01" className="pl-8" {...field} />
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="collectionDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Fecha de Pago</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                        {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {paymentMethods?.map((pm) => (
                        <SelectItem key={pm.id} value={pm.id.toString()}>
                            {pm.name} ({pm.type})
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Nro de operación, cheque, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Pago
            </Button>
        </div>
      </form>
    </Form>
  );
};