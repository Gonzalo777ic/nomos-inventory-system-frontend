import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sale, SaleReturnType, SaleReturnRequestPayload } from "@/types/store";
import { SaleReturnService } from "@/api/services/saleReturnService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SaleReturnFormProps {
    sale: Sale | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const SaleReturnForm: React.FC<SaleReturnFormProps> = ({ 
    sale, 
    open, 
    onOpenChange, 
    onSuccess 
}) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    

    const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
    const [reason, setReason] = useState("");


    useEffect(() => {
        if (open && sale) {
            const initialQtys: Record<number, number> = {};

            sale.details?.forEach(d => initialQtys[d.id] = 0);
            setReturnQuantities(initialQtys);
            setReason("");
        }
    }, [open, sale]);

    const handleQuantityChange = (detailId: number, max: number, value: string) => {
        let val = Number(value);
        if (val < 0) val = 0;
        if (val > max) val = max; 
        setReturnQuantities(prev => ({ ...prev, [detailId]: val }));
    };

    const handleSubmitReturn = async () => {
        if (!sale || !reason.trim()) {
            toast({ title: "Faltan datos", description: "Ingrese el motivo de la devolución.", variant: "destructive" });
            return;
        }


        const itemsToReturn = Object.entries(returnQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([detailId, qty]) => ({
                originalDetailId: Number(detailId),
                quantity: qty
            }));

        if (itemsToReturn.length === 0) {
            toast({ title: "Sin items", description: "Seleccione al menos un producto para devolver.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {

            const totalOriginalQty = sale.details?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
            const totalReturnQty = itemsToReturn.reduce((acc, curr) => acc + curr.quantity, 0);
            
            const type: SaleReturnType = totalReturnQty === totalOriginalQty ? 'TOTAL' : 'PARTIAL';

            const payload: SaleReturnRequestPayload = {
                saleId: sale.id,
                reason: reason,
                type: type,
                items: itemsToReturn
            };


            const draft = await SaleReturnService.createDraft(payload);
            

            await SaleReturnService.confirm(draft.id);

            toast({
                title: "Devolución Procesada",
                description: `Se ha generado la Nota de Crédito correctamente.`,
            });

            onOpenChange(false);
            onSuccess();

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo procesar la devolución.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Registrar Devolución - Venta #{sale.id}</DialogTitle>
                    <DialogDescription>
                        Seleccione los productos a devolver. Se generará una Nota de Crédito automáticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {}
                    <div className="grid grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-md border">
                        <div>
                            <span className="block font-bold text-slate-500">Cliente</span>
                            {sale.clientId ? `ID: ${sale.clientId}` : 'Consumidor Final'}
                        </div>
                        <div>
                            <span className="block font-bold text-slate-500">Fecha Venta</span>
                            {new Date(sale.saleDate).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="block font-bold text-slate-500">Total Venta</span>
                             S/ {sale.totalAmount.toFixed(2)}
                        </div>
                    </div>

                    {}
                    <div className="border rounded-md max-h-[300px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                    <TableHead className="text-center">Comprado</TableHead>
                                    <TableHead className="w-[120px] text-center bg-red-50 text-red-700">A Devolver</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.details?.map((detail) => (
                                    <TableRow key={detail.id}>
                                        <TableCell>
                                            <span className="font-medium">ID: {detail.productId}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            S/ {detail.unitPrice.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {detail.quantity}
                                        </TableCell>
                                        <TableCell className="bg-red-50/50">
                                            <Input 
                                                type="number"
                                                min={0}
                                                max={detail.quantity}
                                                value={returnQuantities[detail.id] || 0}
                                                onChange={(e) => handleQuantityChange(detail.id, detail.quantity, e.target.value)}
                                                className="h-8 text-center border-red-200 focus-visible:ring-red-500"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {}
                    <div className="space-y-2">
                        <Label>Motivo de la Devolución <span className="text-red-500">*</span></Label>
                        <Textarea 
                            placeholder="Ej: Producto defectuoso, Cambio de opinión..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Acción Irreversible</AlertTitle>
                        <AlertDescription className="text-amber-700 text-xs">
                            Al confirmar, el inventario retornará al almacén y se emitirá un documento fiscal.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSubmitReturn} 
                        disabled={isLoading || !reason}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar y Emitir Nota de Crédito
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};