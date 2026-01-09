import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleService } from "../../api/services/saleService";
import {
    Sale,
    SaleCreationDTO,
} from "../../types/store";
import { useToast } from "../../hooks/use-toast";
import { useReferenceData } from "../../hooks/useReferenceData";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "../ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";
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
import { Plus, Loader2, Ban } from "lucide-react";

import SaleDetailManager, { CartItemPayload } from "./SaleDetailManager";

// --- Enums & Schema ---

const SaleTypeEnum = z.enum(["BOLETA", "FACTURA", "TICKET"]);
const SaleStatusEnum = z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA", "EMITIDA"]);
const PaymentConditionEnum = z.enum(["CONTADO", "CREDITO"]);

const formSchema = z.object({
    clientId: z.string().nullable().optional(),
    type: SaleTypeEnum,
    paymentCondition: PaymentConditionEnum,
    creditDays: z.coerce.number().min(0).optional(),
    status: SaleStatusEnum,
    sellerId: z.string().min(1, "El vendedor es requerido"),
    saleDate: z.string().min(1, "La fecha de venta es requerida"),
}).refine((data) => {
    if (data.paymentCondition === "CREDITO") {
        return data.creditDays && data.creditDays > 0;
    }
    return true;
}, {
    message: "Debe especificar los días para ventas a crédito",
    path: ["creditDays"],
});

type SaleFormData = z.infer<typeof formSchema>;

interface SaleFormProps {
    initialData?: Sale;
    onSuccess: () => void;
    trigger?: React.ReactNode;
    readOnly?: boolean; 
}

// Helper para fecha
const formatLocalDateTime = (isoString: string | undefined): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localIso = new Date(date.getTime() - offset).toISOString();
    return localIso.substring(0, 16);
};

