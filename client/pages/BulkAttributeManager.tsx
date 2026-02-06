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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-600" />
            Enriquecimiento Masivo
          </h1>
          <p className="text-gray-500 text-sm">
            Selecciona productos y asigna atributos en lote.
          </p>
        </div>

        {}
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar SKU, Nombre..."
            className="pl-9 bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {}
      <Card className="shadow-md border-none overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-purple-600" />
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={
                      selectedProductIds.includes(product.id)
                        ? "bg-purple-50 dark:bg-purple-900/20"
                        : ""
                    }
                    onClick={() => toggleSelectProduct(product.id)}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() => toggleSelectProduct(product.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {product.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    {}
                    <TableCell className="text-gray-500">
                      {product.categoryName}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {product.brandName}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
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
            <Button
              variant="ghost"
              onClick={() => setSelectedProductIds([])}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold"
            >
              <Tag className="w-4 h-4 mr-2" />
              Asignar Atributo
            </Button>
          </div>
        </div>
      )}

      {}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignación Masiva</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-800 text-sm text-purple-800 dark:text-purple-300">
              Estás a punto de asignar un valor a{" "}
              <strong>{selectedProductIds.length} productos</strong>. Si ya
              tienen este atributo, el valor será actualizado.
            </div>

            <div className="space-y-2">
              <Label>Seleccionar Atributo</Label>
              <Select
                value={selectedAttributeId}
                onValueChange={setSelectedAttributeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ej: Temporada, Colección..." />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((attr) => (
                    <SelectItem key={attr.id} value={attr.id.toString()}>
                      {attr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAttrDef && (
              <div className="space-y-2 animate-in fade-in zoom-in-95">
                <Label>Valor a asignar ({selectedAttrDef.dataType})</Label>
                {selectedAttrDef.dataType === "Boolean" ? (
                  <Select
                    value={bulkValueInput}
                    onValueChange={setBulkValueInput}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí / Verdadero</SelectItem>
                      <SelectItem value="false">No / Falso</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      selectedAttrDef.dataType === "Number" ? "number" : "text"
                    }
                    placeholder={
                      selectedAttrDef.dataType === "Number"
                        ? "0.00"
                        : "Ej: Verano 2026"
                    }
                    value={bulkValueInput}
                    onChange={(e) => setBulkValueInput(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={
                !selectedAttributeId ||
                !bulkValueInput ||
                bulkMutation.isPending
              }
            >
              {bulkMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Aplicar a Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkAttributeManager;
