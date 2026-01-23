import React, { useEffect, useState } from 'react';
import { AccountingService } from '@/api/services/accountingService';
import { AccountingJournalEntry } from '@/types/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Eye, FileText, ArrowRightLeft } from 'lucide-react';


const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);


const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AccountingMovements() {
    const [entries, setEntries] = useState<AccountingJournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    

    const [selectedEntry, setSelectedEntry] = useState<AccountingJournalEntry | null>(null);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const data = await AccountingService.getAll();
            setEntries(data);
        } catch (error) {
            console.error("Error cargando movimientos contables", error);
        } finally {
            setLoading(false);
        }
    };


    const filteredEntries = entries.filter(e => 
        e.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.referenceDocument?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toString().includes(searchTerm)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Libro Diario</h1>
                    <p className="text-slate-500 dark:text-slate-400">Historial detallado de movimientos contables y asientos automáticos.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Asientos Registrados</CardTitle>
                    <CardDescription>Visualización cronológica de operaciones.</CardDescription>
                    <div className="pt-2 relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por concepto, referencia o ID..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No se encontraron movimientos contables.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="w-[180px]">Fecha Registro</TableHead>
                                    <TableHead>Concepto (Glosa)</TableHead>
                                    <TableHead>Referencia</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-center">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEntries.map((entry) => (
                                    <TableRow key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell className="font-mono text-xs">#{entry.id}</TableCell>
                                        <TableCell>{formatDate(entry.entryDate)}</TableCell>
                                        <TableCell className="font-medium">{entry.concept}</TableCell>
                                        <TableCell>
                                            {entry.referenceDocument ? (
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {entry.referenceDocument}
                                                </Badge>
                                            ) : <span className="text-slate-400">-</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={entry.status === 'POSTED' ? 'bg-emerald-600' : 'bg-slate-500'}>
                                                {entry.status === 'POSTED' ? 'ASENTADO' : entry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {}
            <EntryDetailModal 
                open={!!selectedEntry} 
                onOpenChange={(open) => !open && setSelectedEntry(null)}
                entry={selectedEntry}
            />
        </div>
    );
}


function EntryDetailModal({ open, onOpenChange, entry }: { open: boolean, onOpenChange: (v: boolean) => void, entry: AccountingJournalEntry | null }) {
    if (!entry) return null;

    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Detalle de Asiento #{entry.id}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {}
                    <div className="bg-slate-50 p-4 rounded-md border text-sm grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Concepto</span>
                            <span>{entry.concept}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Fecha</span>
                            <span>{formatDate(entry.entryDate)}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Doc. Referencia</span>
                            <span className="font-mono">{entry.referenceDocument}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs uppercase font-bold">Estado</span>
                            <span className={entry.status === 'POSTED' ? 'text-emerald-600 font-bold' : ''}>{entry.status}</span>
                        </div>
                    </div>

                    {}
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-100">
                                    <TableHead className="w-[100px]">Cuenta</TableHead>
                                    <TableHead>Descripción Cuenta</TableHead>
                                    <TableHead className="text-right w-[140px] text-slate-600">Debe</TableHead>
                                    <TableHead className="text-right w-[140px] text-slate-600">Haber</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entry.lines.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell className="font-mono font-medium">{line.accountCode}</TableCell>
                                        <TableCell>{line.accountName}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                                {}
                                <TableRow className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                    <TableCell colSpan={2} className="text-right uppercase text-xs text-slate-500">Totales</TableCell>
                                    <TableCell className="text-right text-emerald-700">{formatCurrency(totalDebit)}</TableCell>
                                    <TableCell className="text-right text-emerald-700">{formatCurrency(totalCredit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {}
                    <div className={`flex items-center gap-2 text-sm p-2 rounded justify-center ${isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <ArrowRightLeft className="w-4 h-4" />
                        {isBalanced ? "Asiento Balanceado (Partida Doble Correcta)" : "¡ALERTA! Asiento Descuadrado"}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}