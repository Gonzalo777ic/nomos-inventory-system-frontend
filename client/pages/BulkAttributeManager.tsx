import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Tag, Save } from "lucide-react";
import { toast } from "sonner";

import { getProducts } from "../api/services/products";
import { getProductAttributes } from "../api/services/product-attribute";
import { bulkAssignAttributes } from "../api/services/productAttributeValue";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

import { ProductListItem, ProductAttribute } from "../types";

const BulkAttributeManager: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [bulkValueInput, setBulkValueInput] = useState<string>("");

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<
    ProductListItem[]
  >({
    queryKey: ["products"],
    queryFn: getProducts as unknown as () => Promise<ProductListItem[]>,
  });

  const { data: attributes = [] } = useQuery<ProductAttribute[]>({
    queryKey: ["attributes"],
    queryFn: getProductAttributes,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAssignAttributes,
    onSuccess: () => {
      toast.success(
        `Atributo asignado a ${selectedProductIds.length} productos.`,
      );
      setIsBulkModalOpen(false);
      setSelectedProductIds([]);
      setSelectedAttributeId("");
      setBulkValueInput("");

      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
    },
    onError: () => toast.error("Error en la asignación masiva."),
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const handleBulkSubmit = () => {
    if (!selectedAttributeId || !bulkValueInput) return;

    bulkMutation.mutate({
      productIds: selectedProductIds,
      attributeId: Number(selectedAttributeId),
      value: bulkValueInput,
    });
  };

  const selectedAttrDef = attributes.find(
    (a) => a.id === Number(selectedAttributeId),
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen relative pb-24">
      {}
      

      {}
      <Card className="shadow-md border-none overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            
            
          </Table>
        </div>
      </Card>

      {}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-gray-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 text-white font-bold px-3 py-1 rounded-md text-sm">
              {selectedProductIds.length}
            </div>
            <span className="font-medium">Productos seleccionados</span>
          </div>

          <div className="flex gap-3">
            
            
          </div>
        </div>
      )}

      {}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-md">
         

          

          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkAttributeManager;
