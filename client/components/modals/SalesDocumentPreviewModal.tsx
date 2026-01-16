import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sale, SalesDocument } from "@/types/store";
import { Printer, Loader2, Download } from "lucide-react";
import { SalesDocumentService } from "@/api/services/salesDocumentService";
import { useToast } from "@/hooks/use-toast";


const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatDate = (dateStr: string) => {
    if (!dateStr) return "___";
    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};


const InvoiceTemplate = ({ sale, document }: { sale: Sale, document: SalesDocument }) => {
    

    const total = document.totalAmount;
    const base = total / 1.18;
    const igv = total - base;

    return (
        <div className="bg-white p-8 text-xs md:text-sm font-sans text-slate-900 h-full border border-slate-200 shadow-sm relative">
            
            {}
            <div className="flex justify-between items-start mb-6">
                {}
                <div className="w-1/2 pr-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">MI EMPRESA S.A.C.</h2>
                    <p className="text-slate-500 text-[10px] mb-2">Venta de productos y servicios tecnológicos</p>
                    <p><strong>Dirección:</strong> Av. Principal 123, Lima - Perú</p>
                    <p><strong>Teléfono:</strong> (01) 123-4567</p>
                    <p><strong>Email:</strong> contacto@miempresa.com</p>
                </div>

                {}
                <div className="w-1/2 border-2 border-slate-800 p-4 text-center">
                    <p className="font-bold text-lg">R.U.C. 20123456789</p>
                    <div className="bg-slate-800 text-white font-bold py-1 my-2 uppercase">
                        {document.type === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
                    </div>
                    <p className="font-bold text-lg">{document.series} - {document.number}</p>
                </div>
            </div>

            {}
            <div className="border rounded-md p-3 mb-6 bg-slate-50">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="font-bold text-slate-600 block text-[10px] uppercase">Cliente:</span>
                        {}
                        <span>{sale.clientId ? `Cliente Registrado (ID: ${sale.clientId})` : "CLIENTE GENÉRICO / CONSUMIDOR FINAL"}</span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-600 block text-[10px] uppercase">Fecha de Emisión:</span>
                        <span>{formatDate(document.issueDate)}</span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-600 block text-[10px] uppercase">Moneda:</span>
                        <span>SOLES (PEN)</span>
                    </div>
                    <div>
                        <span className="font-bold text-slate-600 block text-[10px] uppercase">Forma de Pago:</span>
                        <span>{sale.paymentCondition}</span>
                    </div>
                </div>
            </div>

            {}
            <div className="mb-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-800 text-white text-left">
                            <th className="p-2 w-12 text-center">Cant.</th>
                            <th className="p-2 text-center">Und.</th>
                            <th className="p-2">Descripción</th>
                            <th className="p-2 text-right">P. Unit</th>
                            <th className="p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.details?.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-200">
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-center">NIU</td>
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
                <div className="w-1/3 space-y-2">
                    <div className="flex justify-between text-slate-600">
                        <span>Op. Gravada:</span>
                        <span>{formatCurrency(base)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>I.G.V. (18%):</span>
                        <span>{formatCurrency(igv)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-slate-900 border-t border-slate-800 pt-2">
                        <span>IMPORTE TOTAL:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            {}
            <div className="mt-8 border-t border-slate-300 pt-4 text-[10px] text-slate-500 text-center">
                <p>Representación impresa del Comprobante de Pago Electrónico.</p>
                <p>Consulte su documento en <strong>www.miempresa.com/consultas</strong></p>
                {document.digestValue && (
                     <p className="mt-1 font-mono">Hash: {document.digestValue}</p>
                )}
            </div>
        </div>
    );
};


interface SalesDocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale | null;
    document: SalesDocument | null;
}

export const SalesDocumentPreviewModal: React.FC<SalesDocumentPreviewModalProps> = ({ 
    open, 
    onOpenChange, 
    sale, 
    document 
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    if (!sale || !document) return null;

    const handleDownloadPdf = async () => {
        try {
            setIsLoading(true);
            const blob = await SalesDocumentService.downloadPdf(document.id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo descargar el PDF oficial del servidor.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] bg-slate-100 p-8 h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Vista Previa del Comprobante</DialogTitle>
                </DialogHeader>
                
                {}
                <div className="flex-1 overflow-y-auto bg-slate-200/50 p-4 rounded-md shadow-inner">
                    <div className="max-w-[700px] mx-auto bg-white shadow-xl min-h-[800px]">
                        <InvoiceTemplate sale={sale} document={document} />
                    </div>
                </div>

                {}
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-200">
                    <div className="text-sm text-slate-500">
                        Estado SUNAT: <span className="font-bold uppercase text-slate-800">{document.status}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                        <Button 
                            className="bg-slate-900 text-white hover:bg-slate-800"
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