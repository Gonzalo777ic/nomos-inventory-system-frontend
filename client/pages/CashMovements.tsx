import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    TrendingUp, TrendingDown, Wallet, Calendar, 
    Plus, Filter, Download, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { format } from 'date-fns';

import { CashMovementService } from '@/api/services/cashMovementService';
import { CashMovementPayload } from '@/types/store/cash';
import { CashMovementForm } from '@/components/forms/CashMovementForm';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

export const CashPage: React.FC = () => {

    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const [isModalOpen, setIsModalOpen] = useState(false);


    const { data: movements, isLoading, refetch } = useQuery({
        queryKey: ['cash-movements', dateRange],
        queryFn: () => CashMovementService.getAll({
            startDate: dateRange.start,
            endDate: dateRange.end
        })
    });


    const totals = movements?.reduce((acc, mov) => {
        if (mov.status === 'ANNULLED') return acc;
        if (mov.type === 'INCOME') {
            acc.income += mov.amount;
        } else {
            acc.expense += mov.amount;
        }
        return acc;
    }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

    const balance = totals.income - totals.expense;


    const handleCreateMovement = async (payload: CashMovementPayload) => {
        try {
            await CashMovementService.create(payload);
            toast.success("Movimiento registrado correctamente");
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error("Error al registrar movimiento");
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Wallet className="h-7 w-7 text-blue-600" />
                        Gestión de Caja y Bancos
                    </h1>
                    <p className="text-sm text-gray-500">Control de flujo de efectivo y arqueo diario.</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border shadow-sm">
                    <div className="flex items-center px-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="hidden md:inline">Período:</span>
                    </div>
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="text-sm border rounded px-2 py-1 bg-transparent"
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="text-sm border rounded px-2 py-1 bg-transparent"
                    />
                    <Button variant="ghost" size="icon" onClick={() => refetch()}>
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex justify-between items-center">
                            Ingresos Totales
                            <TrendingUp className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            ${totals.income.toFixed(2)}
                        </div>
                        <p className="text-xs text-emerald-600/70 mt-1">En el período seleccionado</p>
                    </CardContent>
                </Card>

                <Card className="bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-rose-600 flex justify-between items-center">
                            Egresos / Gastos
                            <TrendingDown className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                            ${totals.expense.toFixed(2)}
                        </div>
                        <p className="text-xs text-rose-600/70 mt-1">Salidas de dinero operativas</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${balance >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex justify-between items-center">
                            Balance (Arqueo)
                            <Wallet className="w-4 h-4" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                            ${balance.toFixed(2)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Disponible teórico</p>
                    </CardContent>
                </Card>
            </div>

            {}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Detalle de Movimientos</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Exportar
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> Registrar Movimiento
                    </Button>
                </div>
            </div>

            {}
            <Card>
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                <TableHead className="w-[100px]">Fecha</TableHead>
                                <TableHead className="w-[100px]">Hora</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Ref.</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-center w-[100px]">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Cargando movimientos...</TableCell>
                                </TableRow>
                            ) : movements?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                        No hay movimientos en este rango de fechas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movements?.map((mov) => {
                                    const dateObj = new Date(mov.movementDate);
                                    const isIncome = mov.type === 'INCOME';
                                    const isAnnulled = mov.status === 'ANNULLED';

                                    return (
                                        <TableRow key={mov.id} className={isAnnulled ? 'opacity-50 bg-gray-50' : ''}>
                                            <TableCell className="font-medium text-gray-600">
                                                {dateObj.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500">
                                                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{mov.concept}</div>
                                                {mov.sale && (
                                                    <div className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                                                        Ref. Venta #{mov.sale.id}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal">
                                                    {mov.paymentMethodName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono text-gray-500">
                                                {mov.externalReference || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={`font-bold flex items-center justify-end gap-1 ${
                                                    isIncome ? 'text-emerald-600' : 'text-rose-600'
                                                }`}>
                                                    {isIncome ? <ArrowDownLeft className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
                                                    ${mov.amount.toFixed(2)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isAnnulled ? (
                                                    <Badge variant="destructive" className="text-[10px]">ANULADO</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-500">
                                                        OK
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
                    </DialogHeader>
                    <CashMovementForm 
                        onSubmit={handleCreateMovement}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CashPage;