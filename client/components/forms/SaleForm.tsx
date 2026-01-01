import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sale,
    SaleCreationDTO, 
    SalePayload, 
    SaleService,

} from "../../api/services/saleService"; 
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

import SaleDetailManager, { CartItemPayload } from "./SaleDetailManager"; 


const SaleTypeEnum = z.enum(["BOLETA", "FACTURA", "TICKET"]);
const SaleStatusEnum = z.enum(["PENDIENTE", "COMPLETADA", "CANCELADA"]);

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
}) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const isEditing = !!initialData;
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [cartDetails, setCartDetails] = useState<CartItemPayload[]>([]); 

    const [currentSaleId, setCurrentSaleId] = useState<number | null>(
        initialData?.id || null
    );
    
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
            type: (initialData?.type as SaleFormData["type"]) || "BOLETA", 
            status: (initialData?.status as SaleFormData["status"]) || "PENDIENTE",
            sellerId: String(initialData?.sellerId || ""),
            saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
        },
        mode: "onChange",
    });
    
    useEffect(() => {
        if (open) {
            setCurrentSaleId(initialData?.id || null);
            setCartDetails([]); 

            const initialSellerId = initialData?.sellerId 
                ? String(initialData.sellerId) 
                : (sellers.length > 0 ? String(sellers[0].id) : "");

            const initialType = (initialData?.type as SaleFormData["type"]) 
                || (saleTypes.length > 0 ? (saleTypes[0] as any).id : "BOLETA");

            if (!refLoading || isEditing) {
                form.reset({
                    clientId: getInitialClientId(),
                    type: initialType,
                    status: (initialData?.status as SaleFormData["status"]) || "PENDIENTE",
                    sellerId: initialSellerId,
                    saleDate: formatLocalDateTime(initialData?.saleDate) || defaultDate,
                });
            }
        }

    }, [open, initialData, sellers, saleTypes, refLoading, form]); 

    const dialogTitle = isEditing
        ? `Editar Venta #${initialData?.id}`
        : "Crear Nueva Venta";

    const onSubmit = async (data: SaleFormData) => {
        setIsSubmitting(true);

        const clientIdNum = data.clientId === "NULL_CLIENT" ? null : Number(data.clientId);
        const sellerIdNum = Number(data.sellerId);
        
        const basePayload: SalePayload = {
            clientId: clientIdNum,
            saleDate: new Date(data.saleDate).toISOString(),
            type: data.type,
            sellerId: sellerIdNum,
        };
        
        console.log("[SalePayload] Cabecera Formateada:", basePayload);

        try {
            let resultSale: Sale;
            
            if (isEditing && initialData?.id) {

                resultSale = { ...initialData, ...basePayload, id: initialData.id }; 
                toast({
                    title: "Cabecera Actualizada",
                    description: `Cabecera de Venta #${initialData.id} actualizada.`,
                });
                
            } else {


                if (cartDetails.length === 0) {
                     throw new Error("La venta debe contener al menos un producto en el carrito.");
                }


                const detailsPayload = cartDetails.map(detail => {
                    const { tempId, tempKey, ...cleanDetail } = detail;
                    


                    return {
                        ...cleanDetail,
                        taxRateId: cleanDetail.taxRateId ?? null, 
                        promotionId: cleanDetail.promotionId ?? null,
                    };
                }) as Omit<CartItemPayload, 'tempKey'>[];
                
                console.log("[Details Payload] Detalles del Carrito (limpios y nulificados):", detailsPayload);


                const saleCreationPayload: SaleCreationDTO = {
                    ...basePayload,
                    details: detailsPayload,
                };
                
                console.log("[Final DTO]  Enviando al Backend:", saleCreationPayload);
                

                resultSale = await SaleService.createSaleWithDetails(saleCreationPayload) as Sale;
                
                toast({
                    title: "Venta Completa Creada",
                    description: `Venta #${resultSale.id} creada exitosamente.`,
                });
            }
            
            setOpen(false);
            onSuccess();
            
        } catch (e: any) {
            console.error("Error al guardar venta:", e);
            const errorDetail = e.response?.data?.message || e.message || "Ocurrió un error desconocido.";
            
            if (e.response && e.response.status === 400) {
                console.error(" ERROR 400: Payload incorrecto. La causa más probable es que el Tax Rate ID (ID de Impuesto) no sea válido o sea nulo, y el backend lo requiere. Verifica la validación en el SaleController.java.");
            }
            
            toast({
                title: "Error al procesar la Venta",
                description: errorDetail,
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
            <DialogContent className="sm:max-w-[850px]">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                         {isEditing
                            ? "Edite los detalles de la cabecera."
                            : "Registre la cabecera y los detalles de la nueva transacción."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4 py-4"
                    >
                        {}
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            {}
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
                                                    <SelectValue placeholder={refLoading ? "Cargando..." : "Seleccione vendedor"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {!refLoading && sellers.length === 0 && (
                                                    <SelectItem value="" disabled>No hay vendedores disponibles</SelectItem>
                                                )}
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

                            {}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de comprobante</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isSubmitting || refLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={refLoading ? "Cargando..." : "Seleccione tipo"} />
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
                            
                            {}
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente (Opcional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || "NULL_CLIENT"}
                                            disabled={isSubmitting || refLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={refLoading ? "Cargando..." : "Seleccione cliente"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NULL_CLIENT">
                                                    (Sin Cliente)
                                                </SelectItem>
                                                {}
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

                            {}
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
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        {}
                        {!isEditing && (
                            <SaleDetailManager 
                                details={cartDetails}
                                setDetails={setCartDetails}
                            />
                        )}

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} type="button">
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || (!isEditing && cartDetails.length === 0)}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {isEditing ? "Guardar Cambios" : "Crear Venta Completa"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default SaleForm;