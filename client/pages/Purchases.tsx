import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Loader2, Send, CheckCircle, Clock, Eye, Edit, XCircle } from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge'; 


import { getPurchaseOrders, getPurchaseOrderById } from '@/api/services/purchase-order';

import { PurchaseOrder, OrderStatus, Supplier } from '@/types/index'; 
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm'; 


import { getSuppliers } from '@/api/services/supplier';




type PurchaseOrderMappedForForm = PurchaseOrder; 


const Purchases: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [activeTab, setActiveTab] = useState('active');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null); 
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false); 


  const { data: orders, isLoading: isLoadingOrders } = useQuery<PurchaseOrder[]>({
    queryKey: ['purchase-orders'],
    queryFn: getPurchaseOrders,
    staleTime: 60000, 
  });
  

  const { data: suppliers } = useQuery<Supplier[]>({
      queryKey: ['suppliers'],
      queryFn: getSuppliers,
      staleTime: Infinity,
  });



  const { data: rawOrderForEditing, isLoading: isLoadingSingleOrder } = useQuery<PurchaseOrder | undefined>({
      queryKey: ['purchase-orders', editingOrderId],
      queryFn: () => editingOrderId ? getPurchaseOrderById(editingOrderId) : undefined, 
      enabled: !!editingOrderId && isModalOpen, 
      staleTime: 0, 
  });



  const defaultPurchaseOrder: PurchaseOrderMappedForForm | undefined = useMemo(() => {

      if (!rawOrderForEditing || !rawOrderForEditing.supplier || !Array.isArray(rawOrderForEditing.details)) {
          return undefined;
      }
      

      return rawOrderForEditing;

  }, [rawOrderForEditing]);



  const filterOrders = (statusGroup: 'active' | 'closed') => {
    const validOrders = orders || [];

    switch (statusGroup) {
      case 'active':
        return validOrders.filter(o => 
          o.status === 'PENDIENTE' || o.status === 'RECIBIDO_PARCIAL'
        );
      case 'closed':
        return validOrders.filter(o => o.status === 'COMPLETO' || o.status === 'CANCELADO');
      default:
        return [];
    }
  };
  
  const currentOrders = filterOrders(activeTab as 'active' | 'closed');


  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white"><Send className="w-3 h-3 mr-1"/> Pendiente</Badge>; 
      case 'RECIBIDO_PARCIAL':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black"><Clock className="w-3 h-3 mr-1"/> Recibido Parcial</Badge>; 
      case 'COMPLETO':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="w-3 h-3 mr-1"/> Completa</Badge>;
      case 'CANCELADO':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/> Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleModalClose = () => {
      setIsModalOpen(false);
      setEditingOrderId(null); 
      setIsReadOnlyMode(false);
  };

  const handleEditOrView = (id: number, isEditable: boolean) => {
      setEditingOrderId(id); 
      setIsReadOnlyMode(!isEditable);
      setIsModalOpen(true);  
  };

  const handleNewOrder = () => {
      setEditingOrderId(null); 
      setIsReadOnlyMode(false); 
      setIsModalOpen(true);
  };
  

  const ModalContent = useMemo(() => {
      if (!isModalOpen) return null;

      const isEditing = !!editingOrderId;
      

      if (isEditing && isLoadingSingleOrder) {
          return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3"/> 
              <span className="text-gray-600">Cargando detalles de OC-{editingOrderId}...</span>
            </div>
          );
      }
      

      if (isEditing && !defaultPurchaseOrder && !isLoadingSingleOrder) {
         return (
             <div className="p-8 text-center text-red-500">
                 Error: No se pudo cargar la orden de compra o su proveedor. Intente nuevamente.
             </div>
         );
      }


      return (
        <PurchaseOrderForm 
            defaultPurchaseOrder={isEditing ? defaultPurchaseOrder : undefined} 
            onSuccess={handleModalClose} 
            readOnly={isReadOnlyMode} 
        />
      );
  }, [isModalOpen, editingOrderId, isLoadingSingleOrder, defaultPurchaseOrder, isReadOnlyMode]);



  if (isLoadingOrders || !suppliers) {
       return (
          <div className="flex justify-center items-center h-full min-h-[500px] p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Cargando Órdenes...</span>
          </div>
      );
  }


  return (
    <div className="p-8 dark:bg-gray-800 rounded-lg min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Órdenes de Abastecimiento</h1>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewOrder}>
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva OC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrderId 
                    ? (isReadOnlyMode ? `Detalle de Orden OC-${editingOrderId}` : `Editar Orden OC-${editingOrderId}`) 
                    : "Crear Nueva Orden de Compra"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {ModalContent}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {}
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Activas ({filterOrders('active').length})</TabsTrigger>
          <TabsTrigger value="closed">Completadas/Canceladas ({filterOrders('closed').length})</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Listado de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              {currentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No hay órdenes de compra en esta categoría.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Fecha Orden</TableHead>
                        <TableHead>Entrega Esperada</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => {


                          const supplierName = order.supplier?.name || `ID: ${order.supplier?.id || 'N/A'}`;
                          

                          const isEditable = order.status === 'PENDIENTE';

                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">OC-{order.id}</TableCell>
                              <TableCell>{supplierName}</TableCell> 
                              <TableCell>{order.orderDate}</TableCell>
                              <TableCell>{order.deliveryDate}</TableCell>
                              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditOrView(order.id, isEditable)}
                                >
                                    {isEditable ? <><Edit className="w-4 h-4 mr-1"/> Editar</> : <><Eye className="w-4 h-4 mr-1"/> Ver Detalle</>}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="closed">
             {}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Purchases;