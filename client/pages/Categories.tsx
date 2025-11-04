import React, { useState, useEffect, useMemo } from 'react'; // <-- Añadir useMemo
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Search, Loader2, PlusCircle, Pencil, Trash2, FolderTree, List, GitFork } from 'lucide-react'; // <-- Añadir List y GitFork
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { toast } from 'sonner';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../components/ui/table';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogFooter 
} from '../components/ui/dialog';
import { Category } from '../types'; 
import { getCategories, deleteCategory, updateCategory } from '../api/services/category'; // <-- Necesitas updateCategory
import CategoryForm from '../components/forms/CategoryForm'; 
// --- NUEVOS IMPORTS ---
import CategoryTreeViewer from '../components/CategoryTreeViewer'; // Componente de Árbol
import { listToTree } from '../utils/categoryMappers'; // Utilidad de Mapeo
// ----------------------

const Categories: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
    const [categoryToDeleteName, setCategoryToDeleteName] = useState<string>('');
    // NUEVO ESTADO: Controlar la vista (tabla por defecto)
    const [isTreeView, setIsTreeView] = useState(false); 

    // 1. Obtener la lista de Categorías
    const { 
        data: categories = [], 
        isLoading, 
        error 
    } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    // **Mapeo del Árbol**: Se usa useMemo para recalcular solo cuando la lista plana cambia
    const treeData = useMemo(() => listToTree(categories), [categories]);

    // Diagnóstico (opcional)
    useEffect(() => {
        if (categories.length > 0) {
            console.log("Datos de Categorías (Tabla) ✅:", categories);
            console.log("Datos de Categorías (Árbol) 🌳:", treeData);
        }
    }, [categories, treeData]); 

    // 2. Mutación para la Eliminación (Sin cambios)
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCategory(id),
        onSuccess: () => {
            toast.success(`Categoría "${categoryToDeleteName}" eliminada.`);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsDeleteConfirmOpen(false);
            setCategoryToDeleteId(null);
            setCategoryToDeleteName('');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Error al eliminar la categoría. Podría tener subcategorías o productos asociados.";
            toast.error(errorMessage);
        }
    });
    
    // 3. Mutación para MOVER categorías (Reubicación por D&D)
    const moveMutation = useMutation({
        mutationFn: async ({ childId, newParentId }: { childId: number; newParentId: number | null }) => {
            // 1. Obtener los datos actuales de la categoría a mover (para no perder 'name' o 'description')
            const currentCategory = categories.find(c => c.id === childId);
            if (!currentCategory) throw new Error("Categoría a mover no encontrada.");

            // 2. Construir el objeto 'parent' para el payload
            const parentObject = newParentId ? { id: newParentId } : null;

            // 3. Crear el payload de actualización
            const categoryData = {
                name: currentCategory.name,
                description: currentCategory.description || null,
                parent: parentObject,
            };

            // 4. Llamar al servicio de actualización
            return updateCategory(childId, categoryData); 
        },
        onSuccess: () => {
            toast.success("Categoría reubicada con éxito.");
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
             const errorMessage = error.response?.data?.message || "Error al reubicar la categoría. Revise si intenta mover una categoría sobre un descendiente (ciclo).";
             toast.error(errorMessage);
        }
    });

    // Handler pasado al componente CategoryTreeViewer para ejecutar la mutación
    const handleMoveCategory = (childId: number, newParentId: number | null) => {
        if (moveMutation.isPending) return;
        moveMutation.mutate({ childId, newParentId });
    };


    // Función auxiliar para obtener el nombre del padre (Sin cambios)
    const getParentName = (category: Category): string => {
        if (category.parent && category.parent.name) {
            return category.parent.name;
        }
        return "— Principal —";
    };
    
    // Filtro de búsqueda (Sin cambios)
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase() || '')
    );

    // Handlers (Sin cambios)
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
        if (categoryToDeleteId) {
            deleteMutation.mutate(categoryToDeleteId);
        }
    };
    
    if (error) {
        const message = error instanceof Error ? error.message : "Error desconocido.";
        let errorMessage = `Error al cargar categorías: ${message}`;
        if (message.includes('403')) {
            errorMessage = "Acceso Denegado (403): No tienes permiso para ver las categorías.";
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
                                disabled={isTreeView} // Deshabilitar búsqueda en vista de árbol
                            />
                        </div>
                        {/* NUEVO BOTÓN: Alternar Vista */}
                        <Button 
                            onClick={() => setIsTreeView(!isTreeView)}
                            variant="outline"
                            className="flex items-center space-x-2" 
                        >
                            {isTreeView ? (
                                <><List className="w-5 h-5" /> <span>Vista de Tabla</span></>
                            ) : (
                                <><GitFork className="w-5 h-5" /> <span>Vista de Árbol</span></>
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
                    {/* Renderizado Condicional */}
                    {isTreeView ? (
                        // VISTA DE ÁRBOL
                        <CategoryTreeViewer 
                            categories={categories}
                            treeData={treeData}
                            onMoveCategory={handleMoveCategory}
                        />
                    ) : (
                        // VISTA DE TABLA
                        isLoading ? (
                            <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista de categorías...
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center p-8 space-y-2">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {categories.length === 0 
                                        ? "Aún no hay categorías registradas."
                                        : "No se encontraron categorías que coincidan con la búsqueda."}
                                </p>
                                {categories.length === 0 && (
                                    <Button onClick={() => handleOpenForm(null)} variant="link" className="text-blue-600">
                                        ¡Crea la primera ahora!
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="dark:bg-gray-800">
                                    <TableRow>
                                        <TableHead className="text-gray-600 dark:text-gray-400">Nombre</TableHead>
                                        <TableHead className="text-gray-600 dark:text-gray-400">Descripción</TableHead> 
                                        <TableHead className="text-gray-600 dark:text-gray-400">Categoría Padre</TableHead>
                                        <TableHead className="text-center w-[120px] text-gray-600 dark:text-gray-400">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="dark:bg-gray-900">
                                    {filteredCategories.map((category) => (
                                        <TableRow key={category.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                            <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</TableCell>
                                            
                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                {category.description || '— Sin descripción —'} 
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
                                                        onClick={() => category.id && handleConfirmDelete(category)}
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
                        )
                    )}
                </CardContent>
            </Card>

            {/* Modal/Dialogs sin cambios */}
            {/* ... */}
        </div>
    );
};

export default Categories;