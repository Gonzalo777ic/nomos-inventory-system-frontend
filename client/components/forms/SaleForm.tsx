import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sale,
  SalePayload,
  SaleService,
} from "../../api/services/saleService"; // Corregida ruta/extensión
import { useToast } from "../../hooks/use-toast"; // Corregida ruta/extensión
// 💡 IMPORTACIÓN CLAVE: Importar el hook real para obtener Clientes y Vendedores
import { useReferenceData } from "../../hooks/useReferenceData"; // Corregida ruta/extensión
// Importaciones de UI (Rutas simplificadas, asumiendo que son hermanos de este componente)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Plus, Loader2 } from "lucide-react";

// --------------------------------------------------

// Mantenemos esto aquí para Zod, pero sus valores se sincronizan con el backend
const SaleTypeEnum = z.enum(["BOLETA", "FACTURA", "TICKET"]); 
const SaleStatusEnum = z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA"]);

// 1. Schema de Zod
const formSchema = z.object({
  clientId: z.string().nullable().optional(), 
  type: SaleTypeEnum,
  status: SaleStatusEnum,
  sellerId: z.string().min(1, "El vendedor es requerido"), 
  saleDate: z.string().min(1, "La fecha de venta es requerida"), 
});

type SaleFormData = z.infer<typeof formSchema>;

interface SaleFormProps {
  initialData?: Sale;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

// Función para formatear fechas para input[type="datetime-local"]
const formatLocalDateTime = (isoString: string | undefined): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localIso = new Date(date.getTime() - offset).toISOString();
  return localIso.substring(0, 16); // "YYYY-MM-DDTHH:MM"
};

const SaleForm: React.FC<SaleFormProps> = ({
  initialData,
  onSuccess,
  trigger,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔑 CORRECCIÓN: Se desestructura 'saleTypes' del hook useReferenceData
  const { clients, sellers, saleTypes, loading: refLoading } = useReferenceData(); 

  const getInitialClientId = (): string => {
    if (initialData?.clientId) {
      return String(initialData.clientId);
    }
    return "NULL_CLIENT"; 
  };

  const defaultDate = formatLocalDateTime(new Date().toISOString());

  const form = useForm<SaleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: getInitialClientId(),
      // Usamos 'BOLETA' por defecto o el valor existente
      type: (initialData?.type as SaleFormData["type"]) || "BOLETA",
      status: (initialData?.status as SaleFormData["status"]) || "PENDIENTE",
      sellerId: String(initialData?.sellerId || (sellers.length > 0 ? sellers[0].id : 5)), 
      saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
    },
    mode: "onChange",
  });
  
  // Resetear el formulario cuando se abre/cierra el modal
  React.useEffect(() => {
      if (open) {
          form.reset({
              clientId: getInitialClientId(),
              type: (initialData?.type as SaleFormData["type"]) || "BOLETA",
              status: (initialData?.status as SaleFormData["status"]) || "PENDIENTE",
              sellerId: String(initialData?.sellerId || (sellers.length > 0 ? sellers[0].id : "")), 
              saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
          });
      }
  }, [open, initialData, sellers, saleTypes]); // Agregamos saleTypes como dependencia (opcional, pero buena práctica)


  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);

    const clientIdNum =
      data.clientId === "NULL_CLIENT" ? null : Number(data.clientId);
    const sellerIdNum = Number(data.sellerId);

    const totalAmountMock = initialData?.totalAmount || 0.0;
    const totalDiscountMock = initialData?.totalDiscount || 0.0;

    const salePayload: SalePayload = {
      clientId: clientIdNum,
      saleDate: new Date(data.saleDate).toISOString(),
      type: data.type,
      status: data.status,
      sellerId: sellerIdNum,
      totalAmount: totalAmountMock,
      totalDiscount: totalDiscountMock,
    };

    try {
      if (isEditing && initialData?.id) {
        const updatedSale = await SaleService.create(salePayload); 
        toast({
          title: "Actualizado",
          description: `Venta #${initialData.id} actualizada.`,
        });
      } else {
        const newSale = await SaleService.create(salePayload);
        toast({
          title: "Venta Creada",
          description: `Venta #${newSale.id} iniciada (Estado: ${newSale.status}).`,
        });
      }

      onSuccess();
      setOpen(false);
    } catch (e: any) {
      console.error("Error al guardar venta:", e);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la venta.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (refLoading) {
      return (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando Referencias...
          </Button>
      );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nueva Venta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Editar Venta #${initialData?.id}`
              : "Crear Nueva Venta"}
          </DialogTitle>
          <DialogDescription>
            Registre los detalles de la cabecera de la transacción.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            {/* Fecha de Venta */}
            <FormField
              control={form.control}
              name="saleDate" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de la Venta</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Vendedor (Seller) */}
              <FormField
                control={form.control}
                name="sellerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting || sellers.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione vendedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sellers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cliente (Client) */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente (Opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "NULL_CLIENT"} 
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NULL_CLIENT">
                          -- Cliente Mostrador (N/A) --
                        </SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Comprobante */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de comprobante</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting || saleTypes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* 💡 Iterando sobre los datos del backend */}
                        {saleTypes.map((st) => (
                            <SelectItem key={st.id} value={st.id}>
                                {st.name}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado (Solo editable por Admin/Sistema) */}
              {isEditing && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de la Venta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={true}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                          <SelectItem value="COMPLETADA">COMPLETADA</SelectItem>
                          <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || refLoading}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  "Guardar Cabecera"
                ) : (
                  "Iniciar Venta"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleForm;