import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map, PlusCircle, Pencil, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { getAllWarehouses, deleteWarehouse, Warehouse } from '@/api/services/warehouse'; 
import { useToast } from '@/components/ui/use-toast';
import WarehouseForm from '@/components/forms/WarehouseForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

/**
 * WarehousesPage: Gestión de Almacenes y Ubicaciones
 */
const WarehousesPage: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>(undefined);

    // 1. Obtener la lista de almacenes
    const { data: warehouses, isLoading, error } = useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: getAllWarehouses,
        // Refetch al volver a enfocar la ventana para mantener los datos frescos
        staleTime: 60000, 
    });

    // 2. Mutación para eliminar
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteWarehouse(id),
        onSuccess: () => {
            toast({ title: "Almacén Eliminado", description: "El almacén ha sido removido del sistema." });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        },
        onError: (error: any) => {
            console.error("Error al eliminar almacén:", error);
            // Mensaje de error más genérico para evitar exponer lógica de backend
            toast({
                title: "Error",
                description: "No se pudo eliminar el almacén. Puede que contenga inventario asociado.",
                variant: "destructive",
            });
        },
    });
    
    // --- Handlers de UI ---

    const handleOpenCreate = () => {
        setEditingWarehouse(undefined);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingWarehouse(undefined);
    };

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar el almacén "${name}"? Esta acción es irreversible y fallará si tiene inventario asociado.`)) {
            deleteMutation.mutate(id);
        }
    };
    
    // --- Renderizado de Estados ---

    if (error) {
        const message = error instanceof Error ? error.message : "Error desconocido.";
        return (
            <Alert variant="destructive">
                <AlertTitle>Error al cargar almacenes</AlertTitle>
                <AlertDescription>
                    Ocurrió un error al obtener la lista de almacenes: {message}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Map className="h-5 w-5" /> Gestión de Almacenes y Ubicaciones
                    </CardTitle>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700">
                                <PlusCircle className="w-4 h-4 mr-2" /> Crear Nuevo Almacén
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingWarehouse ? 'Editar Almacén' : 'Crear Nuevo Almacén'}</DialogTitle>
                            </DialogHeader>
                            <WarehouseForm 
                                defaultWarehouse={editingWarehouse}
                                onSuccess={handleCloseForm}
                            />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando ubicaciones...
                        </div>
                    ) : (warehouses && warehouses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead className="text-center">Principal</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {warehouses.map((warehouse) => (
                                    <TableRow key={warehouse.id}>
                                        <TableCell className="font-medium">{warehouse.name}</TableCell> 
                                        <TableCell>{warehouse.locationAddress}</TableCell>
                                        <TableCell className="text-center">
                                            {warehouse.isMain ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Principal
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <XCircle className="w-3 h-3 mr-1" /> Secundario
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleOpenEdit(warehouse)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDelete(warehouse.id, warehouse.name)}
                                                disabled={deleteMutation.isPending || warehouse.isMain}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center p-12 space-y-4">
                            <Map className="w-16 h-16 mx-auto text-gray-400" />
                            <h2 className="text-2xl font-semibold">No hay almacenes registrados.</h2>
                            <p className="text-muted-foreground">Comienza creando tu almacén principal.</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default WarehousesPage;