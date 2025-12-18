import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Tag, Calendar, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast.ts';
import { Promotion, PromotionService } from '../api/services/promotionService.ts';
import PromotionForm from '../components/forms/PromotionForm.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog.tsx';


const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};
const getStatusLabel = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (!promo.isActive) {
        return { text: 'INACTIVA', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
    if (now < start) {
        return { text: 'DEFINIDA Y EN ESPERA', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    }
    if (now >= start && now <= end) {
        return { text: 'ACTIVA', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    }
    if (now > end) {
        return { text: 'EXPIRADA', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
    }
    return { text: 'ERROR', className: 'bg-red-500 text-white' };
};

const Promotions: React.FC = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PromotionService.getAll();
      setPromotions(data);
    } catch (e: any) {
      console.error("Error fetching promotions:", e);
      const message = e.response?.status === 403 
        ? "No tienes permiso para ver esta sección (solo Admin)."
        : "El servicio de Promociones no está disponible.";
      
      setError(message);
      toast({
        title: "Error de Carga",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await PromotionService.delete(id);
      toast({
        title: "Eliminada",
        description: `La promoción '${name}' ha sido eliminada.`,
      });
      fetchPromotions();
    } catch (e: any) {
      console.error("Error deleting promotion:", e);
      const message = e.response?.status === 409
        ? "No se puede eliminar: está asociada a ventas históricas."
        : "Ocurrió un error al intentar eliminar la promoción.";

      toast({
        title: "Error de Eliminación",
        description: message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="p-4 md:p-8 dark:bg-gray-800 rounded-lg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Gestión de Promociones
        </h1>
        {}
        <PromotionForm onSuccess={fetchPromotions} /> 
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reglas de Descuento Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {}
          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-red-500 text-center p-8">{error}</p>}
          {!loading && !error && promotions.length === 0 && (
            <p className="text-center text-gray-500 p-8">No hay promociones registradas.</p>
          )}

          {!loading && !error && promotions.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre / Tipo</TableHead>
                    <TableHead>Valor / Aplica a</TableHead>
                    <TableHead className="w-[180px]">Vigencia</TableHead>
                    <TableHead className="w-[100px]">Estado</TableHead>
                    <TableHead className="w-[100px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => {
                    const status = getStatusLabel(promo);
                    return (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">
                            {promo.name}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Tipo: {promo.type.replace('_', ' ')}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-semibold text-primary">
                                {promo.type === 'PORCENTAJE' ? `${(promo.discountValue * 100).toFixed(0)}%` : `$${promo.discountValue.toFixed(2)}`}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Alcance: {promo.appliesTo.replace('_', ' ')}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                <Calendar className="h-4 w-4 mr-1.5 text-blue-500" /> 
                                {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                <Clock className="h-3 w-3 mr-1.5" /> 
                                {formatTime(promo.startDate)} a {formatTime(promo.endDate)}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                                {status.text}
                            </span>
                        </TableCell>
                        <TableCell className="flex justify-center space-x-2">
                          
                          {}
                          <PromotionForm 
                              initialData={promo} 
                              onSuccess={fetchPromotions}
                          />
                          
                          {}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Promoción {promo.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente la promoción. Asegúrate de que no afecte registros de ventas históricas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(promo.id, promo.name)}
                                  className="bg-red-600 hover:bg-red-700">
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Promotions;