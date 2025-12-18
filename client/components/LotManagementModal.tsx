import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { InventoryItem } from '../types'; 


import { getInventoryItemsByProduct } from '../api/services/inventory-items'; 


import InventoryItemForm from './forms/InventoryItemForm';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Loader2, PlusCircle, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { Separator } from './ui/separator';

interface LotManagementModalProps {
    productId: number;
    productName: string | null;
    onLotUpdate: () => void;
    onClose: () => void;
}


const DEFAULT_WAREHOUSE_ID = 1;

const LotManagementModal: React.FC<LotManagementModalProps> = ({ productId, productName, onLotUpdate, onClose }) => {

    const [showAddForm, setShowAddForm] = useState(false); 
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);


    const { data: lots, isLoading: isLoadingLots, error: lotsError, refetch } = useQuery<InventoryItem[]>({
        queryKey: ['productLots', productId],
        queryFn: () => getInventoryItemsByProduct(productId), 
        enabled: !!productId, 
    });



    const handleFormSuccess = () => {

        refetch();

        onLotUpdate(); 

        setShowAddForm(false);
        setEditingItem(undefined);
    };

    const handleOpenEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setShowAddForm(true);
    };

    const handleNewLot = () => {
        setEditingItem(undefined);
        setShowAddForm(true);
    };

    const handleDelete = (itemId: number) => {

        if (window.confirm('¿Estás seguro de que quieres eliminar este lote? Esta acción es irreversible.')) {

            setDeletingId(itemId);


            

            setTimeout(() => {

                console.log(`Simulando eliminación del lote: ${itemId}`);
                setDeletingId(null);
                handleFormSuccess();
            }, 500);
        }
    };
    


    if (isLoadingLots) {
        return <div className="p-4 flex justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lotes de {productName}...</div>;
    }

    if (lotsError) {
        return <p className="p-4 text-red-500">Error al cargar los lotes.</p>;
    }


    if (showAddForm) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="mb-4">
                    ← Volver a la Lista de Lotes
                </Button>
                <h3 className="text-xl font-semibold">{editingItem ? 'Editar Lote' : 'Añadir Nuevo Lote'} a: {productName}</h3>
                <InventoryItemForm
                    productId={productId}
                    warehouseId={DEFAULT_WAREHOUSE_ID}
                    defaultItem={editingItem}
                    onSuccess={handleFormSuccess}
                    onClose={() => setShowAddForm(false)} 
                />
            </div>
        );
    }
    

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lotes Activos:</h3>
                <Button onClick={handleNewLot}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Añadir Nuevo Lote
                </Button>
            </div>
            
            <Separator />

            {lots && lots.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lote #</TableHead>
                            <TableHead>Stock Actual</TableHead>
                            <TableHead>Costo Unitario</TableHead>
                            <TableHead>F. Vencimiento</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>F. Entrada</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lots.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.lotNumber}</TableCell>
                                <TableCell>{item.currentStock}</TableCell>
                                <TableCell>S/.{item.unitCost.toFixed(2)}</TableCell>
                                <TableCell>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</TableCell>
                                {}
                                <TableCell>{item.location}</TableCell> 
                                <TableCell>{new Date(item.entryDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2 flex justify-end">
                                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(item)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>No hay lotes registrados para este producto.</p>
                    <Button onClick={handleNewLot} className="mt-4">
                        <PlusCircle className="w-4 h-4 mr-2" /> Registrar el Primer Lote
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LotManagementModal;
