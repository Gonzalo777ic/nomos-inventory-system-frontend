import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, FileText, CreditCard } from "lucide-react";

import { PaymentMethodService } from "@/api/services/paymentMethodService";
import { CashMovementPayload, CashMovementType } from "@/types/store/cash";
import { PaymentMethodConfig } from "@/types/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onSubmit: (data: CashMovementPayload) => Promise<void>;
  onCancel: () => void;
  defaultType?: CashMovementType;
}

export const CashMovementForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  defaultType = "EXPENSE",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CashMovementPayload>({
    type: defaultType,
    amount: 0,
    paymentMethodId: 0,
    concept: "",
    externalReference: "",
    movementDate: new Date().toISOString(),
  });

  const { data: paymentMethods } = useQuery<PaymentMethodConfig[]>({
    queryKey: ["payment-methods"],
    queryFn: PaymentMethodService.getAll,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0 || !formData.paymentMethodId || !formData.concept)
      return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setFormData({ ...formData, type: "INCOME" })}
          className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
            formData.type === "INCOME"
              ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500"
              : "hover:bg-gray-50"
          }`}
        >
          <span className="font-bold text-sm">INGRESO</span>
        </div>
        <div
          onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
          className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
            formData.type === "EXPENSE"
              ? "bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500"
              : "hover:bg-gray-50"
          }`}
        >
          <span className="font-bold text-sm">EGRESO / GASTO</span>
        </div>
      </div>

      {}
      <div className="space-y-2">
        <Label>Monto</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="pl-9 text-lg font-bold"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            required
          />
        </div>
      </div>

      {}
      <div className="space-y-2">
        <Label>Concepto / Motivo</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={
              formData.type === "EXPENSE"
                ? "Ej: Compra de útiles, Pago de luz..."
                : "Ej: Aporte de capital..."
            }
            className="pl-9"
            value={formData.concept}
            onChange={(e) =>
              setFormData({ ...formData, concept: e.target.value })
            }
            required
          />
        </div>
      </div>

      {}
      <div className="space-y-2">
        <Label>Medio de Pago</Label>
        <Select
          onValueChange={(val) =>
            setFormData({ ...formData, paymentMethodId: Number(val) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar caja/banco..." />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods?.map((pm) => (
              <SelectItem key={pm.id} value={pm.id.toString()}>
                {pm.name} ({pm.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="space-y-2">
        <Label className="text-gray-500">Nro. Operación / Ref (Opcional)</Label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ej: 0045812"
            className="pl-9"
            value={formData.externalReference || ""}
            onChange={(e) =>
              setFormData({ ...formData, externalReference: e.target.value })
            }
          />
        </div>
      </div>

      {}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting || formData.amount <= 0 || !formData.paymentMethodId
          }
          className={
            formData.type === "INCOME"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-rose-600 hover:bg-rose-700"
          }
        >
          {isSubmitting ? "Guardando..." : "Registrar Movimiento"}
        </Button>
      </div>
    </form>
  );
};
