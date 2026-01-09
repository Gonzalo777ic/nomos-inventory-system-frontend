import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
    DollarSign, 
    AlertTriangle, 
    CheckCircle2, 
    Wallet, 
    Search,
    Filter,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Opcional para UX

import { SaleService } from "@/api/services/saleService"; 
import { PaymentRegistrationForm } from "@/components/forms/PaymentRegistrationForm";
import { Sale } from "@/types/store"; // Ajusta la ruta a donde tengas tu interfaz Sale
import { Collection, SaleWithBalance } from "@/types/inventory/collections";

const Collections: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState<SaleWithBalance | null>(null);
    
    // Estado para controlar historial (Pagados vs Pendientes)
    const [showHistory, setShowHistory] = useState(false);

    const { data: sales = [], isLoading } = useQuery<Sale[]>({
        queryKey: ['sales'],
        queryFn: SaleService.getAll 
    });

    const { processedSales, kpis } = useMemo(() => {
        let totalReceivable = 0;
        let totalOverdue = 0;
        let collectedThisMonth = 0;
        const currentMonth = new Date().getMonth();
        const today = new Date();

        const enrichedSales: SaleWithBalance[] = sales.map((sale: Sale) => {
            const paidAmount = (sale.collections || []).reduce((sum: number, c: Collection) => sum + c.amount, 0);
            const balance = sale.totalAmount - paidAmount;
            
            // --- LÓGICA DE VENCIMIENTO DINÁMICA ---
            const saleDate = new Date(sale.saleDate);
            const dueDate = new Date(saleDate);
            
            // ✅ USAMOS EL VALOR DEL BACKEND (creditDays)
            // Si es null o undefined, asumimos 0 (Contado)
            const daysToCredit = sale.creditDays || 0;
            dueDate.setDate(saleDate.getDate() + daysToCredit);
            
            // Es vencido si hay deuda Y hoy es mayor que la fecha límite
            const isOverdue = balance > 0.01 && today > dueDate;

            if (balance > 0.01) {
                totalReceivable += balance;
                if (isOverdue) totalOverdue += balance;
            }

            (sale.collections || []).forEach((c: Collection) => {
                if (new Date(c.collectionDate).getMonth() === currentMonth) {
                    collectedThisMonth += c.amount;
                }
            });

            // Agregamos dueDate al objeto para mostrarlo en la tabla si queremos
            return { ...sale, paidAmount, balance, isOverdue, dueDateStr: dueDate.toLocaleDateString() };
        });

        // --- FILTRADO ---
        const filtered = enrichedSales.filter(s => {
            const hasDebt = s.balance > 0.01;
            
            // Si showHistory es false, ocultamos los pagados (balance 0)
            const passesHistoryFilter = showHistory || hasDebt;

            const matchesSearch = searchTerm === "" || 
                                  s.id.toString().includes(searchTerm) || 
                                  (s.clientId?.toString() || "").includes(searchTerm);
            
            return passesHistoryFilter && matchesSearch;
        });

        // Ordenamos: Primero los que deben (Vencidos arriba), luego los pagados al final
        const sorted = filtered.sort((a, b) => b.balance - a.balance);

        return { 
            processedSales: sorted, 
            kpis: { totalReceivable, totalOverdue, collectedThisMonth } 
        };
    }, [sales, searchTerm, showHistory]);

    if (isLoading) return <div className="p-8 text-center">Cargando gestión de cobranzas...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Cobranzas</h1>
            </div>

            {/* --- KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Por Cobrar Total</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${kpis.totalReceivable.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Capital pendiente actual</p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Deuda Vencida</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${kpis.totalOverdue.toFixed(2)}</div>
                        <p className="text-xs text-red-600/80">Requiere gestión inmediata</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${kpis.collectedThisMonth.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Ingresos registrados</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- CONTROLES Y TABLA --- */}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Cartera de Clientes</CardTitle>
                    
                    <div className="flex items-center gap-4">
                        {/* TOGGLE HISTORIAL */}
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-slate-50 dark:bg-slate-900">
                            <Switch 
                                id="history-mode" 
                                checked={showHistory}
                                onCheckedChange={setShowHistory}
                            />
                            <Label htmlFor="history-mode" className="text-sm cursor-pointer flex items-center gap-1 select-none">
                                <History className="w-3 h-3 text-muted-foreground"/>
                                {showHistory ? "Ocultar Pagados" : "Ver Historial Completo"}
                            </Label>
                        </div>

                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar venta o cliente..." 
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
                                <TableHead>Fecha Venta</TableHead>
                                <TableHead>Cliente ID</TableHead>
                                <TableHead>Vencimiento</TableHead> {/* Columna útil */}
                                <TableHead>Progreso Pago</TableHead>
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
                                        No hay registros que coincidan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {processedSales.map((sale: any) => {
                                const percentage = (sale.paidAmount / sale.totalAmount) * 100;
                                const isPaid = sale.balance <= 0.01;
                                
                                return (
                                    <TableRow key={sale.id} className={isPaid ? "bg-slate-50/50 dark:bg-slate-900/20" : ""}>
                                        <TableCell className="font-medium">#{sale.id}</TableCell>
                                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.clientId || 'Anónimo'}</TableCell>
                                        
                                        {/* Columna Vencimiento con Icono si hay crédito */}
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs">
                                                {sale.creditDays > 0 && <CalendarClock className="w-3 h-3 text-blue-500"/>}
                                                <span>{sale.dueDateStr}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="w-[150px]">
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
                                        
                                        <TableCell className={`text-right font-bold ${!isPaid ? 'text-red-600' : 'text-green-600'}`}>
                                            ${sale.balance.toFixed(2)}
                                        </TableCell>
                                        
                                        <TableCell className="text-center">
                                            {isPaid ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">PAGADO</Badge>
                                            ) : sale.isOverdue ? (
                                                <Badge variant="destructive">VENCIDO</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">PENDIENTE</Badge>
                                            )}
                                        </TableCell>
                                        
                                        <TableCell className="text-right">
                                            {!isPaid ? (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-8 shadow-sm"
                                                    onClick={() => setSelectedSale(sale)}
                                                >
                                                    <DollarSign className="w-3 h-3 mr-1" /> Cobrar
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic mr-2">Completado</span>
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
                        <DialogTitle>Registrar Cobranza</DialogTitle>
                    </DialogHeader>
                    
                    {selectedSale && (
                        <PaymentRegistrationForm 
                            sale={selectedSale}
                            balance={selectedSale.balance}
                            onSuccess={() => setSelectedSale(null)}
                            onCancel={() => setSelectedSale(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Collections;