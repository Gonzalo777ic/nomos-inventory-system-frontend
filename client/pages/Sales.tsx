import React, { useState, useEffect } from 'react';
import { SaleService } from '../api/services/saleService'; 
import { Sale } from '../types/store'; 
import SaleForm from '../components/forms/SaleForm';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge'; 
import { Eye, Loader2, DollarSign, Calendar, Clock } from 'lucide-react'; // Cambié Edit por Eye

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSales = async () => {
        setLoading(true);
        console.log("[SalesPage] Iniciando fetch de ventas...");
        try {
            const data = await SaleService.getAll();
            setSales(data);
            console.log(`[SalesPage] Fetch exitoso. ${data.length} ventas encontradas.`);
        } catch (e: any) {
            console.error("Error fetching sales:", e);
            if (e.response && e.response.status === 405) {
                toast({ title: "Error 405", description: "Método no permitido.", variant: "destructive" });
            } else {
                toast({ title: "Error", description: "No se pudieron cargar las ventas.", variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'CANCELADA': return 'bg-red-100 text-red-700 hover:bg-red-200';
            case 'EMITIDA': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold flex items-center">
                        <DollarSign className="w-6 h-6 mr-2" /> Listado de Transacciones de Venta
                    </CardTitle>
                    {/* El botón de crear NO lleva readOnly, por lo que permite editar */}
                    <SaleForm onSuccess={fetchSales} />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Cargando ventas...</span>
                        </div>
                    ) : (
                        sales.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No hay ventas registradas.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Fecha Emisión</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Condición / Vencimiento</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="font-medium">V-{sale.id}</TableCell>
                                            <TableCell>
                                                {format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{sale.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {sale.clientId ? `Cliente #${sale.clientId}` : <span className="text-gray-400 italic">Anónimo</span>}
                                            </TableCell>

                                            {/* --- LÓGICA DE VENCIMIENTO --- */}
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {sale.paymentCondition === 'CREDITO' ? (
                                                        <>
                                                            <div className="flex items-center text-sm font-semibold text-blue-700">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                Crédito
                                                            </div>
                                                            {sale.dueDate && (
                                                                <div className="text-xs text-gray-500 flex items-center">
                                                                    <Calendar className="w-3 h-3 mr-1" />
                                                                    Vence: {format(new Date(sale.dueDate), 'dd/MM/yyyy')}
                                                                    <span className="ml-1 text-[10px] bg-gray-100 px-1 rounded border border-gray-200">
                                                                        ({sale.creditDays} días)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center text-sm font-medium text-green-700">
                                                            <DollarSign className="w-3 h-3 mr-1" />
                                                            Contado
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell className="font-bold text-base">
                                                {formatCurrency(sale.totalAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(sale.status)} border-0`}>
                                                    {sale.status}
                                                </Badge>
                                            </TableCell>
                                            
                                            {/* --- ACCIONES: Solo ver detalle --- */}
                                            <TableCell className="text-right">
                                                <SaleForm 
                                                    initialData={sale} 
                                                    onSuccess={fetchSales}
                                                    readOnly={true} // <--- ACTIVAMOS MODO LECTURA
                                                    trigger={
                                                        <Button variant="ghost" size="icon" title="Ver Detalle / Anular">
                                                            <Eye className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                                        </Button>
                                                    } 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesPage;