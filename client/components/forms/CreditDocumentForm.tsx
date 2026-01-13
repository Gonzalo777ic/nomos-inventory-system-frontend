import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Building2, User, FileText, Banknote, CalendarDays } from "lucide-react";

import { CreditDocumentService } from "../../api/services/creditDocumentService";
import { CreditDocumentPayload, AccountsReceivable } from "../../types/store";
import { useToast } from "../../hooks/use-toast";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";


const formSchema = z.object({
    accountsReceivableId: z.coerce.number(),
    type: z.enum(["PAGARE", "LETRA_CAMBIO"]),
    amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
    documentNumber: z.string().min(1, "El número de documento es obligatorio"),
    issueDate: z.string().min(1, "Fecha de emisión requerida"),
    dueDate: z.string().min(1, "Fecha de vencimiento requerida"),
    debtorName: z.string().min(1, "Nombre del deudor requerido"),
    debtorIdNumber: z.string().min(1, "DNI/RUC del deudor requerido"),
    legalNotes: z.string().optional(),
});

interface CreditDocumentFormProps {
    onSuccess: () => void;

    initialData?: Partial<CreditDocumentPayload>; 

    contextData?: AccountsReceivable;
}

export const CreditDocumentForm: React.FC<CreditDocumentFormProps> = ({ onSuccess, initialData, contextData }) => {
    const { toast } = useToast();
    

    const contextMetrics = useMemo(() => {
        if (!contextData) return null;
        
        const paid = contextData.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
        const balance = contextData.totalAmount - paid;
        

        const totalPenalty = contextData.installments.reduce((sum, i) => sum + (i.penaltyAmount || 0), 0);
        

        const overdueCount = contextData.installments.filter(i => {
            const dueDate = new Date(i.dueDate);
            const now = new Date();

            return i.status !== 'PAID' && now > dueDate;
        }).length;

        return {
            saleId: contextData.sale?.id,
            clientId: contextData.sale?.clientId,
            totalAmount: contextData.totalAmount,
            balance,
            totalPenalty,
            overdueCount
        };
    }, [contextData]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountsReceivableId: initialData?.accountsReceivableId || 0,
            type: initialData?.type || "PAGARE",
            amount: initialData?.amount || 0,
            documentNumber: "",
            debtorName: initialData?.debtorName || "",
            debtorIdNumber: initialData?.debtorIdNumber || "",
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            legalNotes: ""
        }
    });

    const { isSubmitting } = form.formState;
    const watchedType = form.watch("type");

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const payload: CreditDocumentPayload = {
                accountsReceivableId: data.accountsReceivableId,
                type: data.type as 'PAGARE' | 'LETRA_CAMBIO',
                amount: data.amount,
                documentNumber: data.documentNumber,
                issueDate: data.issueDate,
                dueDate: data.dueDate,
                debtorName: data.debtorName,
                debtorIdNumber: data.debtorIdNumber,
                legalNotes: data.legalNotes
            };

            await CreditDocumentService.create(payload);
            
            toast({
                title: "Documento Creado",
                description: `Se ha generado el ${data.type} ${data.documentNumber} correctamente.`,
            });
            
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo crear el documento legal.",
                variant: "destructive"
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {}
                <div className="hidden">
                    <FormField control={form.control} name="accountsReceivableId" render={({ field }) => (
                        <FormItem><FormControl><Input {...field} type="number" /></FormControl></FormItem>
                    )} />
                </div>

                {}
                {contextMetrics && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Crédito Asociado (Respaldo)
                            </h3>
                            <Badge variant="outline" className="bg-white">Ref: Venta #{contextMetrics.saleId}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground text-xs">Cliente ID</div>
                                <div className="font-medium">{contextMetrics.clientId || 'Consumidor Final'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Saldo Pendiente</div>
                                <div className="font-bold text-red-600">${contextMetrics.balance.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Mora Acumulada</div>
                                <div className="font-medium text-slate-700">${contextMetrics.totalPenalty.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-xs">Estado</div>
                                <div className="font-medium">
                                    {contextMetrics.overdueCount > 0 
                                        ? <span className="text-red-500">{contextMetrics.overdueCount} cuotas vencidas</span> 
                                        : <span className="text-green-600">Al día</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 gap-6">
                    {}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-600">
                            1. Definición del Título Valor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Título</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="PAGARE">Pagaré</SelectItem>
                                            <SelectItem value="LETRA_CAMBIO">Letra de Cambio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <FormField control={form.control} name="documentNumber" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Número de Folio / Serie</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={watchedType === 'PAGARE' ? "Ej: PG-2026-001" : "Ej: LC-2026-001"} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="issueDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha Emisión</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dueDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha Vencimiento</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-600">
                            2. Partes Legales (Intervinientes)
                        </h3>
                        <div className="p-3 border rounded bg-slate-50 grid gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="debtorName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1"><User className="w-3 h-3"/> Deudor / Girado (Firmante)</FormLabel>
                                        <FormControl><Input {...field} className="bg-white" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="debtorIdNumber" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DNI / RUC Deudor</FormLabel>
                                        <FormControl><Input {...field} className="bg-white" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            
                            {}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t mt-2">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Building2 className="w-3 h-3"/> Acreedor / Beneficiario
                                    </span>
                                    <div className="text-sm font-semibold text-slate-700 mt-1 pl-4">MI EMPRESA S.A.C.</div>
                                </div>
                                {}
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-600">
                            3. Condiciones Económicas
                        </h3>
                        
                        <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <FormField control={form.control} name="amount" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1 text-indigo-900 font-bold">
                                        <Banknote className="w-4 h-4"/> Monto del Título Valor
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-indigo-700 font-bold">$</span>
                                            <Input {...field} type="number" step="0.01" className="pl-7 text-lg font-bold text-indigo-700 bg-white border-indigo-200" />
                                        </div>
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        * Este es el monto que será legalmente exigible.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="legalNotes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cláusulas Adicionales / Lugar de Pago</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Ej: Pagadero en la ciudad de Lima. Sin protesto." className="min-h-[80px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base shadow-lg" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Emitir Documento Legal
                    </Button>
                </div>
            </form>
        </Form>
    );
};