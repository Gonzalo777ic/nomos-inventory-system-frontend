import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from './ui/dialog.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import { Button } from './ui/button.tsx';
import { Loader2, UserPlus, UserMinus, Search, ShieldCheck } from 'lucide-react';
import { InternalUserService } from '../api/services/internalUserService.ts';
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

    const { data: allUsers, isLoading } = useQuery({
        queryKey: ['internal-users'],
        queryFn: InternalUserService.getAll,
        enabled: isOpen
    });

    const updateSyncMutation = useMutation({
        mutationFn: ({ userId, sId }: { userId: number, sId: number | null }) => 
            InternalUserService.updateSupplierAssignment(userId, sId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['internal-users'] });
            toast.success('Vinculación actualizada correctamente.');
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

    return (
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
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={2} className="text-center py-4"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                                    ) : linkedUsers.length === 0 ? (
                                        <TableRow><TableCell colSpan={2} className="text-center py-4 text-gray-400 text-sm">No hay usuarios vinculados.</TableCell></TableRow>
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
                                                    <UserMinus className="w-4 h-4 mr-1" /> Quitar
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
                                placeholder="Buscar usuarios con ROLE_SUPPLIER..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                            <Table>
                                <TableBody>
                                    {availableUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.username}</span>
                                                    {user.supplierId && (
                                                        <span className="text-[10px] text-amber-600 font-bold">
                                                            ️ Ya vinculado a otra empresa
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="text-indigo-600 border-indigo-200"
                                                    onClick={() => updateSyncMutation.mutate({ userId: user.id, sId: supplierId })}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-1" /> Vincular
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SupplierUsersManager;