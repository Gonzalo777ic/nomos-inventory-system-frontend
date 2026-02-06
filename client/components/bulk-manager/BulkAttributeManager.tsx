import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Tag, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getProducts } from "../../api/services/products";
import { getProductAttributes } from "../../api/services/product-attribute";
import { bulkAssignAttributes } from "../../api/services/productAttributeValue";
import { getCategories } from "../../api/services/category";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { ViewModeToggle } from "./ViewModeToggle";
import { FlatProductTable } from "./FlatProductTable";
import { CategorizedProductView } from "./CategorizedProductView";
import { SelectionDrawer } from "./SelectionDrawer";

import { ProductListItem, ProductAttribute, Category } from "../../types";

export const BulkAttributeManager: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<"flat" | "categorized">("flat");
  const [searchTerm, setSearchTerm] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: viewMode === "categorized",
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term),
    );
  }, [products, searchTerm]);

  const selectedProductsObjects = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  const handleToggleProduct = useCallback((id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
    setLastSelectedId(id);
  }, []);

  const handleRangeSelect = useCallback(
    (targetId: number) => {
      if (lastSelectedId === null) {
        handleToggleProduct(targetId);
        return;
      }

      const lastIndex = filteredProducts.findIndex(
        (p) => p.id === lastSelectedId,
      );
      const currentIndex = filteredProducts.findIndex((p) => p.id === targetId);

      if (lastIndex === -1 || currentIndex === -1) return;

      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const rangeIds = filteredProducts.slice(start, end + 1).map((p) => p.id);

      const isTargetSelected = selectedProductIds.includes(targetId);

      setSelectedProductIds((prev) => {
        const currentSet = new Set(prev);
        if (isTargetSelected) {
          rangeIds.forEach((id) => currentSet.delete(id));
        } else {
          rangeIds.forEach((id) => currentSet.add(id));
        }
        return Array.from(currentSet);
      });
      setLastSelectedId(targetId);
    },
    [lastSelectedId, filteredProducts, selectedProductIds, handleToggleProduct],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
      setLastSelectedId(null);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  }, [filteredProducts, selectedProductIds.length]);

  const handleToggleCategoryGroup = useCallback(
    (productIdsInGroup: number[]) => {
      const allSelected = productIdsInGroup.every((id) =>
        selectedProductIds.includes(id),
      );

      setSelectedProductIds((prev) => {
        const currentSet = new Set(prev);
        if (allSelected) {
          productIdsInGroup.forEach((id) => currentSet.delete(id));
        } else {
          productIdsInGroup.forEach((id) => currentSet.add(id));
        }
        return Array.from(currentSet);
      });
    },
    [selectedProductIds],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedProductIds([]);
    setLastSelectedId(null);
  }, []);

  const handleRemoveItem = useCallback((id: number) => {
    setSelectedProductIds((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const bulkMutation = useMutation({
    mutationFn: bulkAssignAttributes,
    onSuccess: () => {
      toast.success(
        `Atributo asignado a ${selectedProductIds.length} productos.`,
      );
      setIsAssignModalOpen(false);
      handleClearSelection();
      setBulkValueInput("");
      setSelectedAttributeId("");
      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
    },
    onError: () => toast.error("Error al asignar atributos."),
  });

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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {}
      <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 p-6 border-b dark:border-gray-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/inventory/products")}
              className="rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Tag className="w-6 h-6 text-purple-600" />
                Enriquecimiento Masivo
              </h1>
              <p className="text-sm text-gray-500">
                Gestión de atributos por lotes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar SKU o Nombre..."
                className="pl-9 bg-white dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {}
            <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-600" />
            <p>Cargando catálogo...</p>
          </div>
        ) : (
          <>
            {}
            {viewMode === "flat" ? (
              <FlatProductTable
                products={filteredProducts}
                selectedIds={selectedProductIds}
                onToggle={handleToggleProduct}
                onRangeSelect={handleRangeSelect}
                onSelectAll={handleSelectAll}
              />
            ) : (
              <CategorizedProductView
                products={filteredProducts}
                categories={categories}
                selectedIds={selectedProductIds}
                onToggleProduct={handleToggleProduct}
                onToggleCategory={handleToggleCategoryGroup}
              />
            )}
          </>
        )}
      </div>

      {}
     

      {}
      
    </div>
  );
};

export default BulkAttributeManager;
