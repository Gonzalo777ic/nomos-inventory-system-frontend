import React, { useMemo } from "react";
import { AccountsReceivable } from "@/types/store";
import { 
    User, AlertCircle, TrendingUp, Hash, 
    CreditCard, CalendarClock, Clock 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CreditContextPanelProps {
    ar: AccountsReceivable;
}

export const CreditContextPanel: React.FC<CreditContextPanelProps> = ({ ar }) => {
    
    const metrics = useMemo(() => {

        const formatDate = (dateInput: string | Date) => {
            if (!dateInput) return 'N/A';
            

            const d = typeof dateInput === 'string' 
                ? new Date(`${dateInput}T12:00:00`) 
                : dateInput;

            return d.toLocaleDateString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        };


        const paid = ar.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
        const balance = ar.totalAmount - paid;
        
        const now = new Date();
        const overdueInstallments = ar.installments.filter(i => {
            const dueDate = new Date(i.dueDate);

            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            return i.status !== 'PAID' && todayEnd > dueDate;
        });


        const firstDueDateRaw = ar.installments.length > 0 ? ar.installments[0].dueDate : null;
        const lastDueDateRaw = ar.installments.length > 0 ? ar.installments[ar.installments.length - 1].dueDate : null;


        let creditStartDateRaw: Date | null = null;
        if (firstDueDateRaw) {
            const [y, m, d] = firstDueDateRaw.toString().split('-').map(Number);

            creditStartDateRaw = new Date(y, m - 2, d);
        }


        const firstDueDate = firstDueDateRaw ? formatDate(firstDueDateRaw) : 'N/A';
        const lastDueDate = lastDueDateRaw ? formatDate(lastDueDateRaw) : 'N/A';
        const creditStartDate = creditStartDateRaw ? formatDate(creditStartDateRaw) : 'N/A';

        const totalPenalty = ar.installments.reduce((sum, i) => sum + (i.penaltyAmount || 0), 0);

        return {
            paid,
            balance,
            overdueCount: overdueInstallments.length,
            firstDueDate,
            lastDueDate,
            creditStartDate,
            totalPenalty,
            progress: (paid / ar.totalAmount) * 100
        };
    }, [ar]);

    return (
        <Card className="h-full border-l-4 border-l-slate-500 bg-slate-50/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Hash className="w-4 h-4"/> Resumen de la Obligación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 text-sm">
                
                {}
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-xs uppercase">
                        <CreditCard className="w-3 h-3"/> Origen Comercial
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 text-slate-600 pl-2">
                        <span className="text-muted-foreground">Venta N°:</span>
                        <span className="font-mono font-medium">#{ar.sale?.id}</span>
                        
                        <span className="text-muted-foreground">Fecha Emisión:</span>
                        <span>{new Date(ar.sale?.saleDate || "").toLocaleDateString('es-PE')}</span>
                        
                        <span className="text-muted-foreground">Cliente ID:</span>
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3"/> {ar.sale?.clientId || 'N/A'}
                        </span>
                    </div>
                </div>

                <Separator />

                {}
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-xs uppercase">
                        <TrendingUp className="w-3 h-3"/> Estado Financiero
                    </h4>
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Monto Original:</span>
                            <span className="font-medium">${ar.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-700">
                            <span>Pagado:</span>
                            <span>- ${metrics.paid.toFixed(2)}</span>
                        </div>
                        <Separator className="my-1"/>
                        <div className="flex justify-between font-bold text-lg text-slate-800">
                            <span>Saldo Capital:</span>
                            <span className="text-red-600">${metrics.balance.toFixed(2)}</span>
                        </div>
                        
                        {metrics.totalPenalty > 0 && (
                            <div className="flex justify-between text-xs text-orange-600 font-medium mt-1 bg-orange-50 p-1 rounded">
                                <span>+ Mora Referencial:</span>
                                <span>${metrics.totalPenalty.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {}
                <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 text-xs uppercase">
                        <CalendarClock className="w-3 h-3"/> Cronograma
                    </h4>
                    <div className="pl-2 space-y-1 text-slate-600">
                        <div className="flex justify-between">
                            <span>Cuotas Totales:</span>
                            <span className="font-medium">{ar.installments.length}</span>
                        </div>

                        {}
                        <div className="flex justify-between text-blue-700 bg-blue-50 px-1 -mx-1 rounded">
                            <span className="flex items-center gap-1 text-xs font-semibold">
                                <Clock className="w-3 h-3"/> Inicio Crédito:
                            </span>
                            <span className="font-bold font-mono text-xs">{metrics.creditStartDate}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Vencimiento Inicial:</span>
                            <span className="font-mono text-xs">{metrics.firstDueDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Vencimiento Final:</span>
                            <span className="font-medium text-slate-800 font-mono text-xs">{metrics.lastDueDate}</span>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Estado Actual:</span>
                            {metrics.overdueCount > 0 ? (
                                <Badge variant="destructive" className="flex items-center gap-1 h-5">
                                    <AlertCircle className="w-3 h-3"/> {metrics.overdueCount} Vencidas
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 h-5">
                                    Al Día
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {}
                <div className="bg-blue-50 text-blue-800 text-[10px] p-2 rounded flex gap-2 items-start leading-tight">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5"/>
                    <p>
                        Este panel muestra el estado actual de la deuda en sistema. 
                        Úselo para validar los montos antes de emitir un título valor.
                    </p>
                </div>

            </CardContent>
        </Card>
    );
};