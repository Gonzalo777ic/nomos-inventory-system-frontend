import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Pencil } from 'lucide-react'; // 🛑 Añadimos Pencil (Editar)

// Se asume que estos paths ya tienen la extensión .ts/.tsx corregida
import { useToast } from '../hooks/use-toast.ts';
import { TaxRate, TaxRateService } from '../api/services/taxRate.ts';
// Asegúrate de que TaxRateForm.tsx es el componente reutilizable que definimos antes
import TaxRateForm from '../components/forms/TaxRateForm.tsx'; 
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog.tsx';

const Taxes: React.FC = () => {
  const { toast } = useToast();
  const [rates, setRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TaxRateService.getAll();
      setRates(data);
    } catch (e) {
      console.error("Error fetching tax rates:", e);
      // Mantener mensaje amigable para el usuario final
      setError("No tienes permiso o el servicio no está disponible (puerto 8083)."); 
      toast({
        title: "Error de Carga",
        description: "Error al cargar las tasas. Verifica la conexión o tus permisos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await TaxRateService.delete(id);
      toast({
        title: "Eliminada",
        description: `La tasa '${name}' ha sido eliminada.`,
      });
      fetchRates(); // Refrescar la lista
    } catch (e) {
      console.error("Error deleting tax rate:", e);
      toast({
        title: "Error de Eliminación",
        description: "No se pudo eliminar la tasa de impuesto. ¿Tiene el rol de Administrador?",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="p-4 md:p-8 dark:bg-gray-800 rounded-lg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tasas de Impuesto</h1>
        {/* Usamos TaxRateForm en modo CREACIÓN (sin initialData) */}
        <TaxRateForm onSuccess={fetchRates} /> 
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasas Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-red-500 text-center p-8">{error}</p>}
          {!loading && !error && rates.length === 0 && (
            <p className="text-center text-gray-500 p-8">No hay tasas de impuesto registradas.</p>
          )}

          {!loading && !error && rates.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[100px]">Tasa</TableHead>
                    <TableHead className="w-[100px] text-center">Acciones</TableHead> {/* Centramos Acciones */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.name}</TableCell>
                      <TableCell>{(rate.rate * 100).toFixed(2)}%</TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        
                        {/* 🛑 BOTÓN DE EDICIÓN (Usando el formulario reutilizable) 🛑 */}
                        <TaxRateForm 
                            initialData={rate} 
                            onSuccess={fetchRates}
                            trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary-dark">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            }
                        />
                        
                        {/* 🛑 BOTÓN DE ELIMINACIÓN 🛑 */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar Tasa {rate.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente la tasa de impuesto **{rate.name}** del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(rate.id!, rate.name)}
                                className="bg-red-600 hover:bg-red-700">
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Taxes;