const SaleForm: React.FC<SaleFormProps> = ({
    initialData,
    onSuccess,
    trigger,
    readOnly = false,
}) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [cartDetails, setCartDetails] = useState<CartItemPayload[]>([]);
    
    // Referencias
    const { clients, sellers, saleTypes, loading: refLoading } = useReferenceData();
    
    // [CORRECCIÓN 1] Eliminado el hook useInventory que no tienes.

    const paymentConditions = [
        { id: "CONTADO", name: "Pago al Contado" },
        { id: "CREDITO", name: "Pago a Crédito" }
    ];

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
            type: (initialData?.type as any) || "BOLETA",
            paymentCondition: (initialData?.paymentCondition as any) || "CONTADO",
            creditDays: initialData?.creditDays || 0,
            status: (initialData?.status as any) || "PENDIENTE",
            sellerId: String(initialData?.sellerId || ""),
            saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
        },
        mode: "onChange",
    });

    const watchedPaymentCondition = form.watch("paymentCondition");

    // --- EFFECT: Cargar datos al abrir modal ---
    useEffect(() => {
        if (open) {
            // 1. HIDRATAR CARRITO (Modo Lectura)
            if (initialData && initialData.details && initialData.details.length > 0) {
                
                const mappedDetails: CartItemPayload[] = initialData.details.map((d, index) => {
                    // [CORRECCIÓN 2] Quitamos la búsqueda por nombre ya que no tenemos la lista de productos
                    // Si quisieras nombres reales, tendrías que usar ProductService.getAll() aquí.
                    
                    return {
                        // [CORRECCIÓN 3] tempKey ahora es number (usamos d.id o timestamp simulado)
                        tempKey: d.id ? d.id : (Date.now() + index),
                        
                        productId: d.productId,
                        // Fallback simple para el nombre
                        productName: `Producto #${d.productId}`, 
                        quantity: d.quantity,
                        unitPrice: d.unitPrice,
                        subtotal: d.subtotal,
                        taxRateId: d.taxRateId,
                        promotionId: d.promotionId
                    };
                });
                setCartDetails(mappedDetails);
            } else {
                // Modo Creación: Carrito vacío
                setCartDetails([]); 
            }

            // 2. RESETEAR FORMULARIO
            const initialSellerId = initialData?.sellerId
                ? String(initialData.sellerId)
                : (sellers.length > 0 ? String(sellers[0].id) : "");

            const initialType = (initialData?.type as any)
                || (saleTypes.length > 0 ? (saleTypes[0] as any).id : "BOLETA");

            if (!refLoading || initialData) {
                form.reset({
                    clientId: getInitialClientId(),
                    type: initialType,
                    paymentCondition: (initialData?.paymentCondition as any) || "CONTADO",
                    creditDays: initialData?.creditDays || 0,
                    status: (initialData?.status as any) || "PENDIENTE",
                    sellerId: initialSellerId,
                    saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
                });
            }
        }
    }, [open, initialData, sellers, saleTypes, refLoading, form]);

    const dialogTitle = readOnly
        ? `Detalle de Venta #${initialData?.id}`
        : "Crear Nueva Venta";

    // --- MANEJO DE ANULACIÓN ---
    const handleCancelSale = async () => {
        if (!initialData?.id) return;
        try {
            setIsSubmitting(true);
            await SaleService.cancelSale(initialData.id);
            toast({
                title: "Venta Anulada",
                description: `La venta #${initialData.id} ha sido marcada como cancelada.`,
            });
            setOpen(false);
            onSuccess(); 
        } catch (error: any) {
            console.error(error);
            const errorDetail = error.response?.data || error.message || "Error desconocido";
            toast({
                title: "Error al anular",
                description: typeof errorDetail === 'string' ? errorDetail : "No se pudo anular la venta.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- MANEJO DE CREACIÓN ---
    const onSubmit = async (data: SaleFormData) => {
        if (readOnly) return;

        setIsSubmitting(true);

        const clientIdNum = data.clientId === "NULL_CLIENT" ? null : Number(data.clientId);
        const sellerIdNum = Number(data.sellerId);

        const basePayload = {
            clientId: clientIdNum,
            saleDate: new Date(data.saleDate).toISOString(),
            type: data.type,
            paymentCondition: data.paymentCondition,
            creditDays: data.paymentCondition === "CREDITO" ? Number(data.creditDays) : 0,
            sellerId: sellerIdNum,
        };

        try {
            if (cartDetails.length === 0) {
                throw new Error("La venta debe contener al menos un producto.");
            }

            // Mapeamos explícitamente cada campo para cumplir con Omit<SaleDetailPayload...>
            const detailsPayload = cartDetails.map(detail => ({
                productId: detail.productId,
                unitPrice: detail.unitPrice,
                quantity: detail.quantity,
                subtotal: detail.subtotal,
                taxRateId: detail.taxRateId ?? 1, 
                promotionId: detail.promotionId ?? null
            }));

            const saleCreationPayload: SaleCreationDTO = {
                ...basePayload,
                details: detailsPayload,
            };

            const resultSale = await SaleService.createSaleWithDetails(saleCreationPayload);

            toast({
                title: "Venta Creada",
                description: `Venta #${resultSale.id} registrada exitosamente.`,
            });

            setOpen(false);
            onSuccess();

        } catch (e: any) {
            console.error("Error al guardar venta:", e);
            const errorDetail = e.response?.data || e.message || "Error desconocido";
            toast({
                title: "Error",
                description: typeof errorDetail === 'string' ? errorDetail : "Revise los datos.",
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
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {dialogTitle}
                        {readOnly && initialData?.status === 'CANCELADA' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200">
                                ANULADA
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {readOnly
                            ? "Visualización de datos. No es posible editar una venta finalizada."
                            : "Ingrese los datos de la nueva transacción."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4 py-4"
                    >
                        {/* PRIMERA FILA */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sellerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendedor</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={readOnly || isSubmitting || refLoading}
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

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Comprobante</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={readOnly || isSubmitting || refLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(saleTypes as any[]).map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* SEGUNDA FILA */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paymentCondition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Condición de Pago</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={readOnly || isSubmitting}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione condición" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentConditions.map((pc) => (
                                                    <SelectItem key={pc.id} value={pc.id}>
                                                        {pc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(watchedPaymentCondition === "CREDITO" || (readOnly && initialData?.creditDays && initialData.creditDays > 0)) && (
                                <FormField
                                    control={form.control}
                                    name="creditDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Días de Crédito</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Ej: 30"
                                                    disabled={readOnly || isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* TERCERA FILA */}
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente (Opcional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || "NULL_CLIENT"}
                                            disabled={readOnly || isSubmitting || refLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NULL_CLIENT">(Sin Cliente)</SelectItem>
                                                {(clients as any[]).map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name} ({c.documentNumber})
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
                                name="saleDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha y Hora</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                {...field}
                                                disabled={readOnly || isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* DETALLE DE PRODUCTOS */}
                        <div className={readOnly ? "opacity-80 pointer-events-none" : ""}>
                            <SaleDetailManager
                                details={cartDetails}
                                setDetails={setCartDetails}
                            />
                        </div>

                        <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full">
                            <Button variant="outline" onClick={() => setOpen(false)} type="button">
                                Cerrar
                            </Button>

                            {!readOnly ? (
                                // MODO CREACIÓN
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || cartDetails.length === 0}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    Crear Venta Completa
                                </Button>
                            ) : (
                                // MODO LECTURA
                                initialData?.status !== 'CANCELADA' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" type="button" disabled={isSubmitting}>
                                                <Ban className="mr-2 h-4 w-4" />
                                                Anular Venta
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Está seguro de anular esta venta?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción cambiará el estado a <strong>CANCELADA</strong>.
                                                    Esto no se puede deshacer y debería afectar el reporte de caja.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>No, mantener</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleCancelSale}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Sí, Anular Venta
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default SaleForm;