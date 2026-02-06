import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Tag,
  AlertCircle,
  Loader2,
  Box,
  Pencil,
  Search,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAttributeValuesByProduct,
  addProductAttributeValue,
  updateProductAttributeValue,
  deleteProductAttributeValue,
} from "../api/services/productAttributeValue";
import { getProductAttributes } from "../api/services/product-attribute";
import { getProductById } from "../api/services/products";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

import { ProductAttributeValue } from "../types";

const ProductAttributesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingValue, setEditingValue] =
    useState<ProductAttributeValue | null>(null);
  const [deletingValue, setDeletingValue] =
    useState<ProductAttributeValue | null>(null);

  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    retry: 1,
  });

  const { data: allAttributes = [] } = useQuery({
    queryKey: ["attributes"],
    queryFn: getProductAttributes,
  });

  const { data: productValues = [], isLoading: isValuesLoading } = useQuery({
    queryKey: ["product-attribute-values", productId],
    queryFn: () => getAttributeValuesByProduct(productId),
    enabled: !!productId,
  });

  const createMutation = useMutation({
    mutationFn: addProductAttributeValue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-attribute-values", productId],
      });
      toast.success("Atributo añadido");
      handleCloseModal();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Error al añadir"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { attrId: number; value: string }) =>
      updateProductAttributeValue(productId, data.attrId, {
        value: data.value,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-attribute-values", productId],
      });
      toast.success("Actualizado correctamente");
      handleCloseModal();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Error al actualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (attrId: number) =>
      deleteProductAttributeValue(productId, attrId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-attribute-values", productId],
      });
      toast.success("Eliminado correctamente");
      setIsDeleteOpen(false);
      setDeletingValue(null);
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingValue(null);
    setSelectedAttributeId("");
    setValueInput("");
  };

  const handleSubmit = () => {
    if (!selectedAttributeId || !valueInput) return;

    if (editingValue) {
      updateMutation.mutate({
        attrId: editingValue.attributeId,
        value: valueInput,
      });
    } else {
      createMutation.mutate({
        productId,
        attributeId: Number(selectedAttributeId),
        value: valueInput,
      });
    }
  };

  const confirmDelete = (val: ProductAttributeValue) => {
    setDeletingValue(val);
    setIsDeleteOpen(true);
  };

  const availableAttributes = allAttributes.filter(
    (a) => !productValues.some((pv) => pv.attributeId === a.id),
  );

  const getAttrDef = (id: number) => allAttributes.find((a) => a.id === id);

  const filteredValues = productValues.filter((val) => {
    const def = getAttrDef(val.attributeId);
    const term = searchTerm.toLowerCase();
    return (
      def?.name.toLowerCase().includes(term) ||
      val.value.toLowerCase().includes(term)
    );
  });

  if (isProductLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
      </div>
    );
  if (!product)
    return (
      <div className="p-8 text-center text-red-500">Producto no encontrado</div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Atributos Avanzados
                <Badge
                  variant="outline"
                  className="text-xs font-normal text-gray-500 border-gray-300"
                >
                  {product.sku}
                </Badge>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                <Box className="w-3 h-3" /> {product.name}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingValue(null);
              setSelectedAttributeId("");
              setValueInput("");
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Asignar Atributo
          </Button>
        </div>

        {}
        <div className="grid gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar atributo o valor..."
              className="pl-9 bg-white dark:bg-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isValuesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-emerald-600" />
            </div>
          ) : filteredValues.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Sin atributos asignados
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Este producto no tiene características especiales configuradas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredValues.map((val) => {
                const def = getAttrDef(val.attributeId);
                return (
                  <Card
                    key={val.attributeId}
                    className="group hover:shadow-md transition-shadow dark:bg-gray-800 border-l-4 border-l-emerald-500 relative"
                  >
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {def?.name || `Attr #${val.attributeId}`}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 h-5 bg-gray-100 dark:bg-gray-700 text-gray-500"
                          >
                            {def?.dataType}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white break-all">
                          {val.value}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setEditingValue(val);
                            setSelectedAttributeId(val.attributeId.toString());
                            setValueInput(val.value);
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete(val)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Editar Valor" : "Asignar Atributo"}
            </DialogTitle>
          </DialogHeader>
          {}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Atributo</Label>
              <Select
                value={selectedAttributeId}
                onValueChange={setSelectedAttributeId}
                disabled={!!editingValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {editingValue
                    ? [getAttrDef(editingValue.attributeId)].map(
                        (a) =>
                          a && (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.name}
                            </SelectItem>
                          ),
                      )
                    : availableAttributes.map((a) => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                          {a.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAttributeId &&
              (() => {
                const def = getAttrDef(Number(selectedAttributeId));
                if (!def) return null;

                return (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Valor ({def.dataType})</Label>
                    {def.dataType === "Boolean" ? (
                      <Select value={valueInput} onValueChange={setValueInput}>
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
                        type={def.dataType === "Number" ? "number" : "text"}
                        placeholder={
                          def.dataType === "Number"
                            ? "0.00"
                            : "Escriba el valor..."
                        }
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                );
              })()}

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !selectedAttributeId ||
                  !valueInput ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 text-gray-700 dark:text-gray-300">
            <p>
              ¿Estás seguro de que deseas desvincular este atributo del
              producto?
            </p>
            {deletingValue && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {getAttrDef(deletingValue.attributeId)?.name}:
                </span>
                <span className="ml-2 font-mono">{deletingValue.value}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingValue &&
                deleteMutation.mutate(deletingValue.attributeId)
              }
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAttributesPage;
