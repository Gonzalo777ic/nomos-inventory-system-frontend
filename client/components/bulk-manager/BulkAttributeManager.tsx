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





  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {}
      

      {}
      

      {}
     

      {}
      
    </div>
  );
};

export default BulkAttributeManager;
