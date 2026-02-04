import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Tag,
  AlertCircle,
  Loader2,
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
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

import { ProductAttribute, ProductAttributeValue } from "../types";

const ProductAttributesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] =
    useState<ProductAttributeValue | null>(null);

  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [valueInput, setValueInput] = useState<string>("");

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  const { data: allAttributes = [] } = useQuery({
    queryKey: ["attributes"],
    queryFn: getProductAttributes,
  });

  const { data: productValues = [], isLoading } = useQuery({
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
      toast.success("Atributo añadido correctamente");
      handleCloseModal();
    },
    onError: () => toast.error("Error al añadir atributo"),
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
      toast.success("Valor actualizado correctamente");
      handleCloseModal();
    },
    onError: () => toast.error("Error al actualizar valor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (attributeId: number) =>
      deleteProductAttributeValue(productId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["product-attribute-values", productId],
      });
      toast.success("Atributo eliminado");
    },
    onError: () => toast.error("Error al eliminar atributo"),
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingValue(null);
    setSelectedAttributeId("");
    setValueInput("");
  };

  const handleOpenAdd = () => {
    setEditingValue(null);
    setValueInput("");
    setSelectedAttributeId("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProductAttributeValue) => {
    setEditingValue(item);
    setSelectedAttributeId(item.attributeId.toString());
    setValueInput(item.value);
    setIsModalOpen(true);
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
        productId: productId,
        attributeId: Number(selectedAttributeId),
        value: valueInput,
      });
    }
  };
  const selectedAttrDef = allAttributes.find(
    (a) => a.id === Number(selectedAttributeId),
  );

  const availableAttributes = allAttributes.filter(
    (attr) => !productValues.some((pv) => pv.attributeId === attr.id),
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800 min-h-screen">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Atributos Avanzados
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {product
                ? `${product.name} (SKU: ${product.sku})`
                : "Cargando producto..."}
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Asignar Atributo
        </Button>

        {}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Atributos Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : productValues.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>Este producto no tiene atributos específicos asignados.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atributo</TableHead>
                    <TableHead>Tipo de Dato</TableHead>
                    <TableHead>Valor Asignado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productValues.map((val) => {
                    const def = allAttributes.find(
                      (a) => a.id === val.attributeId,
                    );
                    return (
                      <TableRow key={val.id}>
                        <TableCell className="font-medium">
                          {def?.name || `ID: ${val.attributeId}`}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                            {def?.dataType || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-lg">{val.value}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(val)}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              deleteMutation.mutate(val.attributeId)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { Pencil } from "lucide-react";

export default ProductAttributesPage;
