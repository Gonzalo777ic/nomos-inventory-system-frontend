import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Search, Loader2, PlusCircle, Pencil, Trash2, Scale } from 'lucide-react';
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
import { UnitOfMeasure } from '../types'; 
import { getUnitsOfMeasure, deleteUnitOfMeasure } from '../api/services/unitOfMeasure'; 
import UOMForm from '../components/forms/UOMForm'; 

const UOM: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUOM, setSelectedUOM] = useState<UnitOfMeasure | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [uomToDeleteId, setUomToDeleteId] = useState<number | null>(null);
    const [uomToDeleteName, setUomToDeleteName] = useState<string>('');

    // 1. Obtener la lista de Unidades de Medida
    const { 
        data: unitsOfMeasure = [], 
        isLoading, 
        error 
    } = useQuery<UnitOfMeasure[]>({
        queryKey: ['unitsOfMeasure'],
        queryFn: getUnitsOfMeasure,
    });

    // 2. Mutación para la Eliminación
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteUnitOfMeasure(id),
        onSuccess: () => {
            toast.success(`Unidad de medida "${uomToDeleteName}" eliminada.`);
            queryClient.invalidateQueries({ queryKey: ['unitsOfMeasure'] });
            setIsDeleteConfirmOpen(false);
            setUomToDeleteId(null);
            setUomToDeleteName('');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Error al eliminar la unidad. Podría estar en uso.";
            toast.error(errorMessage);
        }
    });

    // Filtro de búsqueda
    const filteredUOMs = unitsOfMeasure.filter(uom =>
        uom.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        // Corregido: Usamos 'abbreviation'
        uom.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers para el formulario
    const handleOpenForm = (uom: UnitOfMeasure | null = null) => {
        setSelectedUOM(uom);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedUOM(null);
    };

    // Handlers para la eliminación
    const handleConfirmDelete = (uom: UnitOfMeasure) => {
        if (uom.id) {
            setUomToDeleteId(uom.id);
            setUomToDeleteName(uom.name);
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleDeleteExecute = () => {
        if (uomToDeleteId) {
            deleteMutation.mutate(uomToDeleteId);
        }
    };

    if (error) {
        const message = error instanceof Error ? error.message : "Error desconocido.";
        let errorMessage = `Error al cargar unidades de medida: ${message}`;
        if (message.includes('403')) {
            errorMessage = "Acceso Denegado (403): No tienes permiso para ver las unidades de medida.";
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
                        <Scale className="w-6 h-6 mr-3 text-emerald-500" />
                        Unidades de Medida (UOM)
                    </CardTitle>
                    <div className="flex space-x-4">
                        <div className="relative flex items-center w-full max-w-sm">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                            <Input
                                // Corregido: Buscar por nombre o abreviatura
                                placeholder="Buscar por nombre o abreviatura..."
                                className="pl-9 dark:bg-gray-800 dark:text-gray-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => handleOpenForm(null)}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Nueva Unidad</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista de unidades...
                        </div>
                    ) : filteredUOMs.length === 0 ? (
                        <div className="text-center p-8 space-y-2">
                            <p className="text-gray-500 dark:text-gray-400">
                                {unitsOfMeasure.length === 0 
                                    ? "Aún no hay unidades de medida registradas."
                                    : "No se encontraron unidades que coincidan con la búsqueda."}
                            </p>
                            {unitsOfMeasure.length === 0 && (
                                <Button onClick={() => handleOpenForm(null)} variant="link" className="text-emerald-600">
                                    ¡Crea la primera ahora!
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="dark:bg-gray-800">
                                <TableRow>
                                    <TableHead className="w-[100px] text-gray-600 dark:text-gray-400">ID</TableHead>
                                    {/* Corregido: Título de columna 'Abreviatura' */}
                                    <TableHead className="w-[150px] text-gray-600 dark:text-gray-400">Abreviatura</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Nombre</TableHead>
                                    {/* Corregido: Eliminada la columna Descripción */}
                                    <TableHead className="text-center w-[120px] text-gray-600 dark:text-gray-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="dark:bg-gray-900">
                                {filteredUOMs.map((uom) => (
                                    <TableRow key={uom.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                        <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{uom.id}</TableCell> 
                                        {/* Corregido: Mostramos 'abbreviation' */}
                                        <TableCell className="font-semibold text-lg text-gray-900 dark:text-gray-100">{uom.abbreviation}</TableCell>
                                        <TableCell className="text-gray-800 dark:text-gray-200">{uom.name}</TableCell>
                                        {/* Corregido: Eliminada la celda de descripción */}
                                        <TableCell className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleOpenForm(uom)}
                                                    className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => uom.id && handleConfirmDelete(uom)}
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
                            {selectedUOM ? 'Editar Unidad de Medida' : 'Crear Nueva Unidad de Medida'}
                        </DialogTitle>
                    </DialogHeader>
                    <UOMForm 
                        initialData={selectedUOM}
                        onSuccess={() => { /* No necesita lógica extra */ }}
                        onClose={handleFormClose}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmación de Eliminación */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-md dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Confirmar Eliminación</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 dark:text-gray-300 py-4">
                        ¿Estás seguro de que deseas eliminar la unidad **{uomToDeleteName}**? Esta acción es irreversible y podría fallar si la unidad está asociada a un producto.
                    </p>
                    <DialogFooter className="flex justify-between">
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
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            <span>{deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UOM;