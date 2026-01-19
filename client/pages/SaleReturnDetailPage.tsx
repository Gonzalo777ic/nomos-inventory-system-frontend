import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SaleService } from "@/api/services/saleService";
import { SaleReturnService } from "@/api/services/saleReturnService";
import { Sale, SaleReturn } from "@/types/store";
import { SaleReturnForm } from "@/components/forms/SaleReturnForm"; 


import { SalesReturnDocumentPreviewModal } from "@/components/modals/SalesReturnDocumentPreviewModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { ArrowLeft, RotateCcw, FileCheck, Loader2, Eye } from "lucide-react";

export default function SaleReturnDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [sale, setSale] = useState<Sale | null>(null);
    const [returns, setReturns] = useState<SaleReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    

    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    


    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const saleId = Number(id);
            if (isNaN(saleId)) throw new Error("ID inválido");

            const saleData = await SaleService.getById(saleId);
            setSale(saleData);
            const returnsData = await SaleReturnService.getBySale(saleId);
            setReturns(returnsData);
        } catch (error: any) {
            console.error("Error", error);
            setErrorMsg(error.message || "Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8"/></div>;
    
    if (errorMsg) return (
        <div className="p-10 text-center">
            <h2 className="text-red-600 font-bold">Error</h2>
            <p>{errorMsg}</p>
            <Button variant="outline" onClick={() => navigate('/returns')} className="mt-4">Volver</Button>
        </div>
    );

    if (!sale) return <div className="p-10">Venta no encontrada.</div>;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/returns')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Retorno #{sale.id}</h1>
                    <p className="text-slate-500">Detalles de la venta y emisión de notas de crédito.</p>
                </div>
                <Button 
                    onClick={() => setIsReturnModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Realizar Nueva Devolución
                </Button>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Cliente</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{sale.clientId ? `ID: ${sale.clientId}` : 'Consumidor Final'}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Comprobante</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{sale.type}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Venta</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-slate-900">S/ {sale.totalAmount.toFixed(2)}</div></CardContent>
                </Card>
            </div>

            {}
            <Card>
                <CardHeader><CardTitle>Historial de Devoluciones y Notas de Crédito</CardTitle></CardHeader>
                <CardContent>
                    {returns.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded">No hay devoluciones.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Doc. Fiscal</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returns.map((ret) => (
                                    <TableRow key={ret.id}>
                                        <TableCell>#{ret.id}</TableCell>
                                        <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={ret.reason}>{ret.reason}</TableCell>
                                        <TableCell>
                                            {ret.creditNote ? (
                                                <div className="flex items-center gap-2 text-slate-700 font-medium text-xs">
                                                    <FileCheck className="w-4 h-4 text-green-600" />
                                                    {ret.creditNote.series}-{ret.creditNote.number}
                                                </div>
                                            ) : <span className="text-xs text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">- S/ {ret.totalRefundAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-center"><Badge>{ret.status}</Badge></TableCell>
                                        
                                        {}
                                        <TableCell className="text-center">
                                            {ret.creditNote ? (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => setSelectedDoc(ret.creditNote)}
                                                    title="Ver Nota de Crédito"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <SaleReturnForm 
                sale={sale}
                open={isReturnModalOpen}
                onOpenChange={setIsReturnModalOpen}
                onSuccess={loadData}
            />

            {}
            <SalesReturnDocumentPreviewModal 
                open={!!selectedDoc}
                onOpenChange={(val) => !val && setSelectedDoc(null)}
                sale={sale}
                document={selectedDoc}
            />
        </div>
    );
}