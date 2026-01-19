import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale, SalesDocument } from "@/types/store";
import { Printer, Loader2, FileText } from "lucide-react";
import { SalesDocumentService } from "@/api/services/salesDocumentService";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatDate = (dateStr: string) => {
    if (!dateStr) return "___";
    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};




const DocumentTemplate = ({ sale, document }: { sale: Sale, document: SalesDocument }) => {
    

    const total = document.totalAmount;
    const base = total / 1.18;
    const igv = total - base;


    const isCreditNote = document.type === 'NOTA_CREDITO';
    

    const refDoc = isCreditNote 
        ? sale.documents?.find(d => (d.type === 'FACTURA' || d.type === 'BOLETA') && d.status !== 'VOIDED') 
        : null;

    return (
        <div className="bg-white p-8 text-xs md:text-sm font-sans text-slate-900 h-full border border-slate-200 shadow-sm relative flex flex-col justify-between min-h-[600px]">
            
            <div>
                {}
                <div className="flex justify-between items-start mb-6">
                    <div className="w-1/2 pr-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">MI EMPRESA S.A.C.</h2>
                        <p className="text-slate-500 text-[10px] mb-2">Venta de productos y servicios tecnológicos</p>
                        <p><strong>Dirección:</strong> Av. Principal 123, Lima - Perú</p>
                        <p><strong>RUC:</strong> 20123456789</p>
                    </div>

                    <div className="w-1/2 border-2 border-slate-800 p-4 text-center">
                        <div className={`text-white font-bold py-1 my-2 uppercase ${isCreditNote ? 'bg-red-700' : 'bg-slate-800'}`}>
                            {document.type.replace('_', ' ')} ELECTRÓNICA
                        </div>
                        <p className="font-bold text-lg">{document.series} - {document.number}</p>
                    </div>
                </div>

                {}
                <div className="border rounded-md p-3 mb-6 bg-slate-50">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="font-bold text-slate-600 block text-[10px] uppercase">Cliente:</span>
                            <span>{sale.clientId ? `Cliente Registrado (ID: ${sale.clientId})` : "CONSUMIDOR FINAL"}</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-600 block text-[10px] uppercase">Fecha de Emisión:</span>
                            <span>{formatDate(document.issueDate)}</span>
                        </div>
                        
                        {}
                        {isCreditNote && refDoc && (
                            <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                                <span className="font-bold text-slate-600 block text-[10px] uppercase">Documento que Modifica:</span>
                                <span className="font-medium text-slate-800">
                                    {refDoc.type} {refDoc.series}-{refDoc.number}
                                </span>
                                <span className="block text-[10px] text-slate-500 mt-1">
                                    Motivo: {document.responseMessage || "Devolución / Anulación"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="mb-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className={`${isCreditNote ? 'bg-red-700' : 'bg-slate-800'} text-white text-left`}>
                                <th className="p-2 w-12 text-center">Cant.</th>
                                <th className="p-2">Descripción</th>
                                <th className="p-2 text-right">P. Unit</th>
                                <th className="p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* NOTA: En una implementación real de NC Parcial, aquí solo deberían ir los items devueltos. 
                                Por ahora mostramos los de la venta para mantener compatibilidad visual */}
                            {sale.details?.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-200">
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2">PRODUCTO ID: {item.productId}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                    <td className="p-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {}
                <div className="flex justify-end">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between font-bold text-lg text-slate-900 border-t-2 border-slate-800 pt-2">
                            <span>TOTAL {isCreditNote ? 'DEVOLUCIÓN' : 'A PAGAR'}:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center">
                <p>Representación impresa del {isCreditNote ? 'Documento de Crédito Electrónico' : 'Comprobante de Pago Electrónico'}.</p>
                {document.digestValue && (
                     <p className="mt-1 font-mono">Hash: {document.digestValue}</p>
                )}
            </div>
        </div>
    );
};





interface SalesReturnDocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale | null;
    


    document: { id: number; series: string; number: string; type: string; issueDate: string; totalAmount: number; responseMessage?: string; digestValue?: string } | null;
}

export const SalesReturnDocumentPreviewModal: React.FC<SalesReturnDocumentPreviewModalProps> = ({ 
    open, 
    onOpenChange, 
    sale, 
    document 
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    if (!sale || !document) return null;



    const fullDocument = document as SalesDocument;

    const handleDownloadPdf = async () => {
        try {
            setIsLoading(true);

            const blob = await SalesDocumentService.downloadPdf(document.id);
            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');
            

            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo obtener el PDF oficial.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[850px] bg-slate-100 p-0 h-[90vh] flex flex-col overflow-hidden gap-0">
                
                {}
                <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-500"/> 
                        Vista Previa de Documento
                    </DialogTitle>
                    <div className="text-xs text-slate-400">
                        {document.type} {document.series}-{document.number}
                    </div>
                </div>
                
                {}
                <div className="flex-1 overflow-y-auto bg-slate-200/50 p-6">
                    <div className="max-w-[700px] mx-auto bg-white shadow-xl min-h-[800px] transition-transform hover:scale-[1.01] duration-300">
                        <DocumentTemplate sale={sale} document={fullDocument} />
                    </div>
                </div>

                {}
                <div className="bg-white p-4 border-t flex justify-between items-center">
                    <div className="text-xs text-slate-500 italic">
                        * Esta es una representación visual aproximada.
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                        <Button 
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
                            onClick={handleDownloadPdf}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Printer className="w-4 h-4 mr-2"/>}
                            Imprimir PDF Oficial
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};