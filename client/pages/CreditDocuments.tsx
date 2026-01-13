import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FileSignature, Search, ArrowRight, Wallet, Users } from "lucide-react";

import { AccountsReceivableService } from "@/api/services/accountsReceivableService";
import { AccountsReceivable } from "@/types/store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const CreditDocuments: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");


    const { data: accounts = [], isLoading } = useQuery<AccountsReceivable[]>({
        queryKey: ['accounts-receivable'],
        queryFn: AccountsReceivableService.getAll
    });


    const creditAccounts = accounts.filter(ar => {

        if (ar.sale?.paymentCondition !== 'CREDITO') return false;


        const searchString = `V-${ar.sale?.id} AR-${ar.id} Client-${ar.sale?.clientId}`.toLowerCase();
        return searchTerm === "" || searchString.includes(searchTerm.toLowerCase());
    });

    if (isLoading) return <div className="p-8 text-center">Cargando cartera de créditos...</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                        <FileSignature className="w-8 h-8 text-indigo-600" />
                        Gestión de Títulos Valores
                    </h1>
                    <p className="text-muted-foreground">Seleccione una cuenta a crédito para gestionar sus documentos legales.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center bg-slate-50/50">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Wallet className="w-4 h-4"/> Cartera de Créditos Activos
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar venta o cliente..." 
                            className="pl-8 bg-white" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID Venta</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Emisión</TableHead>
                                <TableHead className="text-right">Total Venta</TableHead>
                                <TableHead className="text-right">Saldo Pendiente</TableHead>
                                <TableHead className="text-center">Estado Fin.</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {creditAccounts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                        No hay ventas a crédito registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                            {creditAccounts.map((ar) => {
                                const paid = ar.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
                                const balance = ar.totalAmount - paid;

                                return (
                                    <TableRow key={ar.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium">V-{ar.sale?.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-slate-100 rounded"><Users className="w-3 h-3 text-slate-500"/></div>
                                                <span className="text-sm">
                                                    {ar.sale?.clientId ? `Cliente #${ar.sale.clientId}` : 'Consumidor Final'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(ar.sale?.saleDate || "").toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            ${ar.totalAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-700">
                                            ${balance.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {balance <= 0.01 ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Saldado</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Vigente</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                size="sm" 
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                onClick={() => navigate(`/credit-documents/${ar.id}`)}
                                            >
                                                Gestionar <ArrowRight className="w-4 h-4 ml-1" />
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

export default CreditDocuments;