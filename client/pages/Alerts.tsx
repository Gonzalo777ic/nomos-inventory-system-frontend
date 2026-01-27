import React, { useEffect, useState } from 'react';
import { 
    getCalculatedStockAlerts, 
    getPersistentAlerts, 
    updateAlertStatus, 
    deleteAlert 
} from '@/api/services/alertService';
import { Alert, StockAlertCalculated, AlertStatus } from '@/types/inventory/alerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    PackageOpen, 
    Clock, 
    AlertOctagon 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPage() {
    const [activeTab, setActiveTab] = useState("realtime");
    const [calculatedAlerts, setCalculatedAlerts] = useState<StockAlertCalculated[]>([]);
    const [persistentAlerts, setPersistentAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "realtime") {
                const data = await getCalculatedStockAlerts();
                setCalculatedAlerts(data);
            } else {
                const data = await getPersistentAlerts(); 
                setPersistentAlerts(data);
            }
        } catch (error) {
            toast.error("Error al cargar alertas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);


    const handleResolve = async (id: number) => {
        try {
            await updateAlertStatus(id, 'RESOLVED');
            toast.success("Alerta marcada como resuelta");
            loadData();
        } catch (error) {
            toast.error("No se pudo actualizar la alerta");
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Estás seguro de eliminar esta alerta del historial?")) return;
        try {
            await deleteAlert(id);
            toast.success("Alerta eliminada");
            loadData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };


    const formatDate = (dateStr: string) => 
        new Date(dateStr).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Centro de Alertas</h1>
                    <p className="text-slate-500">Monitoreo de stock crítico y vencimientos.</p>
                </div>
                <Button variant="outline" onClick={loadData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            <Tabs defaultValue="realtime" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="realtime">Tiempo Real (Stock)</TabsTrigger>
                    <TabsTrigger value="history">Historial y Gestión</TabsTrigger>
                </TabsList>

                {}
                <TabsContent value="realtime" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" />
                                Productos con Stock Bajo
                            </CardTitle>
                            <CardDescription>
                                Detectados comparando el stock actual físico vs el umbral mínimo configurado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {calculatedAlerts.length === 0 && !loading ? (
                                <div className="text-center py-10 text-slate-500">
                                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                                    <p>¡Todo en orden! No hay productos con stock crítico.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {calculatedAlerts.map((alert) => (
                                        <Card key={alert.productId} className={`border-l-4 ${alert.status === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                                            <CardContent className="pt-4">
                                                <div className="flex gap-4">
                                                    <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                                        {alert.imageUrl ? (
                                                            <img src={alert.imageUrl} alt={alert.productName} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <PackageOpen className="w-8 h-8 m-auto mt-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm line-clamp-2">{alert.productName}</h4>
                                                        <p className="text-xs text-slate-500 mb-2">SKU: {alert.sku}</p>
                                                        
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <div className="text-xs font-semibold uppercase text-slate-400">Stock Actual</div>
                                                                <div className={`text-xl font-bold ${alert.status === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                                                                    {alert.currentStock}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-400">Mínimo: {alert.minStockThreshold}</div>
                                                                <Badge variant={alert.status === 'CRITICAL' ? 'destructive' : 'outline'} className="mt-1">
                                                                    Faltan: {alert.deficit}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {}
                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Incidencias</CardTitle>
                            <CardDescription>Alertas persistentes generadas por el sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Gravedad</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Producto / Asunto</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {persistentAlerts.map((alert) => (
                                        <TableRow key={alert.id}>
                                            <TableCell>
                                                {alert.severity === 1 && <AlertOctagon className="text-red-500 w-5 h-5" />}
                                                {alert.severity === 2 && <AlertTriangle className="text-amber-500 w-5 h-5" />}
                                                {alert.severity === 3 && <Clock className="text-blue-500 w-5 h-5" />}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">
                                                {formatDate(alert.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{alert.title}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{alert.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{alert.type.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    alert.status === 'ACTIVE' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                                                    alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 
                                                    'bg-slate-100 text-slate-800'
                                                }>
                                                    {alert.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {alert.status === 'ACTIVE' && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleResolve(alert.id)} title="Marcar Resuelto">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(alert.id)} title="Eliminar">
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {persistentAlerts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                No hay alertas registradas en el historial.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}