import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditDocumentPayload } from "@/types/store";
import { Printer } from "lucide-react";


const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

const formatDateLong = (dateStr: string) => {
    if (!dateStr) return "___";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};


const PagareTemplate = ({ data }: { data: Partial<CreditDocumentPayload> }) => (
    <div className="border-[3px] border-slate-800 p-8 bg-[#fdfbf7] text-slate-900 font-serif shadow-sm h-full flex flex-col justify-between">
        
        {/* HEADER: Título y Datos Clave */}
        <div className="mb-8">
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2">
                
                {/* IZQUIERDA: TÍTULO Y VENCIMIENTO */}
                <div>
                    <div className="border-2 border-slate-800 px-6 py-1 inline-block mb-2">
                        <h1 className="text-4xl font-black tracking-[0.1em] uppercase">PAGARÉ</h1>
                    </div>
                    <div className="text-sm font-bold mt-1 pl-1">
                        <span className="uppercase text-slate-500 mr-2">Vencimiento:</span>
                        <span className="text-slate-900 border-b border-dotted border-slate-400 min-w-[120px] inline-block">
                            {formatDateLong(data.dueDate || "")}
                        </span>
                    </div>
                </div>

                {/* DERECHA: LUGAR PAGO Y MONTO */}
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-sm font-bold w-full">
                        <span className="uppercase text-slate-500 mr-2">Lugar de Pago:</span>
                        <span className="border-b border-slate-800 min-w-[200px] inline-block text-center uppercase">
                            {data.placeOfPayment || "________________"}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 bg-slate-100 px-3 py-1 border border-slate-300 rounded-sm shadow-inner">
                        <span className="text-xs font-bold text-slate-500 uppercase">Valor Nominal</span>
                        <span className="text-2xl font-bold font-mono text-slate-900 tracking-wide">
                            {formatCurrency(data.amount || 0)}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* SUB-HEADER LEGAL */}
            <div className="text-center text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-sans">
                Por este pagaré me comprometo a pagar el día del vencimiento indicado
            </div>
        </div>

        {/* CUERPO PRINCIPAL (TEXTO LEGAL) */}
        <div className="space-y-6 text-base leading-loose text-justify px-4">
            <p>
                Yo, <span className="font-bold uppercase border-b border-dotted border-slate-400 px-2 min-w-[200px] inline-block text-center">{data.debtorName || "____________________"}</span>, 
                identificado con DNI/RUC N° <span className="font-bold border-b border-dotted border-slate-400 px-2 min-w-[100px] inline-block text-center">{data.debtorIdNumber || "___________"}</span>, 
                me obligo incondicionalmente a pagar a la orden de <span className="font-bold uppercase">MI EMPRESA S.A.C.</span>, 
                la suma de <span className="font-bold bg-yellow-50/50 px-2 border-b border-yellow-200">{formatCurrency(data.amount || 0)}</span>.
            </p>

            {/* CONDICIONAL: CLÁUSULAS (Solo si existen) */}
            {data.legalNotes && (
                <div className="mt-4 p-3 bg-slate-50 border-l-4 border-slate-400 text-sm italic text-slate-700">
                    <span className="font-bold not-italic text-slate-900 block text-xs uppercase mb-1">Cláusulas Especiales:</span>
                    {data.legalNotes}
                </div>
            )}
        </div>

        {/* PIE: LUGARES Y FIRMAS */}
        <div className="mt-8 border-t-2 border-slate-800 pt-4">
            <div className="grid grid-cols-2 gap-8 items-end">
                
                {/* IZQUIERDA: FECHA EMISIÓN */}
                <div className="text-sm font-sans">
                    <span className="block font-bold uppercase text-slate-500 text-xs mb-1">Lugar y Fecha de Emisión</span>
                    <span className="font-medium uppercase border-b border-slate-400 inline-block min-w-[150px]">
                        {data.placeOfIssue || "_______"}, {formatDateLong(data.issueDate || "")}
                    </span>
                </div>

                {/* DERECHA: FIRMA */}
                <div className="text-center">
                    <div className="h-16 border-b border-slate-900 mb-2 w-3/4 mx-auto relative">
                        {/* Espacio para firmar */}
                        <span className="absolute bottom-1 right-0 text-[8px] text-slate-400">ACEPTO</span>
                    </div>
                    <p className="font-bold text-xs uppercase">Firma del Deudor / Aceptante</p>
                    <p className="text-[10px] text-slate-500">{data.debtorIdNumber}</p>
                </div>
            </div>
        </div>
    </div>
);


