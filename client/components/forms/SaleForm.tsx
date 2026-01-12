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
    FormDescription
} from "../ui/form";
import { Plus, Loader2, Ban, CalendarClock, CreditCard } from "lucide-react";

import SaleDetailManager, { CartItemPayload } from "./SaleDetailManager";



const SaleTypeEnum = z.enum(["BOLETA", "FACTURA", "TICKET"]);
const SaleStatusEnum = z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA", "EMITIDA"]);
const PaymentConditionEnum = z.enum(["CONTADO", "CREDITO"]);

const formSchema = z.object({
    clientId: z.string().nullable().optional(),
    type: SaleTypeEnum,
    paymentCondition: PaymentConditionEnum,
    

    numberOfInstallments: z.coerce.number().min(1).optional(),
    

    creditStartDate: z.string().optional(),
    
    status: SaleStatusEnum,
    sellerId: z.string().min(1, "El vendedor es requerido"),
    saleDate: z.string().min(1, "La fecha de venta es requerida"),
}).refine((data) => {

    if (data.paymentCondition === "CREDITO") {
        return data.numberOfInstallments && data.numberOfInstallments > 0;
    }
    return true;
}, {
    message: "Indique el número de cuotas",
    path: ["numberOfInstallments"],
});

type SaleFormData = z.infer<typeof formSchema>;

interface SaleFormProps {
    initialData?: Sale;
    onSuccess: () => void;
    trigger?: React.ReactNode;
    readOnly?: boolean; 
}


const formatLocalDateTime = (isoString: string | undefined): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localIso = new Date(date.getTime() - offset).toISOString();
    return localIso.substring(0, 16);
};


