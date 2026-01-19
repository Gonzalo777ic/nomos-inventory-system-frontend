import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SaleService } from "@/api/services/saleService";
import { Sale } from "@/types/store";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Eye, History } from "lucide-react";

export default function ReturnsPage() {
    const navigate = useNavigate();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const data = await SaleService.getAll();

            const validSales = data
                .filter(s => s.status !== 'CANCELADA')
                .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
            setSales(validSales);
        } catch (error) {
            console.error("Error al cargar ventas", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(s => 
        s.id.toString().includes(searchTerm) || 
        (s.clientId?.toString() || "").includes(searchTerm)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Devoluciones</h1>
                    <p className="text-slate-500">Seleccione una venta para gestionar sus devoluciones.</p>
                </div>
                {}
                <Button variant="outline" onClick={() => navigate('/returns/history')}>
                    <History className="mr-2 h-4 w-4" />
                    Ver Historial Global
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ventas Elegibles</CardTitle>
                    <CardDescription>Seleccione una venta para ver sus detalles o iniciar una devolución.</CardDescription>
                    <div className="pt-2 relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por ID Venta..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Venta</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Comprobante</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-center">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSales.map((sale) => (
                                    <TableRow key={sale.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium">#{sale.id}</TableCell>
                                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.clientId ? `ID: ${sale.clientId}` : 'Consumidor Final'}</TableCell>
                                        <TableCell><Badge variant="outline">{sale.type}</Badge></TableCell>
                                        <TableCell className="text-right">S/ {sale.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            {}
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                onClick={() => navigate(`/returns/${sale.id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Gestionar
                                            </Button>
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
}