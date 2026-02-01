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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {}

      {}

      {}

      {}

      {}

      {}
    </form>
  );
};
