import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Eye, FileText, Banknote, MapPin, Scale, User, Calendar, LayoutDashboard } from "lucide-react";

import { CreditDocumentService } from "../../api/services/creditDocumentService";
import { CreditDocumentPayload, AccountsReceivable } from "../../types/store";
import { useToast } from "../../hooks/use-toast";
import { DocumentPreviewModal } from "../modals/DocumentPreviewModal";

import { CreditContextPanel } from "../panels/CreditContextPanel"; 

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";


const formSchema = z.object({
    accountsReceivableId: z.coerce.number(),
    type: z.enum(["PAGARE", "LETRA_CAMBIO"]),
    amount: z.coerce.number().min(0.01, "Monto requerido"),
    documentNumber: z.string().min(1, "Nro documento requerido"),
    issueDate: z.string().min(1, "Fecha emisión requerida"),
    dueDate: z.string().min(1, "Fecha vencimiento requerida"),
    
    debtorName: z.string().min(1, "Nombre deudor requerido"),
    debtorIdNumber: z.string().min(1, "DNI/RUC requerido"),
    
    guarantorName: z.string().optional(),
    
    placeOfIssue: z.string().min(1, "Lugar de emisión requerido"),
    placeOfPayment: z.string().min(1, "Lugar de pago requerido"),
    legalNotes: z.string().optional(),
});

interface CreditDocumentFormProps {
    onSuccess: () => void;
    initialData?: Partial<CreditDocumentPayload>; 
    contextData?: AccountsReceivable;
}

export const CreditDocumentForm: React.FC<CreditDocumentFormProps> = ({ onSuccess, initialData, contextData }) => {
    const { toast } = useToast();
    const [previewOpen, setPreviewOpen] = useState(false);
    

    const defaultBalance = useMemo(() => {
        if (!contextData) return 0;
        const paid = contextData.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
        return contextData.totalAmount - paid;
    }, [contextData]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountsReceivableId: initialData?.accountsReceivableId || 0,
            type: initialData?.type || "PAGARE",
            amount: initialData?.amount || defaultBalance || 0,
            documentNumber: "",
            debtorName: initialData?.debtorName || "", 
            debtorIdNumber: initialData?.debtorIdNumber || "",
            guarantorName: "",
            placeOfIssue: "Lima",
            placeOfPayment: "Lima",
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            legalNotes: ""
        }
    });

    const { isSubmitting } = form.formState;
    const watchedType = form.watch("type");
    const formData = form.watch();

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const payload: CreditDocumentPayload = {
                accountsReceivableId: data.accountsReceivableId,
                type: data.type,
                amount: data.amount,
                documentNumber: data.documentNumber,
                issueDate: data.issueDate,
                dueDate: data.dueDate,
                debtorName: data.debtorName,
                debtorIdNumber: data.debtorIdNumber,
                guarantorName: data.guarantorName,
                placeOfIssue: data.placeOfIssue,
                placeOfPayment: data.placeOfPayment,
                legalNotes: data.legalNotes
            };

            await CreditDocumentService.create(payload);
            toast({ title: "Documento Emitido", description: `Se ha generado el título ${data.documentNumber}.` });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo emitir el documento.", variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {}
            {contextData && (
                <div className="lg:w-[320px] shrink-0 border-r pr-6 border-slate-100 hidden lg:block">
                    <div className="sticky top-0">
                        <div className="mb-4 flex items-center gap-2 text-indigo-700 font-semibold bg-indigo-50 p-2 rounded">
                            <LayoutDashboard className="w-4 h-4"/> 
                            <span className="text-xs uppercase tracking-wide">Referencia Financiera</span>
                        </div>
                        {}
                        <CreditContextPanel ar={contextData} />
                    </div>
                </div>
            )}

            {}
            <div className="flex-1 overflow-y-auto pr-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="hidden">
                            <FormField control={form.control} name="accountsReceivableId" render={({ field }) => (
                                <FormItem><FormControl><Input {...field} type="number" /></FormControl></FormItem>
                            )} />
                        </div>

                        {}
                        {contextData && (
                            <div className="lg:hidden bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex justify-between items-center text-sm mb-4">
                                <div>
                                    <span className="text-muted-foreground text-xs font-bold uppercase">Venta Ref.</span> 
                                    <div className="font-medium">#{contextData.sale?.id}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-blue-600 text-xs font-bold uppercase">Saldo Actual</span>
                                    <div className="font-bold text-lg">${defaultBalance.toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-600 border-b pb-2">
                                    <FileText className="w-4 h-4"/> 1. Definición del Título
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="type" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PAGARE">Pagaré</SelectItem>
                                                    <SelectItem value="LETRA_CAMBIO">Letra de Cambio</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="documentNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nro. Folio</FormLabel>
                                            <FormControl><Input {...field} placeholder="0001" className="font-mono" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="issueDate" render={({ field }) => (
                                        <FormItem><FormLabel>Emisión</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                                        <FormItem><FormLabel>Vencimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-green-600 font-bold flex items-center gap-1"><Banknote className="w-4 h-4"/> Monto Título Valor</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 font-bold text-gray-500">$</span>
                                                <Input {...field} type="number" step="0.01" className="pl-7 font-bold text-lg" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm flex items-center gap-2 text-indigo-600 border-b pb-2">
                                    <Scale className="w-4 h-4"/> 2. Partes y Condiciones
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="debtorName" render={({ field }) => (
                                        <FormItem><FormLabel>Deudor (Nombre)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="debtorIdNumber" render={({ field }) => (
                                        <FormItem><FormLabel>DNI / RUC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>

                                {watchedType === 'LETRA_CAMBIO' && (
                                    <div className="bg-orange-50 p-3 rounded border border-orange-100">
                                        <FormField control={form.control} name="guarantorName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-orange-800 font-medium">Aval (Opcional)</FormLabel>
                                                <FormControl><Input {...field} placeholder="Nombre del aval" className="bg-white border-orange-200" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="placeOfIssue" render={({ field }) => (
                                        <FormItem><FormLabel>Lugar Emisión</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="placeOfPayment" render={({ field }) => (
                                        <FormItem><FormLabel>Lugar Pago</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <FormField control={form.control} name="legalNotes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cláusulas Adicionales</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Ej: Sin protesto..." className="min-h-[60px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex gap-4 pt-2">
                            <Button type="button" variant="outline" className="w-1/2 border-dashed border-2" onClick={() => setPreviewOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" /> Previsualizar
                            </Button>
                            <Button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Emitir Título Valor
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <DocumentPreviewModal 
                open={previewOpen} 
                onOpenChange={setPreviewOpen} 
                data={formData as Partial<CreditDocumentPayload>} 
            />
        </div>
    );
};