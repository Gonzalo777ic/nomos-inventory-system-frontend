import React, { useState, useEffect, useMemo } from "react";
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
  FolderTree,
  List,
  GitFork,
  AlertTriangle,
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
import { Category } from "../types";
import {
  getCategories,
  deleteCategory,
  updateCategory,
} from "../api/services/category";
import CategoryForm from "../components/forms/CategoryForm";
import CategoryTreeViewer from "../components/CategoryTreeViewer";
import { listToTree } from "../utils/categoryMappers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'; 

const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(
    null
  );
  const [categoryToDeleteName, setCategoryToDeleteName] = useState<string>("");
  const [isTreeView, setIsTreeView] = useState(false);


  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });


  const treeData = useMemo(() => listToTree(categories), [categories]);

  useEffect(() => {
    if (categories.length > 0) {
      console.log("📋 Lista plana:", categories);
      console.log("🌳 Estructura en árbol:", treeData);
    }
  }, [categories, treeData]);


  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      toast.success(`Categoría "${categoryToDeleteName}" eliminada.`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDeleteConfirmOpen(false);
      setCategoryToDeleteId(null);
      setCategoryToDeleteName("");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Error al eliminar la categoría. Podría tener subcategorías o productos asociados.";
      toast.error(errorMessage);
    },
  });


  const moveMutation = useMutation({
    mutationFn: async ({
      childId,
      newParentId,
    }: {
      childId: number;
      newParentId: number | null;
    }) => {
      const currentCategory = categories.find((c) => c.id === childId);
      if (!currentCategory)
        throw new Error("Categoría a mover no encontrada.");

      const parentObject = newParentId ? { id: newParentId } : null;

      const categoryData = {
        name: currentCategory.name,
        description: currentCategory.description || null,
        parent: parentObject,
      };

      return updateCategory(childId, categoryData);
    },
    onSuccess: () => {
      toast.success("Categoría reubicada con éxito.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Error al reubicar la categoría. Revise si intenta mover una categoría sobre un descendiente (ciclo).";
      toast.error(errorMessage);
    },
  });


  const handleSaveChanges = (
    changes: { id: number; newParentId: number | null }[]
  ) => {
    console.log("Cambios recibidos:", changes);

    changes.forEach((change) =>
      moveMutation.mutate({
        childId: change.id,
        newParentId: change.newParentId,
      })
    );
  };

  const getParentName = (category: Category): string => {
    if (category.parent && category.parent.name) return category.parent.name;
    return "— Principal —";
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase() || "")
  );

  const handleOpenForm = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleConfirmDelete = (category: Category) => {
    if (category.id) {
      setCategoryToDeleteId(category.id);
      setCategoryToDeleteName(category.name);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleDeleteExecute = () => {
    if (categoryToDeleteId) deleteMutation.mutate(categoryToDeleteId);
  };

  if (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    let errorMessage = `Error al cargar categorías: ${message}`;
    if (message.includes("403")) {
      errorMessage =
        "Acceso Denegado (403): No tienes permiso para ver las categorías.";
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
            <FolderTree className="w-6 h-6 mr-3 text-blue-500" />
            Clasificación de Productos (Categorías)
          </CardTitle>
          <div className="flex space-x-4">
            <div className="relative flex items-center w-full max-w-sm">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                className="pl-9 dark:bg-gray-800 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isTreeView}
              />
            </div>

            <Button
              onClick={() => setIsTreeView(!isTreeView)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isTreeView ? (
                <>
                  <List className="w-5 h-5" /> <span>Vista de Tabla</span>
                </>
              ) : (
                <>
                  <GitFork className="w-5 h-5" /> <span>Vista de Árbol</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => handleOpenForm(null)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Nueva Categoría</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isTreeView ? (
            <CategoryTreeViewer
              treeData={treeData}
              onSave={handleSaveChanges}
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista
              de categorías...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-8 space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                {categories.length === 0
                  ? "Aún no hay categorías registradas."
                  : "No se encontraron categorías que coincidan con la búsqueda."}
              </p>
              {categories.length === 0 && (
                <Button
                  onClick={() => handleOpenForm(null)}
                  variant="link"
                  className="text-blue-600"
                >
                  ¡Crea la primera ahora!
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="dark:bg-gray-800">
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-400">
                    Nombre
                  </TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">
                    Descripción
                  </TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400">
                    Categoría Padre
                  </TableHead>
                  <TableHead className="text-center w-[120px] text-gray-600 dark:text-gray-400">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="dark:bg-gray-900">
                {filteredCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                  >
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </TableCell>

                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {category.description || "— Sin descripción —"}
                    </TableCell>

                    <TableCell className="text-gray-600 dark:text-gray-300">
                      {getParentName(category)}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(category)}
                          className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            category.id && handleConfirmDelete(category)
                          }
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
              {selectedCategory ? "Editar Categoría" : "Crear Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory}
            onSuccess={handleFormClose} 
            onClose={handleFormClose}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
      
      {}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" /> Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              ¿Está seguro que desea eliminar la categoría{" "}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                "{categoryToDeleteName}"
              </span>
              ?
            </p>
            <p className="text-sm text-red-500">
              ¡Esta acción no se puede deshacer!
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteExecute}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
