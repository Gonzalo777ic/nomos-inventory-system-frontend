import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { PlusCircle, Search, Loader2, Edit, Trash2, Building2, User, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // Importación consistente
import { Supplier } from '../types'; // Tipo del proveedor
import { toast } from 'sonner';

// Importamos las funciones de la API
import { getSuppliers, deleteSupplier } from '../api/services/supplier';

// Importamos el modal del formulario
import SupplierFormModal from '../components/SupplierFormModal'; 


/**
 * SuppliersPage: Componente principal para la gestión de proveedores (CRUD).
 */
function SuppliersPage() {
    const queryClient = useQueryClient();
    // 1. Hook de autenticación
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

    // 2. Obtener la lista de proveedores (GET)
    const {
        data: suppliers,
        isLoading: isLoadingSuppliers,
        error: queryError,
    } = useQuery<Supplier[]>({
        queryKey: ['suppliers'],
        queryFn: getSuppliers, // Función de API real
        enabled: isAuthenticated && !isAuthLoading,
    });

    // 3. Mutación para eliminación (DELETE)
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Proveedor eliminado con éxito.');
        },
        onError: (err: any) => {
            toast.error(`Fallo al eliminar: ${err.message || 'Error de conexión.'}`);
        }
    });

    // 4. Filtro de búsqueda (uso de useMemo para optimización)
    const filteredSuppliers = useMemo(() => {
        if (!suppliers) return [];
        const lowerCaseSearch = searchTerm.toLowerCase();
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(lowerCaseSearch) ||
            s.contactName.toLowerCase().includes(lowerCaseSearch) ||
            s.email.toLowerCase().includes(lowerCaseSearch) ||
            s.taxId.toLowerCase().includes(lowerCaseSearch)
        );
    }, [suppliers, searchTerm]);

    // Handlers para el modal
    const handleAddSupplier = () => {
        setSupplierToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setSupplierToEdit(supplier);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSupplierToEdit(null);
    };

    const handleDelete = (id: number, name: string) => {
        // Mejorar esto con un modal de confirmación en un entorno real
        if (window.confirm(`¿Estás seguro de que quieres eliminar al proveedor "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    // --- RENDERIZADO DE ESTADOS ---

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center p-12 text-lg text-gray-500">
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Verificando autenticación...
            </div>
        );
    }

    if (queryError) {
        const message = queryError instanceof Error ? queryError.message : "Un error desconocido ha ocurrido.";
        let errorMessage = `Error al cargar la lista de proveedores: ${message}`;
        // Lógica de manejo de errores consistente con Inventory
        if (message.includes('403') || message.includes('Forbidden')) {
            errorMessage = "Acceso Denegado (403): Tu cuenta no tiene permiso para ver proveedores.";
        } else if (message.includes('401') || message.includes('Unauthorized')) {
            errorMessage = "No Autorizado (401): Por favor, inicia sesión de nuevo.";
        }

        return (
            <Card className="p-6 m-4 shadow-lg">
                <p className="text-red-500 font-semibold">{errorMessage}</p>
                <p className="text-sm text-gray-500 mt-2">Asegúrate de que la API está disponible y que tu cuenta tiene los permisos correctos.</p>
            </Card>
        );
    }

    const noSuppliers = suppliers && suppliers.length === 0 && !isLoadingSuppliers;

    return (
        <div className="space-y-6 p-4">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0 pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                        Gestión de Proveedores
                    </CardTitle>

                    <div className="flex space-x-4">
                        <div className="relative flex items-center w-full max-w-xs">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, RUC o contacto..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddSupplier}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Nuevo Proveedor
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoadingSuppliers ? (
                        <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista de proveedores...
                        </div>
                    ) : noSuppliers ? (
                        <div className="text-center p-12 space-y-4">
                            <Building2 className="w-16 h-16 mx-auto text-gray-400" />
                            <h2 className="text-2xl font-semibold">No hay proveedores registrados.</h2>
                            <p className="text-muted-foreground">Utiliza el botón "Nuevo Proveedor" para comenzar.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">ID Fiscal (RUC)</TableHead>
                                        <TableHead>Compañía</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSuppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">{supplier.taxId}</TableCell>
                                            <TableCell className="font-semibold">{supplier.name}</TableCell>
                                            <TableCell className="flex items-center space-x-1">
                                                <User className="w-4 h-4 text-green-500" />
                                                <span>{supplier.contactName}</span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground flex items-center space-x-1">
                                                <Mail className="w-4 h-4 text-red-500" />
                                                <span>{supplier.email}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Editar"
                                                        onClick={() => handleEditSupplier(supplier)}
                                                    >
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Eliminar"
                                                        onClick={() => handleDelete(supplier.id, supplier.name)}
                                                        disabled={deleteMutation.isPending && deleteMutation.variables === supplier.id}
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables === supplier.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                     {filteredSuppliers.length === 0 && suppliers && suppliers.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                                No se encontraron proveedores que coincidan con la búsqueda.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* MODAL DE GESTIÓN (Añadir/Editar) */}
            <SupplierFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                supplierToEdit={supplierToEdit}
            />
        </div>
    );
}

export default SuppliersPage;