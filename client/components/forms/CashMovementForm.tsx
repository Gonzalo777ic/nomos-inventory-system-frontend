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

      {}

      {}

      {}

      {}
    </form>
  );
};
