import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Link as LinkIcon, AlertTriangle, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import { linkProductToDetail, convertToOrder, getQuotationById } from "@/api/services/quotation";
import { getProducts } from "@/api/services/products";


export const QuotationReviewAdmin: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  const quotationId = Number(id);


  const { data: quotation, isLoading: isLoadingQuotation, isError } = useQuery({
      queryKey: ['quotation', quotationId],
      queryFn: () => getQuotationById(quotationId),
      enabled: !!quotationId
  });


  const { data: products = [] } = useQuery({
      queryKey: ['products'],
      queryFn: getProducts
  });
  

  const linkMutation = useMutation({
    mutationFn: ({ detailId, productId }: { detailId: number, productId: number }) => 
       linkProductToDetail(quotationId, detailId, productId),
    onSuccess: () => {
        toast({ title: "Producto Vinculado", description: "El ítem ahora es parte oficial del catálogo." });
        queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
        setSelectedDetailId(null);
    }
  });


  const convertMutation = useMutation({
      mutationFn: () => convertToOrder(quotationId),
      onSuccess: () => {
          toast({ title: "¡Orden Creada!", description: "Se ha generado un borrador en Compras." });
          


          navigate('/purchases'); 
      },
      onError: (err: any) => {
          toast({ title: "Error", description: "No se pudo convertir", variant: "destructive" });
      }
  });

  if (isLoadingQuotation) return <div className="p-8 text-center">Cargando cotización...</div>;
  if (isError || !quotation) return <div className="p-8 text-center text-red-500">Error al cargar la cotización o no encontrada.</div>;


  const hasUnmappedItems = quotation.details.some((d: any) => !d.product);

  const handleLink = (productIdString: string) => {
     if(selectedDetailId) {
        linkMutation.mutate({ detailId: selectedDetailId, productId: Number(productIdString) });
     }
  };

  return (
    <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
                <ArrowLeft className="w-4 h-4 mr-2"/> Volver
            </Button>
            <h1 className="text-2xl font-bold">Revisión de Cotización</h1>
        </div>

        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
            <div>
                <h3 className="font-bold text-lg">Cotización #{quotation.id}</h3>
                <p className="text-sm text-gray-500">Proveedor: {quotation.supplier.name}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold">Total Estimado</p>
                <p className="text-2xl font-bold text-green-600">${quotation.totalEstimated?.toFixed(2)}</p>
            </div>
        </div>

        <Card>
            <CardHeader><CardTitle>Detalle de Productos</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Estado</TableHead>
                            <TableHead>Producto (Nombre)</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Precio Oferta</TableHead>
                            <TableHead>Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotation.details.map((detail: any) => {
                            const isMapped = !!detail.product;
                            return (
                                <TableRow key={detail.id} className={!isMapped ? "bg-orange-50" : ""}>
                                    <TableCell>
                                        {isMapped ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                                                <Check className="w-3 h-3 mr-1"/> Catalogado
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="bg-orange-500">
                                                <AlertTriangle className="w-3 h-3 mr-1"/> Sugerencia
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{detail.productName}</span>
                                        {detail.skuSuggestion && <div className="text-xs text-gray-500">Sugerencia SKU: {detail.skuSuggestion}</div>}
                                    </TableCell>
                                    <TableCell>{detail.quantity}</TableCell>
                                    <TableCell>${detail.quotedPrice}</TableCell>
                                    <TableCell>
                                        {!isMapped && (
                                            <Button size="sm" variant="outline" onClick={() => setSelectedDetailId(detail.id)}>
                                                <LinkIcon className="w-4 h-4 mr-2"/> Catalogar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {}
        <div className="flex justify-end pt-4 border-t">
            {hasUnmappedItems ? (
                <div className="flex items-center text-orange-600 bg-orange-100 p-3 rounded-md">
                    <AlertTriangle className="w-5 h-5 mr-2"/>
                    <span className="text-sm font-medium">Debes catalogar todos los productos nuevos antes de convertir a Orden.</span>
                </div>
            ) : (
                <Button 
                    onClick={() => convertMutation.mutate()} 
                    disabled={convertMutation.isPending || quotation.status === 'CONVERTIDO'}
                    className="bg-green-700 hover:bg-green-800"
                >
                    <ShoppingCart className="w-4 h-4 mr-2"/> 
                    {quotation.status === 'CONVERTIDO' ? 'Ya Convertida' : 'Aceptar y Convertir a Orden'}
                </Button>
            )}
        </div>

        {}
        <Dialog open={!!selectedDetailId} onOpenChange={(open) => !open && setSelectedDetailId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vincular Producto al Catálogo</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-gray-600">
                        El proveedor sugiere: <strong>"{quotation.details.find((d: any) => d.id === selectedDetailId)?.productName}"</strong>.
                        Selecciona a qué producto real de tu base de datos corresponde.
                    </p>
                    <Select onValueChange={handleLink}>
                        <SelectTrigger>
                            <SelectValue placeholder="Buscar en mi inventario..." />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((p: any) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name} - SKU: {p.sku}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-400 mt-2">
                        * Si el producto no existe, debes crearlo primero en la sección Productos.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
};