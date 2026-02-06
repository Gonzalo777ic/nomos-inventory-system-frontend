import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Search,
  Loader2,
  PlusCircle,
  Pencil,
  Trash2,
  Ruler,
  AlertTriangle,
  List,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { ProductAttribute } from "../types";
import {
  getProductAttributes,
  deleteProductAttribute,
} from "../api/services/product-attribute";
import ProductAttributeForm from "../components/forms/ProductAttributeForm";

import { AttributeProductsSheet } from "../components/AttributeProductsSheet";

const Attributes: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] =
    useState<ProductAttribute | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [attributeToDeleteId, setAttributeToDeleteId] = useState<number | null>(
    null,
  );
  const [attributeToDeleteName, setAttributeToDeleteName] =
    useState<string>("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAttrForSheet, setSelectedAttrForSheet] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    data: attributes = [],
    isLoading,
    error,
  } = useQuery<ProductAttribute[]>({
    queryKey: ["product-attributes"],
    queryFn: getProductAttributes,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductAttribute(id),
    onSuccess: () => {
      toast.success(`Atributo "${attributeToDeleteName}" eliminado.`);
      queryClient.invalidateQueries({ queryKey: ["product-attributes"] });
      setIsDeleteConfirmOpen(false);
      setAttributeToDeleteId(null);
      setAttributeToDeleteName("");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Error al eliminar el atributo. Podría estar en uso.";
      toast.error(errorMessage);
    },
  });

  const filteredAttributes = attributes.filter((attr) =>
    attr.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenForm = (attribute: ProductAttribute | null = null) => {
    setSelectedAttribute(attribute);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAttribute(null);
  };

  const handleConfirmDelete = (attribute: ProductAttribute) => {
    if (attribute.id) {
      setAttributeToDeleteId(attribute.id);
      setAttributeToDeleteName(attribute.name);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleDeleteExecute = () => {
    if (attributeToDeleteId) {
      deleteMutation.mutate(attributeToDeleteId);
    }
  };

  const handleOpenSheet = (attr: ProductAttribute) => {
    if (attr.id) {
      setSelectedAttrForSheet({ id: attr.id, name: attr.name });
      setSheetOpen(true);
    }
  };

  if (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    let errorMessage = `Error al cargar atributos: ${message}`;
    if (message.includes("403")) {
      errorMessage =
        "Acceso Denegado (403): No tienes permiso para ver los atributos.";
    }
    return (
      <Card className="p-6">
        <p className="text-red-500 font-semibold">{errorMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card className="shadow-lg dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center dark:text-gray-100">
            <Ruler className="w-6 h-6 mr-3 text-purple-500" />
            Maestro de Atributos de Producto
          </CardTitle>
          <div className="flex space-x-4">
            <div className="relative flex items-center w-full max-w-sm">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9 dark:bg-gray-800 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={() => handleOpenForm(null)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nuevo Atributo</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista
              de atributos...
            </div>
          ) : filteredAttributes.length === 0 ? (
            <div className="text-center p-8 space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                {attributes.length === 0
                  ? "Aún no hay atributos registrados."
                  : "No se encontraron atributos que coincidan con la búsqueda."}
              </p>
              {attributes.length === 0 && (
                <Button
                  onClick={() => handleOpenForm(null)}
                  variant="link"
                  className="text-purple-600"
                >
                  ¡Crea el primero ahora!
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="dark:bg-gray-800">
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-400">
                    Nombre del Atributo
                  </TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">
                    Tipo de Dato
                  </TableHead>
                  <TableHead className="text-center w-[160px] text-gray-600 dark:text-gray-400">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="dark:bg-gray-900">
                {filteredAttributes.map((attr) => (
                  <TableRow
                    key={attr.id}
                    className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                  >
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {attr.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-300">
                      {attr.dataType}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        {}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenSheet(attr)}
                          className="text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-gray-700"
                          title="Ver productos que usan este atributo"
                        >
                          <List className="w-4 h-4" />
                        </Button>

                        {}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(attr)}
                          className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        {}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => attr.id && handleConfirmDelete(attr)}
                          className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              {selectedAttribute ? "Editar Atributo" : "Crear Nuevo Atributo"}
            </DialogTitle>
          </DialogHeader>
          <ProductAttributeForm
            initialData={selectedAttribute}
            onSuccess={handleFormClose}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" /> Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300 py-4">
            ¿Estás seguro de que deseas eliminar el atributo **
            {attributeToDeleteName}**?
          </p>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteExecute}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              <span>
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <AttributeProductsSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        attributeId={selectedAttrForSheet?.id || null}
        attributeName={selectedAttrForSheet?.name || ""}
      />
    </div>
  );
};

export default Attributes;
