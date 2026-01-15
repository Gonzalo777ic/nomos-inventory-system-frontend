import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Building2, User } from "lucide-react";

import { LegalEntityService } from "@/api/services/legalEntityService";
import { LegalEntity } from "@/types/store";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  legalName: z.string().min(3, "El nombre o razón social es muy corto"),
  taxId: z.string().min(8, "El RUC/DNI debe tener al menos 8 caracteres"),
  type: z.enum(["NATURAL_PERSON", "LEGAL_ENTITY"] as const),
  address: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

interface LegalEntityFormProps {
  onSuccess: () => void;
  initialData?: LegalEntity | null; 
}

export const LegalEntityForm: React.FC<LegalEntityFormProps> = ({
  onSuccess,
  initialData,
}) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legalName: initialData?.legalName || "",
      taxId: initialData?.taxId || "",
      type: initialData?.type || "LEGAL_ENTITY",
      address: initialData?.address || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (initialData) {
      form.reset({
        legalName: initialData.legalName,
        taxId: initialData.taxId,
        type: initialData.type,
        address: initialData.address || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {



      const payload = data as Omit<LegalEntity, 'id'>;

      if (initialData) {

        await LegalEntityService.update(initialData.id, payload);
        toast({ title: "Entidad Actualizada", description: "Los datos se guardaron correctamente." });
      } else {

        await LegalEntityService.create(payload);
        toast({ title: "Entidad Registrada", description: `${data.legalName} ha sido creada.` });
      }
      onSuccess();
      if (!initialData) form.reset(); 
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data || "Ocurrió un error al guardar.";
      toast({
        title: "Error",
        description: typeof msg === 'string' ? msg : "Verifique los datos.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Entidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LEGAL_ENTITY">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Empresa (Jurídica)
                      </div>
                    </SelectItem>
                    <SelectItem value="NATURAL_PERSON">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Persona Natural
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUC / DNI (Fiscal)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="20123456789" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="legalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Razón Social / Nombre Completo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: MI EMPRESA S.A.C." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Fiscal</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Av. Principal 123, Lima..." rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="contacto@empresa.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (Opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+51 999..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {initialData ? "Guardar Cambios" : "Registrar Entidad"}
          </Button>
        </div>
      </form>
    </Form>
  );
};