const LetraCambioTemplate = ({ data }: { data: Partial<CreditDocumentPayload> }) => (
    <div className="border border-green-700 p-6 bg-[#eef7ee] text-green-900 font-sans relative overflow-hidden h-full flex flex-col justify-between">
       {/* ... (código anterior de la Letra) ... */}
       {/* Se mantiene idéntico al anterior que ya funcionaba bien */}
       <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <span className="text-[150px] font-black uppercase text-green-900">LETRA</span>
        </div>

        <div className="relative z-10">
            <div className="flex justify-between border-b-2 border-green-700 pb-2 mb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">LETRA DE CAMBIO</h2>
                    <p className="text-xs uppercase font-bold text-green-700/70">Nro: {data.documentNumber || "_______"}</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold mr-2">POR:</span>
                    <span className="text-2xl font-mono font-bold bg-white px-3 py-1 border border-green-600 shadow-inner">
                        {formatCurrency(data.amount || 0)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mb-4 border-b border-green-700/30 pb-4">
                <div className="bg-green-100/50 p-2 border border-green-200">
                    <span className="block font-bold opacity-60">LUGAR DE GIRO</span>
                    <span className="uppercase font-semibold">{data.placeOfIssue}</span>
                </div>
                <div className="bg-green-100/50 p-2 border border-green-200">
                    <span className="block font-bold opacity-60">FECHA DE GIRO</span>
                    <span className="uppercase font-semibold">{formatDateLong(data.issueDate || "")}</span>
                </div>
                <div className="bg-green-100/50 p-2 border border-green-200">
                    <span className="block font-bold opacity-60">VENCIMIENTO</span>
                    <span className="uppercase font-semibold text-red-600">{formatDateLong(data.dueDate || "")}</span>
                </div>
            </div>

            <div className="mb-6 space-y-4 text-sm font-medium leading-relaxed">
                <p>
                    Se servirá Ud. pagar incondicionalmente por esta <strong>LETRA DE CAMBIO</strong> a la orden de 
                    <span className="mx-1 border-b border-green-800 uppercase px-1">MI EMPRESA S.A.C.</span>
                </p>
                <p>
                    La cantidad de: <span className="italic bg-white px-2 py-0.5 border border-green-200 w-full inline-block mt-1">
                        ** {formatCurrency(data.amount || 0)} **
                    </span>
                </p>
                <p>
                    Lugar de Pago: <span className="uppercase">{data.placeOfPayment || "________________"}</span>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 border-t-2 border-green-700 pt-4">
                <div className="border-r border-green-700 pr-4">
                    <p className="text-[10px] font-bold uppercase mb-1">A CARGO DE (GIRADO):</p>
                    <div className="bg-white border border-green-300 p-2 h-24 text-xs">
                        <p className="font-bold uppercase">{data.debtorName}</p>
                        <p>DNI/RUC: {data.debtorIdNumber}</p>
                        <p className="mt-2 text-green-600/60 text-[10px]">Dirección...</p>
                    </div>
                </div>

                <div className="pl-2">
                    <p className="text-[10px] font-bold uppercase mb-1">AVAL / GARANTE:</p>
                    {data.guarantorName ? (
                        <div className="bg-white border border-green-300 p-2 h-24 text-xs flex flex-col justify-between">
                            <div>
                                <p className="font-bold uppercase">{data.guarantorName}</p>
                                <p>Firma: _________________</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 border border-dashed border-green-300 flex items-center justify-center text-[10px] text-green-400">
                            SIN AVAL
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);


interface DocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: Partial<CreditDocumentPayload>;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ open, onOpenChange, data }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Ancho máximo para horizontalidad */}
            <DialogContent className="max-w-[900px] bg-slate-100 p-8">
                <DialogHeader className="mb-4">
                    <DialogTitle>Vista Previa del Documento</DialogTitle>
                </DialogHeader>
                
                {/* Contenedor con altura mínima para asegurar aspecto de papel apaisado */}
                <div className="w-full mx-auto bg-white shadow-2xl p-8 min-h-[500px]">
                    {data.type === 'PAGARE' ? (
                        <PagareTemplate data={data} />
                    ) : (
                        <LetraCambioTemplate data={data} />
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    <Button variant="default" className="bg-slate-800 text-white hover:bg-slate-700">
                        <Printer className="w-4 h-4 mr-2"/> Imprimir PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};