import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SaleReturnService } from "@/api/services/saleReturnService";
import { SaleReturn } from "@/types/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

export default function GlobalReturnsHistoryPage() {
    const navigate = useNavigate();
    const [returns, setReturns] = useState<SaleReturn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await SaleReturnService.getAll();
            setReturns(data);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/returns')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Historial Global de Devoluciones</h1>
            </div>

            <Card>
                <CardHeader><CardTitle>Registro Completo</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : returns.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No hay registros.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Venta Ref.</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Nota Crédito</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returns.map((ret) => (
                                    <TableRow key={ret.id}>
                                        <TableCell>#{ret.id}</TableCell>
                                        <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="link" size="sm" onClick={() => navigate(`/returns/${ret.saleId}`)}>
                                                #{ret.saleId}
                                            </Button>
                                        </TableCell>
                                        <TableCell><Badge variant="secondary">{ret.type}</Badge></TableCell>
                                        <TableCell>{ret.reason}</TableCell>
                                        <TableCell>
                                            {ret.creditNote ? (
                                                <span className="flex items-center gap-1 text-xs font-bold">
                                                    <FileText className="w-3 h-3" />
                                                    {ret.creditNote.series}-{ret.creditNote.number}
                                                </span>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            S/ {ret.totalRefundAmount.toFixed(2)}
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