const formatDateSimple = (isoString: string | undefined): string => {
    if (!isoString) return new Date().toISOString().split('T')[0];
    return isoString.split('T')[0];
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
    
    const { clients, sellers, saleTypes, loading: refLoading } = useReferenceData();

    const paymentConditions = [
        { id: "CONTADO", name: "Pago al Contado" },
        { id: "CREDITO", name: "Crédito Comercial" }
    ];

    const getInitialClientId = (): string => {
        if (initialData?.clientId) {
            return String(initialData.clientId);
        }
        return "NULL_CLIENT";
    };

    const defaultDate = formatLocalDateTime(new Date().toISOString());



    const initialInstallments = initialData?.creditDays 
        ? Math.round(initialData.creditDays / 30) 
        : 1;

    const form = useForm<SaleFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientId: getInitialClientId(),
            type: (initialData?.type as any) || "BOLETA",
            paymentCondition: (initialData?.paymentCondition as any) || "CONTADO",
            

            numberOfInstallments: initialInstallments,
            creditStartDate: formatDateSimple(initialData?.saleDate),
            
            status: (initialData?.status as any) || "PENDIENTE",
            sellerId: String(initialData?.sellerId || ""),
            saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
        },
        mode: "onChange",
    });

    const watchedPaymentCondition = form.watch("paymentCondition");
    const watchedSaleDate = form.watch("saleDate");


    useEffect(() => {
        if (!readOnly && watchedSaleDate && !form.getValues("creditStartDate")) {
            form.setValue("creditStartDate", watchedSaleDate.split('T')[0]);
        }
    }, [watchedSaleDate, readOnly, form]);

    useEffect(() => {
        if (open) {
            setCartDetails([]); 


            if (initialData && initialData.details && initialData.details.length > 0) {
                const mappedDetails: CartItemPayload[] = initialData.details.map((d, index) => ({
                    tempKey: d.id ? d.id : (Date.now() + index),
                    productId: d.productId,
                    productName: `Producto #${d.productId}`, 
                    quantity: d.quantity,
                    unitPrice: d.unitPrice,
                    subtotal: d.subtotal,
                    taxRateId: d.taxRateId,
                    promotionId: d.promotionId
                }));
                setCartDetails(mappedDetails);
            }

            const initialSellerId = initialData?.sellerId
                ? String(initialData.sellerId)
                : (sellers.length > 0 ? String(sellers[0].id) : "");

            const initialType = (initialData?.type as any)
                || (saleTypes.length > 0 ? (saleTypes[0] as any).id : "BOLETA");


            const calcInstallments = initialData?.creditDays ? Math.round(initialData.creditDays / 30) : 1;

            if (!refLoading || initialData) {
                form.reset({
                    clientId: getInitialClientId(),
                    type: initialType,
                    paymentCondition: (initialData?.paymentCondition as any) || "CONTADO",
                    numberOfInstallments: calcInstallments,
                    creditStartDate: formatDateSimple(initialData?.saleDate),
                    status: (initialData?.status as any) || "PENDIENTE",
                    sellerId: initialSellerId,
                    saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
                });
            }
        }
    }, [open, initialData, sellers, saleTypes, refLoading, form]);

    const dialogTitle = readOnly
        ? `Detalle de Venta #${initialData?.id}`
        : "Nueva Venta Comercial";

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

    const onSubmit = async (data: SaleFormData) => {
        if (readOnly) return;

        setIsSubmitting(true);

        const clientIdNum = data.clientId === "NULL_CLIENT" ? null : Number(data.clientId);
        const sellerIdNum = Number(data.sellerId);




        const calculatedCreditDays = data.paymentCondition === "CREDITO" 
            ? (Number(data.numberOfInstallments) * 30) 
            : 0;

        const basePayload = {
            clientId: clientIdNum,
            saleDate: new Date(data.saleDate).toISOString(),
            type: data.type,
            paymentCondition: data.paymentCondition,
            

            creditDays: calculatedCreditDays, 
            
            sellerId: sellerIdNum,
            

            numberOfInstallments: data.paymentCondition === 'CREDITO' ? Number(data.numberOfInstallments) : 1
        };

        try {
            if (cartDetails.length === 0) {
                throw new Error("La venta debe contener al menos un producto.");
            }

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
                title: "Venta Registrada",
                description: `Venta #${resultSale.id} creada. ${data.paymentCondition === 'CREDITO' ? 'Se generó el cronograma de pagos.' : 'Pago al contado.'}`,
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
            <DialogContent className="sm:max-w-[950px]">
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
                            ? "Visualización de datos históricos."
                            : "Registre la transacción comercial y sus términos."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                        
                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <FormField
                                control={form.control}
                                name="sellerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendedor</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={readOnly || isSubmitting || refLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione vendedor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {sellers.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || "NULL_CLIENT"} disabled={readOnly || isSubmitting || refLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NULL_CLIENT">(Consumidor Final)</SelectItem>
                                                {(clients as any[]).map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.documentNumber})</SelectItem>
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
                                        <Select onValueChange={field.onChange} value={field.value} disabled={readOnly || isSubmitting || refLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(saleTypes as any[]).map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                                        <FormLabel>Fecha de Emisión</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} disabled={readOnly || isSubmitting} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {}
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <CreditCard className="w-4 h-4"/> Términos Financieros
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="paymentCondition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Condición de Pago</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={readOnly || isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione condición" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {paymentConditions.map((pc) => (
                                                        <SelectItem key={pc.id} value={pc.id}>{pc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {}
                                {watchedPaymentCondition === "CREDITO" && (
                                    <div className="grid grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md animate-in fade-in slide-in-from-top-1">
                                        
                                        <FormField
                                            control={form.control}
                                            name="numberOfInstallments"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-blue-700 dark:text-blue-300">Cuotas Mensuales</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                type="number" 
                                                                min={1} 
                                                                {...field} 
                                                                placeholder="Ej: 3"
                                                                className="pr-12"
                                                                disabled={readOnly || isSubmitting}
                                                            />
                                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">meses</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="creditStartDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-blue-700 dark:text-blue-300">Inicio del Crédito</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                type="date" 
                                                                {...field}
                                                                disabled={readOnly || isSubmitting}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription className="text-[10px]">
                                                        Primer vencimiento: +30 días
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {}
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
                                <Button type="submit" disabled={isSubmitting || cartDetails.length === 0}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {watchedPaymentCondition === 'CREDITO' ? 'Generar Venta a Crédito' : 'Cobrar al Contado'}
                                </Button>
                            ) : (
                                initialData?.status !== 'CANCELADA' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" type="button" disabled={isSubmitting}>
                                                <Ban className="mr-2 h-4 w-4" /> Anular Venta
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Anular venta #{initialData?.id}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se cancelará la deuda y se anularán los pagos asociados.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Volver</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancelSale} className="bg-red-600 hover:bg-red-700">
                                                    Sí, Anular
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