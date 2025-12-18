import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Search, Loader2, PlusCircle, Pencil, Trash2, Tag } from 'lucide-react';
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

import { Brand } from '../types'; 

import { getBrands, deleteBrand } from '../api/services/brand'; 

import BrandForm from '../components/forms/BrandForm'; 

const Brands: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [brandToDeleteId, setBrandToDeleteId] = useState<number | null>(null);
    const [brandToDeleteName, setBrandToDeleteName] = useState<string>('');


    const { 
        data: brands = [], 
        isLoading, 
        error 
    } = useQuery<Brand[]>({
        queryKey: ['brands'],
        queryFn: getBrands,
    });


    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBrand(id),
        onSuccess: () => {
            toast.success(`Marca "${brandToDeleteName}" eliminada.`);
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setIsDeleteConfirmOpen(false);
            setBrandToDeleteId(null);
            setBrandToDeleteName('');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Error al eliminar la marca. Podría estar en uso.";
            toast.error(errorMessage);
        }
    });


    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (brand.code && brand.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    const handleOpenForm = (brand: Brand | null = null) => {
        setSelectedBrand(brand);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedBrand(null);

        queryClient.invalidateQueries({ queryKey: ['brands'] });
    };


    const handleConfirmDelete = (brand: Brand) => {
        if (brand.id) {
            setBrandToDeleteId(brand.id);
            setBrandToDeleteName(brand.name);
            setIsDeleteConfirmOpen(true);
        }
    };

    const handleDeleteExecute = () => {
        if (brandToDeleteId) {
            deleteMutation.mutate(brandToDeleteId);
        }
    };


    if (error) {
        const message = error instanceof Error ? error.message : "Error desconocido.";
        let errorMessage = `Error al cargar las marcas: ${message}`;
        if (message.includes('403')) {
            errorMessage = "Acceso Denegado (403): No tienes permiso para ver las marcas.";
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
                        <Tag className="w-6 h-6 mr-3 text-indigo-500" />
                        Marcas (Brands)
                    </CardTitle>
                    <div className="flex space-x-4">
                        <div className="relative flex items-center w-full max-w-sm">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre o código..."
                                className="pl-9 dark:bg-gray-800 dark:text-gray-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => handleOpenForm(null)}
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Nueva Marca</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista de marcas...
                        </div>
                    ) : filteredBrands.length === 0 ? (
                        <div className="text-center p-8 space-y-2">
                            <p className="text-gray-500 dark:text-gray-400">
                                {brands.length === 0 
                                    ? "Aún no hay marcas registradas."
                                    : "No se encontraron marcas que coincidan con la búsqueda."}
                            </p>
                            {brands.length === 0 && (
                                <Button onClick={() => handleOpenForm(null)} variant="link" className="text-indigo-600">
                                    ¡Crea la primera ahora!
                                </Button>
                            )}
                        </div>
                    ) : (

                        <Table>
                            <TableHeader className="dark:bg-gray-800">
                                <TableRow>
                                    <TableHead className="w-[100px] text-gray-600 dark:text-gray-400">ID</TableHead>
                                    <TableHead className="w-[150px] text-gray-600 dark:text-gray-400">Código</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Nombre</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Sitio Web</TableHead>
                                    <TableHead className="text-center w-[120px] text-gray-600 dark:text-gray-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="dark:bg-gray-900">
                                {filteredBrands.map((brand) => (
                                    <TableRow key={brand.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                        <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{brand.id}</TableCell> 
                                        <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{brand.code || 'N/A'}</TableCell>
                                        <TableCell className="text-gray-800 dark:text-gray-200">{brand.name}</TableCell>
                                        <TableCell>
                                            {brand.website ? (
                                                <a 
                                                    href={brand.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-indigo-500 hover:text-indigo-600 underline text-sm"
                                                >
                                                    {brand.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No disponible</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleOpenForm(brand)}
                                                    className="text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => brand.id && handleConfirmDelete(brand)}
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
            <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="dark:text-gray-100">
                            {selectedBrand ? 'Editar Marca' : 'Crear Nueva Marca'}
                        </DialogTitle>
                    </DialogHeader>
                    {}
                    <BrandForm 
                        initialData={selectedBrand}
                        onSuccess={handleFormClose}
                        onClose={handleFormClose}
                    />
                </DialogContent>
            </Dialog>

            {}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-md dark:bg-gray-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Confirmar Eliminación</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-700 dark:text-gray-300 py-4">
                        ¿Estás seguro de que deseas eliminar la marca **{brandToDeleteName}**? Esta acción es irreversible y podría fallar si la marca está asociada a un producto.
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

export default Brands;