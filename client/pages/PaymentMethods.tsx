import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Wallet } from 'lucide-react';
import { useToast } from '../hooks/use-toast.ts';
import { PaymentMethodConfig, PaymentMethodService } from '../api/services/paymentMethodConfig';
import PaymentMethodForm from '../components/forms/PaymentMethodForm';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog.tsx';

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PaymentMethodService.getAll();
      setMethods(data);
    } catch (e: any) {
      console.error("Error fetching payment methods:", e);

      const message = e.response?.status === 403 
        ? "No tienes permiso para ver esta configuración."
        : "El servicio no está disponible o hay un error de conexión (puerto 8083).";
      
      setError(message);
      toast({
        title: "Error de Carga",
        description: "Error al cargar los métodos de pago. Verifica la conexión o tus permisos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await PaymentMethodService.delete(id);
      toast({
        title: "Eliminado",
        description: `El método '${name}' ha sido eliminado.`,
      });
      fetchMethods();
    } catch (e: any) {
      console.error("Error deleting payment method:", e);
      const message = e.response?.status === 403
        ? "Solo los administradores pueden eliminar métodos de pago."
        : "No se pudo eliminar el método. Puede que esté siendo usado en ventas existentes.";

      toast({
        title: "Error de Eliminación",
        description: message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  return (
    <div className="p-4 md:p-8 dark:bg-gray-800 rounded-lg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Métodos de Pago
        </h1>
        {}
        <PaymentMethodForm onSuccess={fetchMethods} /> 
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-red-500 text-center p-8">{error}</p>}
          {!loading && !error && methods.length === 0 && (
            <p className="text-center text-gray-500 p-8">No hay métodos de pago registrados. Comience creando uno.</p>
          )}

          {!loading && !error && methods.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre del Método</TableHead>
                    <TableHead className="w-[150px]">Tipo</TableHead>
                    <TableHead className="w-[100px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="text-sm text-gray-500">{method.id}</TableCell>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            method.type === 'EFECTIVO' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            method.type === 'TARJETA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            method.type === 'ELECTRÓNICO' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            {method.type}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        
                        {}
                        <PaymentMethodForm 
                            initialData={method} 
                            onSuccess={fetchMethods}
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
                              <AlertDialogTitle>¿Eliminar {method.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el método **{method.name}**. Asegúrate de que no esté en uso.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(method.id, method.name)}
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

export default PaymentMethods;