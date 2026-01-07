import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Eye, FileText, Edit, Send, XCircle, AlertTriangle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


import { 
    getQuotations, 
    createQuotation, 
    updateQuotation, 
    changeQuotationStatus 
} from "@/api/services/quotation"; 

import { useAuth } from "@/hooks/useAuth";
import { Quotation, QuotationPayload } from "@/types/index";
import { QuotationFormSupplier } from "@/components/forms/QuotationFormSupplier";

const Quotations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  const userRoles = (user as any)?.["https://nomosstore.com/roles"] || [];
  const isSupplier = userRoles.some((r: string) => r.includes("PROVEEDOR") || r.includes("SUPPLIER"));
  const supplierId = (user as any)?.supplierId || 1; 


  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  

  const [confirmSendId, setConfirmSendId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);


  const queryParams = isSupplier ? { supplierId } : undefined;
  const { data: quotations, isLoading } = useQuery({ 
      queryKey: ['quotations', queryParams], 
      queryFn: () => getQuotations(queryParams) 
  });


  const createMutation = useMutation({
      mutationFn: createQuotation,
      onSuccess: () => {
          toast.success("Borrador creado exitosamente");
          queryClient.invalidateQueries({ queryKey: ['quotations'] });
          setIsCreateOpen(false);
      },
      onError: () => toast.error("Error al crear la cotización")
  });

  const updateMutation = useMutation({
      mutationFn: (data: QuotationPayload) => updateQuotation(editingQuotation!.id, data),
      onSuccess: () => {
          toast.success("Cotización actualizada");
          queryClient.invalidateQueries({ queryKey: ['quotations'] });
          setEditingQuotation(null);
      },
      onError: () => toast.error("Error al actualizar")
  });

  const statusMutation = useMutation({
      mutationFn: ({id, status}: {id: number, status: string}) => changeQuotationStatus(id, status),
      onSuccess: (_, variables) => {
          const action = variables.status === 'ENVIADO' ? 'enviada' : 'cancelada';
          toast.success(`Cotización ${action} correctamente`);
          queryClient.invalidateQueries({ queryKey: ['quotations'] });
          

          setConfirmSendId(null);
          setConfirmCancelId(null);
      },
      onError: () => toast.error("No se pudo cambiar el estado")
  });


  const renderActions = (q: Quotation) => {

      if (!isSupplier) {
          return (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/quotations/review/${q.id}`)}
              >
                  <Eye className="w-4 h-4 mr-2"/> Revisar
              </Button>
          );
      }


      if (q.status === 'BORRADOR') {
          return (
              <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setEditingQuotation(q)}
                  >
                      <Edit className="w-4 h-4 mr-2"/> Editar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => setConfirmSendId(q.id)}
                  >
                      <Send className="w-4 h-4 mr-2"/> Enviar
                  </Button>
              </div>
          );
      } 
      
      if (q.status === 'ENVIADO') {
           return (
               <Button 
                size="sm" 
                variant="destructive" 

                onClick={() => setConfirmCancelId(q.id)}
               >
                   <XCircle className="w-4 h-4 mr-2"/> Cancelar
               </Button>
           );
      }

      return (
          <Button variant="ghost" size="sm" onClick={() => toast("Esta cotización es de solo lectura.")}>
              <FileText className="w-4 h-4 mr-2"/> Ver Detalle
          </Button>
      );
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Cargando cotizaciones...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Solicitudes de Presupuesto (Cotizaciones)</h1>
        
        {isSupplier && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4"/> Crear Nueva Oferta
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nueva Cotización / Oferta</DialogTitle>
                    </DialogHeader>
                    <QuotationFormSupplier 
                        supplierId={supplierId} 
                        isLoading={createMutation.isPending}
                        onSubmit={(data) => createMutation.mutate(data)} 
                    />
                </DialogContent>
            </Dialog>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Historial de Cotizaciones</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Total Est.</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(!quotations || quotations.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                No hay cotizaciones registradas.
                            </TableCell>
                        </TableRow>
                    )}
                    {quotations?.map(q => (
                        <TableRow key={q.id}>
                            <TableCell className="font-medium">#{q.id}</TableCell>
                            <TableCell>{q.supplier?.name || "Desconocido"}</TableCell>
                            <TableCell>{q.requestDate}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    q.status === 'CONVERTIDO' ? 'default' : 
                                    q.status === 'BORRADOR' ? 'secondary' :
                                    q.status === 'ENVIADO' ? 'outline' : 'destructive'
                                }>
                                    {q.status}
                                </Badge>
                            </TableCell>
                            <TableCell>${q.totalEstimated?.toFixed(2)}</TableCell>
                            <TableCell>
                                {renderActions(q)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {}
      <Dialog open={!!editingQuotation} onOpenChange={(open) => !open && setEditingQuotation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Editar Borrador #{editingQuotation?.id}</DialogTitle>
              </DialogHeader>
              {editingQuotation && (
                  <QuotationFormSupplier 
                      supplierId={supplierId}
                      initialData={editingQuotation} 
                      isLoading={updateMutation.isPending}
                      onSubmit={(data) => updateMutation.mutate(data)}
                  />
              )}
          </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!confirmSendId} onOpenChange={(open) => !open && setConfirmSendId(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar Envío
                </DialogTitle>
                <DialogDescription>
                    ¿Estás seguro de que deseas enviar esta cotización? 
                    <br/>
                    Una vez enviada, <strong>ya no podrás editarla</strong> y será visible para el administrador.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setConfirmSendId(null)}>
                    Cancelar
                </Button>
                <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                        if (confirmSendId) {
                            statusMutation.mutate({ id: confirmSendId, status: 'ENVIADO' });
                        }
                    }}
                    disabled={statusMutation.isPending}
                >
                    {statusMutation.isPending ? "Enviando..." : "Sí, Enviar Cotización"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Cancelar Solicitud
                </DialogTitle>
                <DialogDescription>
                    ¿Deseas cancelar esta cotización enviada?
                    <br/>
                    El administrador será notificado y el proceso se detendrá. Esta acción no se puede deshacer.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
                <Button variant="outline" onClick={() => setConfirmCancelId(null)}>
                    Volver
                </Button>
                <Button 
                    variant="destructive"
                    onClick={() => {
                        if (confirmCancelId) {
                            statusMutation.mutate({ id: confirmCancelId, status: 'CANCELADO' });
                        }
                    }}
                    disabled={statusMutation.isPending}
                >
                    {statusMutation.isPending ? "Cancelando..." : "Sí, Cancelar Definitivamente"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Quotations;