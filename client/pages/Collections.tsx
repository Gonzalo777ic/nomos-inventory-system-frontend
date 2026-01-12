import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom"; 
import { 
    AlertTriangle, 
    CheckCircle2, 
    Wallet, 
    Search,
    History,
    CalendarClock,
    Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";  

import { AccountsReceivableService } from "@/api/services/accountsReceivableService";
import { AccountsReceivable } from "@/types/store";

const Collections: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showHistory, setShowHistory] = useState(false);


    const { data: accounts = [], isLoading } = useQuery<AccountsReceivable[]>({
        queryKey: ['accounts-receivable'],
        queryFn: AccountsReceivableService.getAll 
    });

    const { processedAccounts, kpis } = useMemo(() => {
        let totalReceivable = 0;
        let totalOverdue = 0;
        let collectedThisMonth = 0;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();


        if (!accounts || !Array.isArray(accounts)) {
            return { 
                processedAccounts: [], 
                kpis: { totalReceivable: 0, totalOverdue: 0, collectedThisMonth: 0 } 
            };
        }

        const processed = accounts.map((ar) => {

            const installments = ar.installments || []; 
            const collections = ar.collections || [];
            const sale = ar.sale || { id: '?', clientId: '?', saleDate: '' };



            const paidAmount = installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
            const balance = ar.totalAmount - paidAmount;
            

            const isOverdue = installments.some(i => {
                if (i.status === 'OVERDUE') return true;
                if (i.status === 'PAID') return false;
                if (!i.dueDate) return false;
                

                const [year, month, day] = i.dueDate.toString().split('-').map(Number);
                const endOfDueDate = new Date(year, month - 1, day, 23, 59, 59, 999);
                const now = new Date();

                return now > endOfDueDate;
            });


            if (ar.status === 'ACTIVE' || ar.status === 'BAD_DEBT') {
                totalReceivable += balance;
                if (isOverdue) totalOverdue += balance;
            }


            collections.forEach(col => {
                if (!col.collectionDate) return;
                const colDate = new Date(col.collectionDate);
                if (colDate.getMonth() === currentMonth && 
                    colDate.getFullYear() === currentYear && 
                    col.status !== 'ANULADO') {
                    collectedThisMonth += col.amount;
                }
            });

            return {
                ...ar,
                paidAmount,
                balance,
                isOverdue,

                searchKey: `AR-${ar.id} Sale-${sale.id} Client-${sale.clientId || ''}`
            };
        });


        const filtered = processed.filter(ar => {
            if ((ar.status === 'CANCELLED' || ar.status === 'PAID') && !showHistory) return false;
            return searchTerm === "" || ar.searchKey.toLowerCase().includes(searchTerm.toLowerCase());
        });

        const sorted = filtered.sort((a, b) => b.balance - a.balance);

        return { 
            processedAccounts: sorted, 
            kpis: { totalReceivable, totalOverdue, collectedThisMonth } 
        };
    }, [accounts, searchTerm, showHistory]);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando gestión financiera...</div>;
    console.log("Datos recibidos del backend:", accounts);
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Cobranzas</h1>
            </div>

            {}
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
                        <p className="text-xs text-red-600/80">Requiere gestión inmediata</p>
                    </CardContent>
                </Card>

                {}
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

            {}
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Cartera de Clientes</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-slate-50 dark:bg-slate-900">
                            <Switch 
                                id="history-mode" 
                                checked={showHistory}
                                onCheckedChange={setShowHistory}
                            />
                            <Label htmlFor="history-mode" className="text-sm cursor-pointer flex items-center gap-1 select-none">
                                <History className="w-3 h-3 text-muted-foreground"/>
                                {showHistory ? "Ocultar Saldados" : "Ver Historial Completo"}
                            </Label>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar..." 
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
                                <TableHead>ID Cuenta</TableHead>
                                <TableHead>Venta Origen</TableHead>
                                <TableHead>Cuotas</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead className="text-right">Deuda Total</TableHead>
                                <TableHead className="text-right">Saldo Pendiente</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedAccounts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                        No hay cuentas pendientes.
                                    </TableCell>
                                </TableRow>
                            )}
                            {processedAccounts.map((ar) => {
                                const percentage = ar.totalAmount > 0 
                                    ? (ar.paidAmount / ar.totalAmount) * 100 
                                    : 100;
                                
                                return (
                                    <TableRow key={ar.id}>
                                        <TableCell className="font-medium">AR-{ar.id}</TableCell>
                                        <TableCell>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded dark:bg-slate-800">
                                                Ref: Sale #{ar.sale?.id || '?'}
                                            </span>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <CalendarClock className="w-3 h-3 text-muted-foreground"/>
                                                <span className="text-sm">{ar.installments.length} cuotas</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="w-[140px]">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>${ar.paidAmount.toFixed(2)}</span>
                                                    <span>{percentage.toFixed(0)}%</span>
                                                </div>
                                                <Progress 
                                                    value={percentage} 
                                                    className={`h-2 ${ar.status === 'PAID' ? "bg-green-100" : ""}`} 
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right text-muted-foreground">${ar.totalAmount.toFixed(2)}</TableCell>
                                        
                                        <TableCell className={`text-right font-bold ${ar.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${ar.balance.toFixed(2)}
                                        </TableCell>
                                        
                                        <TableCell className="text-center">
                                            {ar.status === 'CANCELLED' ? (
                                                <Badge variant="secondary">ANULADA</Badge>
                                            ) : ar.status === 'PAID' ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">PAGADO</Badge>
                                            ) : ar.isOverdue ? (
                                                <Badge variant="destructive">MORA</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">ACTIVO</Badge>
                                            )}
                                        </TableCell>
                                        
                                        {}
                                        <TableCell className="text-right">
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                                onClick={() => navigate(`/collections/${ar.id}`)} 
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Ver Detalle
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Collections;