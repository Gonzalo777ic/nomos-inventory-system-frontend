import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Loader2,
  Send,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  XCircle,
  ThumbsUp,
  Truck,
  Ban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

import {
  getPurchaseOrders,
  getPurchaseOrderById,
  updateOrderStatus,
} from "@/api/services/purchase-order";
import { getSuppliers } from "@/api/services/supplier";

import { PurchaseOrder, OrderStatus, Supplier } from "@/types/index";
import PurchaseOrderForm from "@/components/forms/PurchaseOrderForm";
import { useAuth } from "@/hooks/useAuth";

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const userRoles = (user as any)?.["https://nomosstore.com/roles"] || [];
  

  const isSupplier = userRoles.some((role: string) =>
    ["ROLE_PROVEEDOR", "PROVEEDOR", "Supplier", "ROLE_SUPPLIER"].includes(role)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);


  const { data: orders, isLoading: isLoadingOrders } = useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders"],
    queryFn: () => getPurchaseOrders(),
    staleTime: 60000,
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
    staleTime: Infinity,
    enabled: !isSupplier,
  });

  const { data: rawOrderForEditing, isLoading: isLoadingSingleOrder } =
    useQuery<PurchaseOrder | undefined>({
      queryKey: ["purchase-orders", editingOrderId],
      queryFn: () =>
        editingOrderId ? getPurchaseOrderById(editingOrderId) : undefined,
      enabled: !!editingOrderId && isModalOpen,
      staleTime: 0,
    });


  const mutationStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast({ title: "Estado actualizado correctamente", variant: "default" });
    },
    onError: () => {
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    },
  });


  const defaultPurchaseOrder = useMemo(() => {
    if (
      !rawOrderForEditing ||
      !rawOrderForEditing.supplier ||
      !Array.isArray(rawOrderForEditing.details)
    ) {
      return undefined;
    }
    return rawOrderForEditing;
  }, [rawOrderForEditing]);


  const filterOrders = (statusGroup: "active" | "closed") => {
    const validOrders = orders || [];
    switch (statusGroup) {
      case "active":

        return validOrders.filter((o) =>
          ["BORRADOR", "PENDIENTE", "CONFIRMADO"].includes(o.status)
        );
      case "closed":

        return validOrders.filter((o) =>
          ["COMPLETO", "CANCELADO", "RECHAZADO"].includes(o.status)
        );
      default:
        return [];
    }
  };

  const currentOrders = filterOrders(activeTab as "active" | "closed");


  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "BORRADOR":
        return (
          <Badge variant="secondary" className="text-gray-600 bg-gray-200 border-gray-300">
            <Edit className="w-3 h-3 mr-1" /> Borrador
          </Badge>
        );
      case "PENDIENTE":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-3 h-3 mr-1" /> Enviado
          </Badge>
        );
      case "CONFIRMADO":
        return (
          <Badge className="bg-purple-600 hover:bg-purple-700">
            <ThumbsUp className="w-3 h-3 mr-1" /> Confirmado
          </Badge>
        );
      case "RECHAZADO":
        return (
          <Badge variant="destructive" className="bg-red-600">
            <Ban className="w-3 h-3 mr-1" /> Rechazado
          </Badge>
        );
      case "COMPLETO":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" /> Recibido
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700 text-white">
            <XCircle className="w-3 h-3 mr-1" /> Cancelado
          </Badge>
        );
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

  const handleSupplierAction = (id: number, newStatus: OrderStatus) => {
    mutationStatus.mutate({ id, status: newStatus });
  };

  const ModalContent = useMemo(() => {
    if (!isModalOpen) return null;
    const isEditing = !!editingOrderId;

    if (isEditing && isLoadingSingleOrder) {
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <span className="text-gray-600">Cargando detalles...</span>
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
  }, [
    isModalOpen,
    editingOrderId,
    isLoadingSingleOrder,
    defaultPurchaseOrder,
    isReadOnlyMode,
  ]);

  if (isLoadingOrders) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {isSupplier ? "Mis Pedidos Entrantes" : "Órdenes de Abastecimiento"}
        </h1>

        {}
        {!isSupplier && (
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
                    ? isReadOnlyMode
                      ? `Detalle de Orden OC-${editingOrderId}`
                      : `Editar Orden OC-${editingOrderId}`
                    : "Crear Nueva Orden de Compra"}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">{ModalContent}</div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs
        defaultValue="active"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Activas ({filterOrders("active").length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Completadas/Canceladas ({filterOrders("closed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                Listado de Órdenes{" "}
                {isSupplier && "(Filtrado automático por Proveedor)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  No hay órdenes en esta categoría.
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
                        const supplierName = order.supplier?.name || "---";


                        const isEditableInternal =
                          !isSupplier && ["BORRADOR", "PENDIENTE"].includes(order.status);

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              OC-{order.id}
                            </TableCell>
                            <TableCell>{supplierName}</TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.deliveryDate}</TableCell>
                            <TableCell>
                              ${order.totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell className="text-right space-x-2 flex justify-end">
                              
                              {}
                              {isSupplier && order.status === "PENDIENTE" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleSupplierAction(order.id, "CONFIRMADO")}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" /> Aceptar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleSupplierAction(order.id, "RECHAZADO")}
                                  >
                                    <Ban className="w-4 h-4 mr-1" /> Rechazar
                                  </Button>
                                </>
                              )}

                              {isSupplier && order.status === "CONFIRMADO" && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => toast({ title: "Función de envío en construcción" })}
                                >
                                  <Truck className="w-4 h-4 mr-1" /> Enviar
                                </Button>
                              )}

                              {}
                              {!isSupplier && (
                                <>
                                  {}
                                  {order.status === "BORRADOR" && (
                                    <Button
                                      size="sm"
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                      onClick={() => mutationStatus.mutate({ id: order.id, status: "PENDIENTE" })}
                                    >
                                      <Send className="w-4 h-4 mr-1" /> Enviar a Prov.
                                    </Button>
                                  )}

                                  {}
                                  {order.status === "CONFIRMADO" && (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => mutationStatus.mutate({ id: order.id, status: "COMPLETO" })}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" /> Recibir Todo
                                    </Button>
                                  )}

                                  {}
                                  {["BORRADOR", "PENDIENTE", "CONFIRMADO"].includes(order.status) && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="Cancelar Orden Administrativamente"
                                        onClick={() => mutationStatus.mutate({ id: order.id, status: 'CANCELADO' })}
                                      >
                                        <XCircle className="w-4 h-4"/>
                                      </Button>
                                  )}

                                  {}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditOrView(order.id, isEditableInternal)}
                                  >
                                    {isEditableInternal ? (
                                      <Edit className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </Button>
                                </>
                              )}

                              {}
                              {isSupplier && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditOrView(order.id, false)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card>
            <CardHeader>
              <CardTitle>Historial Cerrado</CardTitle>
            </CardHeader>
            <CardContent>
              {filterOrders("closed").length === 0 ? (
                 <p className="text-center text-gray-500 py-10">
                   No hay historial de órdenes cerradas.
                 </p>
              ) : (
                 <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterOrders("closed").map((order) => (
                          <TableRow key={order.id} className="opacity-75">
                             <TableCell>OC-{order.id}</TableCell>
                             <TableCell>{order.supplier?.name}</TableCell>
                             <TableCell>{order.orderDate}</TableCell>
                             <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                             <TableCell>{getStatusBadge(order.status)}</TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleEditOrView(order.id, false)}>
                                   <Eye className="w-4 h-4 mr-1"/> Ver
                                </Button>
                             </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Purchases;