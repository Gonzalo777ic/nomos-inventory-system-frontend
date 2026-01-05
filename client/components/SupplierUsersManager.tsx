import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from './ui/dialog.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import { Button } from './ui/button.tsx';
import { Loader2, UserPlus, UserMinus, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { InternalUserService, InternalUser } from '../api/services/internalUserService.ts';
import { getSuppliers } from '../api/services/supplier.ts';
import { Input } from './ui/input.tsx';
import { toast } from 'sonner';

interface SupplierUsersManagerProps {
    isOpen: boolean;
    onClose: () => void;
    supplierId: number;
    supplierName: string;
}

const SupplierUsersManager: React.FC<SupplierUsersManagerProps> = ({ isOpen, onClose, supplierId, supplierName }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    
    const [confirmingUser, setConfirmingUser] = useState<InternalUser | null>(null);

    const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['internal-users'],
        queryFn: InternalUserService.getAll,
        enabled: isOpen
    });

    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: getSuppliers,
        enabled: isOpen
    });

    const getSupplierNameById = (id: number | null) => {
        if (!id || !suppliers) return "Empresa Desconocida";
        return suppliers.find(s => s.id === id)?.name || `ID: ${id}`;
    };

    const updateSyncMutation = useMutation({
        mutationFn: ({ userId, sId }: { userId: number, sId: number | null }) => 
            InternalUserService.updateSupplierAssignment(userId, sId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['internal-users'] });
            toast.success('Acceso actualizado correctamente.');
            setConfirmingUser(null);
        },
        onError: () => toast.error('Error al actualizar la vinculación.')
    });

    const linkedUsers = useMemo(() => 
        (allUsers || []).filter(u => u.supplierId === supplierId), 
    [allUsers, supplierId]);

    const availableUsers = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return (allUsers || []).filter(u => 
            (u.roles || []).includes('ROLE_SUPPLIER') && 
            u.supplierId !== supplierId &&
            (u.username.toLowerCase().includes(lowerSearch))
        );
    }, [allUsers, supplierId, searchTerm]);

    const handleAssignClick = (user: InternalUser) => {
        if (user.supplierId) {
            setConfirmingUser(user);
        } else {
            updateSyncMutation.mutate({ userId: user.id, sId: supplierId });
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="text-indigo-600" />
                            Accesos de Usuario: {supplierName}
                        </DialogTitle>
                        <DialogDescription>
                            Asigne qué usuarios con rol de proveedor pueden gestionar las órdenes de esta compañía.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Usuarios con Acceso Actual</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead>Usuario / Email</TableHead>
                                            <TableHead className="text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingUsers ? (
                                            <TableRow><TableCell colSpan={2} className="text-center py-4"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                        ) : linkedUsers.length === 0 ? (
                                            <TableRow><TableCell colSpan={2} className="text-center py-4 text-gray-400 text-sm">No hay usuarios vinculados a esta empresa.</TableCell></TableRow>
                                        ) : linkedUsers.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => updateSyncMutation.mutate({ userId: user.id, sId: null })}
                                                    >
                                                        <UserMinus className="w-4 h-4 mr-1" /> Quitar Acceso
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Vincular Nuevo Usuario</h4>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input 
                                    placeholder="Buscar usuarios por email..." 
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[250px] overflow-y-auto border rounded-lg">
                                <Table>
                                    <TableBody>
                                        {availableUsers.map(user => (
                                            <TableRow key={user.id} className="hover:bg-gray-50/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{user.username}</span>
                                                        {user.supplierId && (
                                                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                                                                <AlertCircle className="w-3 h-3" />
                                                                Vinculado a: {getSupplierNameById(user.supplierId)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        size="sm" 
                                                        variant={user.supplierId ? "secondary" : "outline"}
                                                        className={user.supplierId ? "text-gray-600" : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"}
                                                        onClick={() => handleAssignClick(user)}
                                                        disabled={updateSyncMutation.isPending}
                                                    >
                                                        {updateSyncMutation.isPending && updateSyncMutation.variables?.userId === user.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-4 h-4 mr-1" />
                                                                {user.supplierId ? "Reasignar" : "Vincular"}
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {availableUsers.length === 0 && !isLoadingUsers && (
                                            <TableRow><TableCell className="text-center py-4 text-gray-400 text-xs italic">No hay usuarios disponibles para mostrar.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button onClick={onClose} variant="outline">Cerrar Administrador</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!confirmingUser} onOpenChange={() => setConfirmingUser(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertCircle />
                            Confirmar Reasignación de Empresa
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-2 text-gray-700">
                            El usuario <span className="font-bold text-gray-900">{confirmingUser?.username}</span> ya está vinculado a la empresa 
                            <span className="font-bold block text-indigo-600 my-1">{getSupplierNameById(confirmingUser?.supplierId || null)}</span>
                            ¿Está seguro de reasignarlo a <span className="font-bold text-emerald-600">{supplierName}</span>? 
                            <br/><br/>
                            Esto revocará inmediatamente su acceso a la información del proveedor anterior.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                                if (confirmingUser) {
                                    updateSyncMutation.mutate({ userId: confirmingUser.id, sId: supplierId });
                                }
                            }}
                        >
                            Confirmar Reasignación
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default SupplierUsersManager;