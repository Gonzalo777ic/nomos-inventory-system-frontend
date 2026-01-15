import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    ArrowLeft, FileText, Stamp, Plus, FileSignature, CheckCircle2, 
    Eye, Trash2, AlertTriangle 
} from "lucide-react";

import { AccountsReceivableService } from "@/api/services/accountsReceivableService";
import { CreditDocumentService } from "@/api/services/creditDocumentService";
import { LegalEntityService } from "@/api/services/legalEntityService";
import { AccountsReceivable, CreditDocument, CreditDocumentPayload, LegalEntity } from "@/types/store";
import { CreditDocumentForm } from "@/components/forms/CreditDocumentForm";
import { DocumentPreviewModal } from "@/components/modals/DocumentPreviewModal";
import { CreditContextPanel } from "@/components/panels/CreditContextPanel";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
    DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CreditDocumentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<CreditDocument | null>(null);
    const [docToSign, setDocToSign] = useState<CreditDocument | null>(null);
    const [docToDelete, setDocToDelete] = useState<CreditDocument | null>(null);


    const { data: ar, isLoading: arLoading } = useQuery<AccountsReceivable>({
        queryKey: ["accounts-receivable", id],
        queryFn: () => AccountsReceivableService.getById(Number(id)),
        enabled: !!id,
    });

    const { data: documents = [], isLoading: docLoading } = useQuery<CreditDocument[]>({
        queryKey: ["credit-documents", id],
        queryFn: () => CreditDocumentService.getByAccount(Number(id)),
        enabled: !!id
    });


    

    const signMutation = useMutation({
        mutationFn: (docId: number) => CreditDocumentService.updateStatus(docId, 'SIGNED'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit-documents", id] });
            toast({ title: "Documento Firmado", description: "El título valor ha sido registrado legalmente." });
            setDocToSign(null);
        },
        onError: () => toast({ title: "Error", description: "No se pudo firmar el documento.", variant: "destructive" })
    });


    const deleteMutation = useMutation({
        mutationFn: (docId: number) => CreditDocumentService.delete(docId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credit-documents", id] });
            toast({ title: "Eliminado", description: "El borrador ha sido eliminado." });
            setDocToDelete(null);
        },
        onError: () => toast({ title: "Error", description: "No se puede eliminar (quizás ya está firmado).", variant: "destructive" })
    });

    if (arLoading || docLoading) return <div className="p-10 text-center">Cargando expediente legal...</div>;
    if (!ar) return <div className="p-10 text-center text-red-500">No se encontró la cuenta.</div>;

    const paid = ar.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const balance = ar.totalAmount - paid;

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            
            {}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/credit-documents')}>
                    <ArrowLeft className="w-4 h-4 mr-2"/> Volver a la lista
                </Button>
                <h1 className="text-xl font-bold ml-2">Expediente de Crédito #{id}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {}
                <div className="lg:col-span-1">
                    <CreditContextPanel ar={ar} />
                </div>

                {}
                <div className="lg:col-span-3 space-y-6">
                    
                    {}
                    <Card className="flex flex-col sm:flex-row justify-between items-center p-6 bg-white border-l-4 border-l-indigo-600 shadow-sm gap-4">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <FileSignature className="w-5 h-5 text-indigo-600"/>
                                Emisión de Documentos
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Genere títulos valores para respaldar el saldo pendiente de 
                                <span className="font-bold text-slate-900 ml-1">${balance.toFixed(2)}</span>.
                            </p>
                        </div>
                        
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="default" className="bg-indigo-600 hover:bg-indigo-700 shadow-md whitespace-nowrap">
                                    <Plus className="w-4 h-4 mr-2" /> Nuevo Título Valor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[1100px] max-h-[95vh] overflow-y-auto p-0">
                                <DialogHeader className="p-6 pb-2 border-b border-slate-100">
                                    <DialogTitle>Emitir Título Valor (Pagaré / Letra)</DialogTitle>
                                </DialogHeader>
                                <div className="p-6">
                                    <CreditDocumentForm 
                                        onSuccess={() => {
                                            setIsCreateOpen(false);
                                            queryClient.invalidateQueries({ queryKey: ["credit-documents", id] });
                                        }}
                                        initialData={{
                                            accountsReceivableId: ar.id,
                                            amount: balance,
                                            debtorName: `Cliente ${ar.sale?.clientId || ''}`
                                        }}
                                        contextData={ar}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>

                    <Separator />

                    {}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                            <Stamp className="w-5 h-5"/> Documentos Registrados
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Documento</TableHead>
                                            <TableHead>Nro. Folio</TableHead>
                                            <TableHead>Deudor</TableHead>
                                            <TableHead>Fechas</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead className="text-center">Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                                    No hay documentos legales emitidos.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-2 rounded-full ${doc.type === 'PAGARE' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {doc.type === 'PAGARE' ? <FileText className="w-4 h-4"/> : <Stamp className="w-4 h-4"/>}
                                                        </div>
                                                        <span className="font-medium text-sm">{doc.type === 'PAGARE' ? 'Pagaré' : 'Letra'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{doc.documentNumber}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{doc.debtorName}</span>
                                                        <span className="text-[10px] text-muted-foreground">{doc.debtorIdNumber}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span>E: {doc.issueDate}</span>
                                                        <span className="text-red-600 font-semibold">V: {doc.dueDate}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-700">
                                                    ${doc.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={doc.status === 'SIGNED' ? 'default' : 'secondary'} className={doc.status === 'SIGNED' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                        {doc.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDoc(doc)}>
                                                                        <Eye className="w-4 h-4 text-slate-500"/>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Ver Documento</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {doc.status === 'DRAFT' && (
                                                            <>
                                                                {}
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600" onClick={() => setDocToDelete(doc)}>
                                                                                <Trash2 className="w-4 h-4 text-slate-400"/>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Eliminar Borrador</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                {}
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    className="text-xs h-8 ml-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                                                    onClick={() => setDocToSign(doc)}
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3 mr-1"/> Firmar
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {}
            {previewDoc && (
                <DocumentPreviewModal 
                    open={!!previewDoc} 
                    onOpenChange={(open) => !open && setPreviewDoc(null)} 
                    data={{
                        ...previewDoc,
                        creditorEntityId: previewDoc.creditor?.id,
                        creditorName: previewDoc.creditor?.legalName
                    } as unknown as Partial<CreditDocumentPayload>} 
                />
            )}

            {}
            <Dialog open={!!docToSign} onOpenChange={(open) => !open && setDocToSign(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <FileSignature className="w-5 h-5"/> Confirmar Firma Legal
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Está a punto de registrar como <strong>FIRMADO</strong> el documento <strong>{docToSign?.documentNumber}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800 my-2">
                        <div className="flex gap-2 font-bold mb-1 items-center">
                            <AlertTriangle className="w-4 h-4"/> Atención
                        </div>
                        Una vez firmado, este documento legal <strong>no podrá ser eliminado ni modificado</strong>. Asegúrese de que todos los datos sean correctos.
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDocToSign(null)}>Cancelar</Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700" 
                            onClick={() => docToSign && signMutation.mutate(docToSign.id)}
                            disabled={signMutation.isPending}
                        >
                            {signMutation.isPending ? "Procesando..." : "Sí, Confirmar Firma"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {}
            <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5"/> Eliminar Borrador
                        </DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar el documento <strong>{docToDelete?.documentNumber}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDocToDelete(null)}>Cancelar</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => docToDelete && deleteMutation.mutate(docToDelete.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default CreditDocumentDetail;