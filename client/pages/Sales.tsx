import React, { useState, useEffect } from 'react';
import { Sale, SaleService } from '../api/services/saleService.ts';
import SaleForm from '../components/forms/SaleForm.tsx';
import { useToast } from '../hooks/use-toast.ts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// Importaciones de UI (Asumidas: Table, Button, Card, etc.)
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Edit, Loader2, DollarSign } from 'lucide-react';

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await SaleService.getAll();
            setSales(data);
        } catch (e) {
            console.error("Error fetching sales:", e);
            toast({ title: "Error", description: "No se pudieron cargar las ventas desde el servidor.", variant: "destructive" });
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
    
    // Función para obtener el color del estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-green-100 text-green-700';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELADA': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };


    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold flex items-center">
                        <DollarSign className="w-6 h-6 mr-2" /> Listado de Transacciones de Venta
                    </CardTitle>
                    <SaleForm onSuccess={fetchSales} />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Cargando ventas...</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Cliente ID</TableHead>
                                    <TableHead>Vendedor ID</TableHead>
                                    <TableHead>Descuento</TableHead>
                                    <TableHead>Monto Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell className="font-medium">V-{sale.id}</TableCell>
                                        <TableCell>{format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                                        <TableCell>{sale.type}</TableCell>
                                        <TableCell>{sale.clientId ?? 'N/A'}</TableCell>
                                        <TableCell>{sale.sellerId}</TableCell>
                                        <TableCell>{formatCurrency(sale.totalDiscount)}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                                                {sale.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <SaleForm initialData={sale} onSuccess={fetchSales} trigger={
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            } />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesPage;