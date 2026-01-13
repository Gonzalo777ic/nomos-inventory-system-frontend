import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditDocumentPayload } from "@/types/store";
import { generatePreviewContent } from "@/utils/legalTemplates";
import { Printer } from "lucide-react";

interface DocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Partial<CreditDocumentPayload>;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ open, onOpenChange, data }) => {
    const { title, content } = generatePreviewContent(data);
    const isPagare = data.type === 'PAGARE';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-slate-50">
                <DialogHeader>
                    <DialogTitle>Vista Previa del Documento</DialogTitle>
                </DialogHeader>
                
                {}
                <div className={`
                    relative p-8 border-4 border-double rounded-lg shadow-lg bg-white 
                    min-h-[400px] flex flex-col
                    ${isPagare ? 'border-green-600/30' : 'border-blue-600/30'}
                `}>
                    {}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <span className="text-9xl font-black uppercase transform -rotate-12">
                            {data.type}
                        </span>
                    </div>

                    {}
                    <div className="flex justify-between items-start mb-8 border-b pb-4">
                        <div className="border-2 border-black p-2 px-4 font-bold text-xl uppercase tracking-widest">
                            {title}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Valor Nominal</div>
                            <div className="text-2xl font-mono font-bold text-slate-800">
                                S/ {data.amount?.toFixed(2) || "0.00"}
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="flex-grow space-y-6 font-serif text-lg leading-loose text-justify px-4 whitespace-pre-line">
                        {content}
                    </div>

                    {}
                    <div className="mt-12 grid grid-cols-2 gap-12 pt-8">
                        <div className="border-t border-black pt-2 text-center">
                            <p className="font-bold text-sm uppercase">{data.debtorName || "Firma Deudor"}</p>
                            <p className="text-xs text-gray-500">{data.debtorIdNumber || "DNI"}</p>
                            <p className="text-xs font-bold mt-1">ACEPTANTE / DEUDOR</p>
                        </div>
                        
                        {!isPagare && (
                            <div className="border-t border-black pt-2 text-center">
                                <p className="font-bold text-sm uppercase">MI EMPRESA S.A.C.</p>
                                <p className="text-xs font-bold mt-1">EMISOR / GIRADOR</p>
                            </div>
                        )}
                        
                        {data.guarantorName && (
                            <div className="border-t border-black pt-2 text-center col-span-2 w-1/2 mx-auto mt-4">
                                <p className="font-bold text-sm uppercase">{data.guarantorName}</p>
                                <p className="text-xs font-bold mt-1">AVAL / GARANTE</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar Vista Previa</Button>
                    <Button variant="default" disabled><Printer className="w-4 h-4 mr-2"/> Imprimir (Próximamente)</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};