import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  DollarSign,
  User,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";

import { AccountsReceivableService } from "@/api/services/accountsReceivableService";
import { AccountsReceivable } from "@/types/store";
import { PaymentRegistrationForm } from "@/components/forms/PaymentRegistrationForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const {
    data: ar,
    isLoading,
    error,
    refetch,
  } = useQuery<AccountsReceivable>({
    queryKey: ["accounts-receivable", id],
    queryFn: () => AccountsReceivableService.getById(Number(id)),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="p-10 text-center">Cargando detalles financieros...</div>
    );
  if (error || !ar)
    return (
      <div className="p-10 text-center text-red-500">
        No se encontró la cuenta por cobrar.
      </div>
    );

  const paidAmount = ar.installments.reduce(
    (sum, i) => sum + (i.paidAmount || 0),
    0,
  );
  const balance = ar.totalAmount - paidAmount;
  const percentage = (paidAmount / ar.totalAmount) * 100;
  const isFullyPaid = balance <= 0.01;
  const isCancelled = ar.status === "CANCELLED";


  const getCreditStartDate = () => {

    if (ar.sale?.paymentCondition !== 'CREDITO') return null;


    const firstInst = ar.installments.find(i => i.number === 1);
    

    if (!firstInst) return new Date(ar.sale?.saleDate || "").toLocaleDateString();


    const [y, m, d] = firstInst.dueDate.toString().split('-').map(Number);

    const startDate = new Date(y, m - 2, d); 
    
    return startDate.toLocaleDateString();
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    refetch();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Cuenta por Cobrar #{ar.id}
              {isCancelled && <Badge variant="destructive">ANULADA</Badge>}
              {isFullyPaid && <Badge className="bg-green-600">PAGADA</Badge>}
            </h1>
            <p className="text-sm text-muted-foreground">
              Asociada a Venta #{ar.sale?.id}
            </p>
          </div>
        </div>

        {!isFullyPaid && !isCancelled && (
          <Button
            onClick={() => setIsPaymentOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Registrar Nuevo Pago
          </Button>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deuda Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ar.totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abonado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${paidAmount.toFixed(2)}
            </div>
            <Progress value={percentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card
          className={
            balance > 0 ? "bg-red-50 border-red-100 dark:bg-red-900/10" : ""
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${balance > 0 ? "text-red-600" : "text-gray-600"}`}
            >
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="font-medium text-sm">
                ID: {ar.sale?.clientId || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                Consumidor Final
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Cronograma de Cuotas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Monto Cuota</TableHead>
                    <TableHead className="text-right text-red-600">
                      Mora
                    </TableHead>
                    <TableHead className="text-right">Pagado</TableHead>
                    <TableHead className="text-right">Pendiente</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ar.installments.map((inst) => {
                    const pending =
                      inst.expectedAmount - (inst.paidAmount || 0);
                    const dueDateObj = new Date(inst.dueDate);
                    const endOfDueDate = new Date(
                      dueDateObj.getUTCFullYear(),
                      dueDateObj.getUTCMonth(),
                      dueDateObj.getUTCDate(),
                      23,
                      59,
                      59,
                    );
                    const isLate =
                      inst.status !== "PAID" && new Date() > endOfDueDate;

                    const penalty = inst.penaltyAmount || 0;

                    return (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">
                          {inst.number}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${isLate ? "text-red-600 font-semibold" : ""}`}
                          >
                            {inst.dueDate}
                            {isLate && <AlertCircle className="w-3 h-3" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${inst.expectedAmount.toFixed(2)}
                        </TableCell>

                        {}
                        <TableCell className="text-right font-medium text-red-600">
                          {penalty > 0 ? `+ $${penalty.toFixed(2)}` : "-"}
                        </TableCell>

                        <TableCell className="text-right text-green-600 font-medium">
                          ${inst.paidAmount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${pending.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {inst.status === "PAID" ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              PAGADO
                            </Badge>
                          ) : isLate ? (
                            <Badge variant="destructive">VENCIDO</Badge>
                          ) : (
                            <Badge variant="secondary">PENDIENTE</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!ar.collections || ar.collections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No hay pagos registrados aún.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pago</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Ref.</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ar.collections.map((col) => (
                      <TableRow
                        key={col.id}
                        className={col.status === "ANULADO" ? "opacity-50" : ""}
                      >
                        <TableCell>#{col.id}</TableCell>
                        <TableCell>
                          {new Date(col.collectionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-muted-foreground" />
                          {col.paymentMethod?.name || "Desconocido"}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {col.referenceNumber || "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${col.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {col.status === "ANULADO" ? (
                            <Badge
                              variant="outline"
                              className="border-red-200 text-red-500"
                            >
                              ANULADO
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-green-200 text-green-600 bg-green-50"
                            >
                              EXITOSO
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Datos de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">ID Venta</span>
                <span className="font-medium">#{ar.sale?.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fecha Emisión</span>
                <span>
                  {new Date(ar.sale?.saleDate || "").toLocaleString()}
                </span>
              </div>

              {}
              {ar.sale?.paymentCondition === "CREDITO" && (
                <div className="flex justify-between border-b pb-2 bg-blue-50 -mx-2 px-2 py-1 rounded">
                  <span className="text-blue-700 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Inicio Crédito
                  </span>
                  <span className="text-blue-900 font-bold">
                    {getCreditStartDate()}
                  </span>
                </div>
              )}
              {}

              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Condición</span>
                <Badge variant="secondary">{ar.sale?.paymentCondition}</Badge>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Vendedor ID</span>
                <span>{ar.sale?.sellerId}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Tipo</span>
                <span>{ar.sale?.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Cobranza</DialogTitle>
          </DialogHeader>
          {ar.sale && (
            <PaymentRegistrationForm
              sale={ar.sale}
              balance={balance}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setIsPaymentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionDetailPage;