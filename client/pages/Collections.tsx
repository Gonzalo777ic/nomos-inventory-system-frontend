import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
    DollarSign, 
    AlertTriangle, 
    CheckCircle2, 
    Wallet, 
    Search,
    History,
    CalendarClock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";  

import { SaleService } from "@/api/services/saleService"; 
import { PaymentRegistrationForm } from "@/components/forms/PaymentRegistrationForm";
import { Sale } from "@/types/store";
import { Collection, SaleWithBalance } from "@/types/inventory/collections";

const Collections: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState<SaleWithBalance | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const { data: sales = [], isLoading, refetch } = useQuery<Sale[]>({
        queryKey: ['sales'],
        queryFn: SaleService.getAll 
    });

    const { processedSales, kpis } = useMemo(() => {
        let totalReceivable = 0;
        let totalOverdue = 0;
        let collectedThisMonth = 0;
        const currentMonth = new Date().getMonth();
        const today = new Date();

        today.setHours(0,0,0,0);

        const enrichedSales: SaleWithBalance[] = sales.map((sale: Sale) => {

            const paidAmount = (sale.collections || []).reduce((sum: number, c: Collection) => {

                return sum + c.amount;
            }, 0);

            const balance = sale.totalAmount - paidAmount;
            

            let dueDate: Date;
            if (sale.dueDate) {

                dueDate = new Date(sale.dueDate);
            } else {

                const saleDate = new Date(sale.saleDate);
                dueDate = new Date(saleDate);

                const daysToAdd = sale.paymentCondition === 'CREDITO' ? (sale.creditDays || 0) : 0;
                dueDate.setDate(saleDate.getDate() + daysToAdd);
            }

            dueDate.setHours(0,0,0,0);




            const isOverdue = balance > 0.01 && today > dueDate && sale.status !== 'CANCELADA';

            if (balance > 0.01 && sale.status !== 'CANCELADA') {
                totalReceivable += balance;
                if (isOverdue) totalOverdue += balance;
            }


            (sale.collections || []).forEach((c: Collection) => {
                if (new Date(c.collectionDate).getMonth() === currentMonth) {
                    collectedThisMonth += c.amount;
                }
            });

            return { 
                ...sale, 
                paidAmount, 
                balance, 
                isOverdue, 
                dueDateStr: dueDate.toLocaleDateString() 
            };
        });


        const filtered = enrichedSales.filter(s => {
            const hasDebt = s.balance > 0.01;

            if (s.status === 'CANCELADA' && !showHistory) return false;

            const passesHistoryFilter = showHistory || hasDebt;

            const matchesSearch = searchTerm === "" || 
                                  s.id.toString().includes(searchTerm) || 
                                  (s.clientId?.toString() || "").includes(searchTerm);
            
            return passesHistoryFilter && matchesSearch;
        });


        const sorted = filtered.sort((a, b) => b.balance - a.balance);

        return { 
            processedSales: sorted, 
            kpis: { totalReceivable, totalOverdue, collectedThisMonth } 
        };
    }, [sales, searchTerm, showHistory]);


    const handlePaymentSuccess = () => {
        setSelectedSale(null);
        refetch();
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando gestión de cobranzas...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Cobranzas</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Por Cobrar Total</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${kpis.totalReceivable.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Capital pendiente activo</p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Deuda Vencida</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${kpis.totalOverdue.toFixed(2)}</div>
                        <p className="text-xs text-red-600/80">Vencimiento expirado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${kpis.collectedThisMonth.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Flujo de caja mensual</p>
                    </CardContent>
                </Card>
            </div>

            {/* TABLA */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Cartera de Clientes</CardTitle>
                    
                    <div className="flex items-center gap-4">
                        {/* Toggle Historial */}
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-slate-50 dark:bg-slate-900">
                            <Switch 
                                id="history-mode" 
                                checked={showHistory}
                                onCheckedChange={setShowHistory}
                            />
                            <Label htmlFor="history-mode" className="text-sm cursor-pointer flex items-center gap-1 select-none">
                                <History className="w-3 h-3 text-muted-foreground"/>
                                {showHistory ? "Ocultar Pagados" : "Ver Todo (Incl. Cancelados)"}
                            </Label>
                        </div>

                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar ID venta o cliente..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Venta #</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedSales.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                        No hay registros encontrados.
                                    </TableCell>
                                </TableRow>
                            )}
                            {processedSales.map((sale: SaleWithBalance) => {
                                const percentage = sale.totalAmount > 0 
                                    ? (sale.paidAmount / sale.totalAmount) * 100 
                                    : 100;
                                
                                const isPaid = sale.balance <= 0.01;
                                const isCanceled = sale.status === 'CANCELADA';
                                
                                return (
                                    <TableRow key={sale.id} className={isPaid || isCanceled ? "bg-slate-50/50 dark:bg-slate-900/20 opacity-80" : ""}>
                                        <TableCell className="font-medium">#{sale.id}</TableCell>
                                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.clientId || 'Consumidor Final'}</TableCell>
                                        
                                        {/* Vencimiento */}
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                {(sale.paymentCondition === 'CREDITO') ? (
                                                     <CalendarClock className={`w-3 h-3 ${sale.isOverdue ? 'text-red-500' : 'text-blue-500'}`}/>
                                                ) : null}
                                                <span className={sale.isOverdue ? "text-red-600 font-bold" : ""}>
                                                    {sale.dueDate}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Barra de Progreso */}
                                        <TableCell className="w-[140px]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>${sale.paidAmount.toFixed(2)}</span>
                                                    <span>{percentage.toFixed(0)}%</span>
                                                </div>
                                                <Progress 
                                                    value={percentage} 
                                                    className={`h-2 ${isPaid ? "bg-green-100" : ""}`} 
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right text-muted-foreground">${sale.totalAmount.toFixed(2)}</TableCell>
                                        
                                        <TableCell className={`text-right font-bold ${!isPaid && !isCanceled ? 'text-red-600' : 'text-green-600'}`}>
                                            ${sale.balance.toFixed(2)}
                                        </TableCell>
                                        
                                        {/* Estado */}
                                        <TableCell className="text-center">
                                            {isCanceled ? (
                                                <Badge variant="secondary" className="bg-gray-200 text-gray-600">ANULADA</Badge>
                                            ) : isPaid ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">PAGADO</Badge>
                                            ) : sale.isOverdue ? (
                                                <Badge variant="destructive">VENCIDO</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">PENDIENTE</Badge>
                                            )}
                                        </TableCell>
                                        
                                        {/* Acciones */}
                                        <TableCell className="text-right">
                                            {!isPaid && !isCanceled ? (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-8 shadow-sm"
                                                    onClick={() => setSelectedSale(sale)}
                                                >
                                                    <DollarSign className="w-3 h-3 mr-1" /> Cobrar
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic mr-2">
                                                    {isCanceled ? '-' : 'Ok'}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Cobranza - Venta #{selectedSale?.id}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedSale && (
                        <PaymentRegistrationForm 
                            sale={selectedSale}
                            balance={selectedSale.balance}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => setSelectedSale(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Collections;