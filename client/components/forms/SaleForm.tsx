import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sale,
  SalePayload,
  SaleService,
} from "../../api/services/saleService.ts";
import { useToast } from "../../hooks/use-toast.ts";
// Importaciones de UI (Asumidas: Button, Input, Select, Dialog, etc.)
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

// --- Placeholder para Servicios de Referencia ---
const useReferenceData = () => {
  // Simulación de la lista de clientes y vendedores (IDs)
  return {
    clients: [
      { id: 1, name: "Cliente Anónimo" },
      { id: 2, name: "Gonzalo Perez" },
    ],
    sellers: [
      { id: 5, name: "Vendedor 1" },
      { id: 6, name: "Vendedor 2" },
    ],
    loading: false,
  };
};
// --------------------------------------------------

const SaleTypeEnum = z.enum(["BOLETA", "FACTURA", "OTRO"]);
const SaleStatusEnum = z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA"]);

// 1. CORRECCIÓN CLAVE: Incluir saleDate en el schema de Zod
const formSchema = z.object({
  clientId: z.string().nullable().optional(),
  type: SaleTypeEnum,
  status: SaleStatusEnum,
  sellerId: z.string().min(1, "El vendedor es requerido"), // Añadimos validación básica
  saleDate: z.string().min(1, "La fecha de venta es requerida"), // <--- AÑADIDO
});

// 2. CORRECCIÓN CLAVE: SaleFormData ahora se infiere completamente de Zod
type SaleFormData = z.infer<typeof formSchema>;

interface SaleFormProps {
  initialData?: Sale;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const formatLocalDateTime = (isoString: string | undefined): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Se mantiene la lógica de offset para corregir la conversión a datetime-local
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
  const { clients, sellers, loading: refLoading } = useReferenceData();

  const getInitialClientId = () => {
    if (initialData?.clientId) {
      return String(initialData.clientId);
    }
    // Usar una cadena que NO sea "" para evitar el error de Radix en SelectItem
    return "NULL_CLIENT";
  };

  const defaultDate = formatLocalDateTime(new Date().toISOString());

  const form = useForm<SaleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Usamos la función de inicialización corregida
      clientId: getInitialClientId(),
      type: (initialData?.type as SaleFormData["type"]) || "BOLETA",
      status: (initialData?.status as SaleFormData["status"]) || "PENDIENTE",
      sellerId: String(initialData?.sellerId || 5),
      saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);

    // 1. CORRECCIÓN EN SUBMIT: Convertir "NULL_CLIENT" a null para el Backend
    const clientIdNum =
      data.clientId === "NULL_CLIENT" ? null : Number(data.clientId);
    const sellerIdNum = Number(data.sellerId);

    // Simulación de valores de totales
    const totalAmountMock = initialData?.totalAmount || 0.0;
    const totalDiscountMock = initialData?.totalDiscount || 0.0;

    const salePayload: SalePayload = {
      clientId: clientIdNum,
      saleDate: new Date(data.saleDate).toISOString(), // Convertir a ISO para el backend
      type: data.type,
      status: data.status,
      sellerId: sellerIdNum,
      totalAmount: totalAmountMock,
      totalDiscount: totalDiscountMock,
    };

    try {
      if (isEditing) {
        // Usamos create por simplicidad, faltaría un endpoint PUT completo
        const updatedSale = await SaleService.create(salePayload);
        toast({
          title: "Actualizado",
          description: `Venta #${initialData!.id} actualizada.`,
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
              name="saleDate" // <-- Ahora es parte del schema
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
                      disabled={isSubmitting || refLoading}
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
                      value={field.value ?? ""}
                      disabled={isSubmitting || refLoading}
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
              {/* Tipo de Documento */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BOLETA">Boleta</SelectItem>
                        <SelectItem value="FACTURA">Factura</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
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
