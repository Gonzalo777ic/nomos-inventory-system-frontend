import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Tag, Save, ArrowLeft, Info, Keyboard, Command } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [bulkValueInput, setBulkValueInput] = useState<string>("");


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProductIds.length > 0 && !isBulkModalOpen) {
        setSelectedProductIds([]);
        setLastSelectedId(null);
        toast.info("Selección cancelada");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProductIds, isBulkModalOpen]);

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
        `Atributo asignado correctamente a ${selectedProductIds.length} productos.`,
      );
      setIsBulkModalOpen(false);
      setSelectedProductIds([]);
      setLastSelectedId(null);
      setSelectedAttributeId("");
      setBulkValueInput("");

      queryClient.invalidateQueries({ queryKey: ["product-attribute-values"] });
    },
    onError: () => toast.error("Error al procesar la asignación masiva."),
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
      setLastSelectedId(null);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  /**
   * Lógica de Selección Avanzada (Excel-like)
   */
  const handleRowClick = (id: number, event: React.MouseEvent) => {

    if (event.shiftKey && lastSelectedId !== null) {
        const lastIndex = filteredProducts.findIndex((p) => p.id === lastSelectedId);
        const currentIndex = filteredProducts.findIndex((p) => p.id === id);

        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            const rangeIds = filteredProducts.slice(start, end + 1).map((p) => p.id);
            


            const isTargetSelected = selectedProductIds.includes(id);
            
            setSelectedProductIds(prev => {
                const currentSet = new Set(prev);
                if (isTargetSelected) {


                    rangeIds.forEach(rid => currentSet.delete(rid));
                } else {

                    rangeIds.forEach(rid => currentSet.add(rid));
                }
                return Array.from(currentSet);
            });
        }
    } 

    else {


      setSelectedProductIds((prev) =>
        prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
      );
      setLastSelectedId(id);
    }
  };

  const handleCheckboxClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleRowClick(id, e);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/inventory/products')}
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            title="Volver al Catálogo"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-600" />
              Enriquecimiento Masivo
            </h1>
            <p className="text-gray-500 text-sm">
              Gestión de atributos por lotes para el catálogo.
            </p>
          </div>
        </div>

        {}
        <div className="relative w-full md:w-72">
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
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2 font-semibold">
                <Keyboard className="w-5 h-5" />
                <span>Atajos de Teclado:</span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1.5">
                    <kbd className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono font-bold shadow-sm">Shift</kbd> 
                    <span>+ Clic para seleccionar un rango continuo.</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono font-bold shadow-sm">Ctrl</kbd> 
                    <span>+ Clic para alternar selección individual.</span>
                </div>
                <div className="flex items-center gap-1.5 hidden md:flex">
                    <kbd className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 font-mono font-bold shadow-sm">Esc</kbd> 
                    <span>para cancelar toda la selección.</span>
                </div>
            </div>
        </div>
      </Card>
      {}

      {}
      <Card className="shadow-md border-none overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
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
              ) : filteredProducts.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    No se encontraron productos con el filtro actual.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <TableRow
                        key={product.id}
                        className={`cursor-pointer select-none transition-colors border-b dark:border-gray-800 ${
                        isSelected
                            ? "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={(e) => handleRowClick(product.id, e)}
                    >
                        <TableCell className="text-center">
                        <Checkbox
                            checked={isSelected}
                            onClick={(e) => handleCheckboxClick(product.id, e)}
                        />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {product.sku}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                        {product.categoryName}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                        {product.brandName}
                        </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] md:max-w-2xl bg-gray-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600 text-white font-bold px-3 py-1 rounded-md text-sm shadow-sm">
              {selectedProductIds.length}
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-sm md:text-base">Productos seleccionados</span>
                <span className="text-xs text-gray-400 hidden sm:inline">Listos para procesar</span>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                  setSelectedProductIds([]);
                  setLastSelectedId(null);
              }}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancelar (Esc)
            </Button>
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-lg transition-transform hover:scale-105"
            >
              <Tag className="w-4 h-4 mr-2 text-purple-600" />
              <span className="hidden sm:inline">Asignar Atributo</span>
              <span className="sm:hidden">Asignar</span>
            </Button>
          </div>
        </div>
      )}

      {}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600"/> 
                Asignación Masiva
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 text-sm text-purple-800 dark:text-purple-300 flex gap-3 items-start">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    Estás a punto de asignar un valor a <strong>{selectedProductIds.length} productos</strong>. 
                    <br/>
                    <span className="text-xs opacity-80 mt-1 block">Nota: Si algún producto ya tiene este atributo, el valor anterior será sobrescrito.</span>
                </p>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">1. Seleccionar Atributo</Label>
              <Select
                value={selectedAttributeId}
                onValueChange={setSelectedAttributeId}
              >
                <SelectTrigger className="w-full">
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
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label className="text-gray-700 dark:text-gray-300">
                    2. Valor a asignar <span className="text-xs font-normal text-gray-500">({selectedAttrDef.dataType})</span>
                </Label>
                
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
                    className="font-medium"
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleBulkSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
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
              Confirmar y Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkAttributeManager;