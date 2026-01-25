import React, { useEffect, useState } from 'react';
import { InventoryMovementService } from '@/api/services/inventoryMovementService';
import { InventoryMovement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowUpCircle, ArrowDownCircle, Package, RefreshCw } from 'lucide-react';

const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function InventoryMovements() {
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        setLoading(true);
        try {
            const data = await InventoryMovementService.getAll();
            const sorted = data.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
            setMovements(sorted);
        } catch (error) {
            console.error("Error cargando kardex", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMovements = movements.filter(m => 
        m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeBadge = (type: string, quantity: number) => {
        const isPositive = quantity > 0;
        
        if (type.includes('VENTA')) return <Badge variant="destructive" className="gap-1"><ArrowDownCircle className="w-3 h-3"/> Venta</Badge>;
        if (type.includes('ENTRADA')) return <Badge className="bg-emerald-600 gap-1"><ArrowUpCircle className="w-3 h-3"/> Entrada</Badge>;
        if (type.includes('AJUSTE')) return <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600"><RefreshCw className="w-3 h-3"/> Ajuste</Badge>;
        
        return <Badge variant={isPositive ? "default" : "secondary"}>{type}</Badge>;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Kardex de Inventario</h1>
                    <p className="text-slate-500 dark:text-slate-400">Trazabilidad completa de entradas y salidas de mercadería.</p>
                </div>
                <Button onClick={loadMovements} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de Movimientos</CardTitle>
                    <CardDescription>
                        Visualizando {filteredMovements.length} movimientos registrados.
                    </CardDescription>
                    <div className="pt-2 relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por producto, motivo o tipo..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>
                    ) : filteredMovements.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed rounded-lg">
                            <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>No se encontraron movimientos.</p>
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800">
                                        <TableHead className="w-[160px]">Fecha</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Tipo Movimiento</TableHead>
                                        <TableHead>Motivo / Referencia</TableHead>
                                        <TableHead className="text-right">Cambio</TableHead>
                                        <TableHead className="text-right font-bold bg-slate-100 dark:bg-slate-900 w-[120px]">Saldo Final</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMovements.map((mov) => (
                                        <TableRow key={mov.id}>
                                            <TableCell className="text-xs text-slate-500 font-mono">
                                                {formatDate(mov.movementDate)}
                                            </TableCell>
                                            
                                            <TableCell>
                                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                                    {mov.product?.name || `Producto ID ${mov.product?.id}`}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    SKU: {mov.product?.sku || '---'}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell>
                                                {getTypeBadge(mov.type, mov.quantityChange)}
                                            </TableCell>
                                            
                                            <TableCell className="text-sm text-slate-600">
                                                {mov.reason}
                                                {mov.referenceId && (
                                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                                        Ref: {mov.referenceService} #{mov.referenceId}
                                                    </span>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell className={`text-right font-bold ${mov.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {mov.quantityChange > 0 ? '+' : ''}{mov.quantityChange}
                                            </TableCell>
                                            
                                            <TableCell className="text-right font-mono font-bold bg-slate-50/50">
                                                {mov.balanceAfter !== undefined ? mov.balanceAfter : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}