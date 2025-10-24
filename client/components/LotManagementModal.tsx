import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// Asegúrate de que la ruta a los tipos y servicios sea correcta
import { InventoryItem } from '../types'; 
import { getInventoryItemsByProduct } from '../api/services/inventory-items'; 
import InventoryItemForm from './forms/InventoryItemForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Separator } from './ui/separator';

interface LotManagementModalProps {
    productId: number;
    productName: string | null; // Para mostrar en el encabezado
    onLotUpdate: () => void; // Para forzar la actualización del stock total en Inventory.tsx
    onClose: () => void; // Para cerrar el modal
}

const LotManagementModal: React.FC<LotManagementModalProps> = ({ productId, productName, onLotUpdate, onClose }) => {
    // 🎯 Controla la vista: true = Formulario de Añadir Lote, false = Lista de Lotes
    const [showAddForm, setShowAddForm] = useState(false); 

    // 🎯 QUERY: Obtener la lista de lotes para este producto
    const { data: lots, isLoading: isLoadingLots, error: lotsError, refetch } = useQuery<InventoryItem[]>({
        queryKey: ['productLots', productId],
        queryFn: () => getInventoryItemsByProduct(productId), 
        enabled: !!productId, 
    });

    const handleFormSuccess = () => {
        // 1. Refresca la lista de lotes en este modal
        refetch();
        // 2. Avisa al padre (Inventory.tsx) para que actualice el stock total
        onLotUpdate(); 
        // 3. Vuelve a la vista de lista
        setShowAddForm(false);
    };

    if (isLoadingLots) {
        return <div className="p-4 flex justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lotes de {productName}...</div>;
    }

    if (lotsError) {
        return <p className="p-4 text-red-500">Error al cargar los lotes.</p>;
    }

    // --- Vista del Formulario de Añadir Nuevo Lote ---
    if (showAddForm) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="mb-4">
                    ← Volver a la Lista de Lotes
                </Button>
                <h3 className="text-xl font-semibold">Añadir Nuevo Lote a: {productName}</h3>
                <InventoryItemForm
                    productId={productId}
                    // defaultItem no se pasa ya que solo estamos creando
                    onSuccess={handleFormSuccess}
                    onClose={() => setShowAddForm(false)} 
                />
            </div>
        );
    }
    
    // --- Vista principal: Lista de lotes ---
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lotes Activos:</h3>
                <Button onClick={() => setShowAddForm(true)}>
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
                                <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                                <TableCell>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell>{new Date(item.entryDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    {/* Ya que los lotes son inmutables, solo permitir eliminación (ajuste) */}
                                    <Button size="sm" variant="destructive" disabled>
                                        Ajustar Stock (Futuro)
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>No hay lotes registrados para este producto.</p>
                    <Button onClick={() => setShowAddForm(true)} className="mt-4">
                        <PlusCircle className="w-4 h-4 mr-2" /> Registrar el Primer Lote
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LotManagementModal;