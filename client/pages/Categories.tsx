import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Search, Loader2, PlusCircle, Pencil, Trash2, FolderTree } from 'lucide-react';
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
import { getCategories, deleteCategory } from '../api/services/category'; 
import CategoryForm from '../components/forms/CategoryForm'; 

const Categories: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
    const [categoryToDeleteName, setCategoryToDeleteName] = useState<string>('');

    // 1. Obtener la lista de Categorías
    const { 
        data: categories = [], 
        isLoading, 
        error 
    } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    
    // **DIAGNÓSTICO**: Mantenemos el log temporalmente para asegurar la nueva lógica
    useEffect(() => {
        if (categories.length > 0) {
            console.log("✅ Datos de Categorías recibidos (Ahora se usa category.parent):", categories);
        }
    }, [categories]); 

    // 2. Mutación para la Eliminación
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

    /**
     * Función auxiliar CORREGIDA para obtener el nombre del padre.
     * Accede directamente al objeto parent.name.
     */
    const getParentName = (category: Category): string => {
        // Accede al nombre del padre si el objeto 'parent' existe.
        if (category.parent && category.parent.name) {
            return category.parent.name;
        }
        return "— Principal —";
    };
    
    // Filtro de búsqueda (Busca por nombre o descripción)
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase() || '')
    );

    // Handlers para el formulario (sin cambios funcionales)
    const handleOpenForm = (category: Category | null = null) => {
        // IMPORTANTE: Aquí se asigna el objeto completo, que ahora incluye 'parent'
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
                                placeholder="Buscar por nombre o descripción..."
                                className="pl-9 dark:bg-gray-800 dark:text-gray-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                    {isLoading ? (
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
                                            {/* LLAMADA CORREGIDA: Usamos la función basada en el objeto completo */}
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
                    )}
                </CardContent>
            </Card>

            {/* Modal/Dialog de Creación/Edición */}
            <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">
                            {selectedCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                        </DialogTitle>
                    </DialogHeader>
                    {/* El initialData ahora tiene el objeto 'parent' */}
                    <CategoryForm 
                        initialData={selectedCategory}
                        onSuccess={handleFormClose}
                        onClose={handleFormClose}
                    />
                </DialogContent>
            </Dialog>

            {/* ... (Modal de Confirmación de Eliminación sin cambios) */}
        </div>
    );
};

export default Categories;