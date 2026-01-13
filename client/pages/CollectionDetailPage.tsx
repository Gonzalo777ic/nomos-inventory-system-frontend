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
  TrendingUp
} from "lucide-react";

import { AccountsReceivableService } from "@/api/services/accountsReceivableService";
import { AccountsReceivable, Installment } from "@/types/store";
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


const PaymentProgressBar = ({ 
    label, 
    paid, 
    total, 
    colorClass, 
    bgClass 
}: { 
    label: string; 
    paid: number; 
    total: number; 
    colorClass: string; 
    bgClass: string;
}) => {

    const percentage = total > 0 ? Math.min(100, (paid / total) * 100) : (paid > 0 ? 100 : 0);
    
    return (
        <div className="w-full space-y-1 text-xs mb-2">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">{label}</span>
                <span>
                    <span className={percentage === 100 ? "text-green-600" : ""}>${paid.toFixed(2)}</span> 
                    <span className="text-gray-400"> / ${total.toFixed(2)}</span>
                </span>
            </div>
            {}
            <div className={`h-2 w-full rounded-full ${bgClass}`}>
                <div 
                    className={`h-full rounded-full transition-all ${colorClass}`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
        </div>
    );
};

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

  if (isLoading) return <div className="p-10 text-center">Cargando detalles financieros...</div>;
  if (error || !ar) return <div className="p-10 text-center text-red-500">No se encontró la cuenta por cobrar.</div>;


  const totalPaidCapital = ar.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);

  
  const balance = ar.totalAmount - totalPaidCapital; 
  const percentage = (totalPaidCapital / ar.totalAmount) * 100;
  
  const isFullyPaid = ar.status === "PAID" || balance <= 0.01;
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
          <Button onClick={() => setIsPaymentOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Registrar Nuevo Pago
          </Button>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Deuda Capital</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${ar.totalAmount.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Capital Abonado</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaidCapital.toFixed(2)}</div>
            <Progress value={percentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className={balance > 0 ? "bg-red-50 border-red-100 dark:bg-red-900/10" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Capital Pendiente</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? "text-red-600" : "text-gray-600"}`}>
              ${balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cliente</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="bg-slate-100 p-2 rounded-full"><User className="w-4 h-4 text-slate-600" /></div>
            <div>
              <div className="font-medium text-sm">ID: {ar.sale?.clientId || "N/A"}</div>
              <div className="text-xs text-muted-foreground">Consumidor Final</div>
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
                <Calendar className="w-5 h-5" /> Cronograma de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="w-[120px]">Vencimiento</TableHead>
                    
                    {}
                    <TableHead className="min-w-[200px]">Distribución de Pago</TableHead>
                    
                    <TableHead className="text-right">Total Pendiente</TableHead>
                    <TableHead className="text-center w-[100px]">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ar.installments.map((inst: any) => {
                    const paidPenalty = inst.paidPenalty || 0;
                    const pendingPenalty = inst.penaltyAmount || 0;
                    const totalPenaltyHistory = paidPenalty + pendingPenalty;
                    

                    const showPenaltyBar = totalPenaltyHistory > 0.01;

                    const paidCapital = inst.paidAmount || 0;
                    const expectedCapital = inst.expectedAmount;
                    const pendingCapital = expectedCapital - paidCapital;


                    const totalPendingNow = pendingCapital + pendingPenalty;


                    const [y, m, d] = inst.dueDate.toString().split('-').map(Number);
                    const dueDateObj = new Date(y, m - 1, d, 23, 59, 59);
                    const isLate = inst.status !== "PAID" && new Date() > dueDateObj;

                    return (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium align-top py-4">{inst.number}</TableCell>
                        <TableCell className="align-top py-4">
                          <div className={`flex flex-col ${isLate ? "text-red-600" : ""}`}>
                            <span className="font-semibold flex items-center gap-1">
                                {inst.dueDate}
                                {isLate && <AlertCircle className="w-3 h-3" />}
                            </span>
                            {isLate && <span className="text-[10px] uppercase font-bold">Vencido</span>}
                          </div>
                        </TableCell>

                        {}
                        <TableCell className="align-top py-2">
                            <div className="flex flex-col gap-1">
                                {}
                                {showPenaltyBar && (
                                    <PaymentProgressBar 
                                        label="Mora / Penalidad"
                                        paid={paidPenalty}
                                        total={totalPenaltyHistory}
                                        colorClass="bg-red-500"
                                        bgClass="bg-red-100"
                                    />
                                )}

                                {}
                                <PaymentProgressBar 
                                    label="Capital / Cuota Base"
                                    paid={paidCapital}
                                    total={expectedCapital}
                                    colorClass="bg-emerald-500"
                                    bgClass="bg-emerald-100"
                                />
                            </div>
                        </TableCell>

                        {}
                        <TableCell className="text-right align-top py-4">
                            <div className="font-bold text-lg">
                                ${totalPendingNow.toFixed(2)}
                            </div>
                            {pendingPenalty > 0 && (
                                <div className="text-xs text-red-500 font-medium">
                                    (Incluye ${pendingPenalty.toFixed(2)} mora)
                                </div>
                            )}
                        </TableCell>

                        {}
                        <TableCell className="text-center align-top py-4">
                          {inst.status === "PAID" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              PAGADO
                            </Badge>
                          ) : inst.paidAmount > 0 || paidPenalty > 0 ? (
                             <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                               PARCIAL
                             </Badge>
                          ) : isLate ? (
                            <Badge variant="destructive">MORA</Badge>
                          ) : (
                            <Badge variant="outline">PENDIENTE</Badge>
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
                <FileText className="w-5 h-5" /> Historial de Transacciones
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
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Ref.</TableHead>
                      <TableHead className="text-right">Monto Pagado</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ar.collections.map((col) => (
                      <TableRow key={col.id} className={col.status === "ANULADO" ? "opacity-50" : ""}>
                        <TableCell>#{col.id}</TableCell>
                        <TableCell>{new Date(col.collectionDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs font-mono">{col.referenceNumber || "-"}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          + ${col.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {col.status === "ANULADO" ? 
                            <Badge variant="outline" className="border-red-200 text-red-500">ANULADO</Badge> : 
                            <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">EXITOSO</Badge>
                          }
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
            <CardHeader><CardTitle className="text-sm">Datos de la Venta</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">ID Venta</span>
                <span className="font-medium">#{ar.sale?.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fecha Emisión</span>
                <span>{new Date(ar.sale?.saleDate || "").toLocaleString()}</span>
              </div>
              {ar.sale?.paymentCondition === "CREDITO" && (
                <div className="flex justify-between border-b pb-2 bg-blue-50 -mx-2 px-2 py-1 rounded">
                  <span className="text-blue-700 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Inicio Crédito
                  </span>
                  <span className="text-blue-900 font-bold">{getCreditStartDate()}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Vendedor</span>
                <span>ID {ar.sale?.sellerId}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Cobranza</DialogTitle></DialogHeader>
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