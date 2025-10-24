import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Package, PlusCircle, Search, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query'; 
import { getProducts, Product } from '../api/services/products'; 
import { getProductTotalStock } from '../api/services/inventory-items';
import LotManagementModal from '../components/LotManagementModal'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useAuth } from '../hooks/useAuth'; // Importación del hook de autenticación

type ProductWithStock = Product & { totalStock: number; };

/**
 * Inventory: Componente principal que permite al usuario seleccionar un producto
 * para luego gestionar sus lotes (InventoryItem CRUD).
 */
function Inventory() {
  const queryClient = useQueryClient(); 
  
  // CORRECCIÓN: Renombramos 'isLoading' a 'isAuthLoading' y eliminamos 'error: authError'
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth(); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([]);
  const [isStockLoading, setIsStockLoading] = useState(false);
  
  // 1. Obtener la lista de productos
  const { 
    data: products, 
    isLoading: isLoadingProducts, 
    error: queryError // Usaremos este error para mostrar fallas de API
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts,
    // La consulta solo se ejecuta si la autenticación está lista
    enabled: isAuthenticated && !isAuthLoading, 
  });

  // 2. Obtener el stock total por producto
  useEffect(() => {
    const productsArray = products || []; 

    const fetchStocks = async () => {
      if (productsArray.length > 0) {
        setIsStockLoading(true);
        try {
          const productPromises = productsArray.map(async (p) => {
            const productId = Number(p.id); 
            if (isNaN(productId)) return null; 
            const totalStock = await getProductTotalStock(productId);
            return { ...p, totalStock } as ProductWithStock;
          });
          const results = (await Promise.all(productPromises)).filter(p => p !== null) as ProductWithStock[];
          setProductsWithStock(results); 
        } catch (err) {
          console.error("Error fetching product stocks:", err);
        } finally {
          setIsStockLoading(false);
        }
      } else {
        setProductsWithStock([]);
        setIsStockLoading(false);
      }
    };

    if (!isLoadingProducts && isAuthenticated) {
        fetchStocks();
    }
  }, [products, isLoadingProducts, isAuthenticated]); 

  
  // Filtro de búsqueda
  const filteredProducts = productsWithStock.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenLotManagement = (productId: number) => {
    setSelectedProductId(productId);
    // Capturar el nombre del producto para el encabezado del modal
    const product = productsWithStock.find(p => Number(p.id) === productId);
    setSelectedProductName(product ? product.name : null);
  };

  const handleCloseLotManagement = () => {
    setSelectedProductId(null);
    setSelectedProductName(null);
  };
  
  // Handler para forzar la actualización de la tabla principal
  const handleLotUpdate = () => {
      // Invalida la query principal 'products', forzando el re-fetch de productos y el re-cálculo de stock
      queryClient.invalidateQueries({ queryKey: ['products'] }); 
  };

  // Usamos solo queryError como fuente de error para la vista.
  const currentError = queryError; 

  if (isAuthLoading) {
    return (
        <div className="flex items-center justify-center p-12 text-lg text-gray-500">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Verificando autenticación...
        </div>
    );
  }

  if (currentError) {
    const message = currentError instanceof Error ? currentError.message : "Un error desconocido ha ocurrido.";
    let errorMessage = `Error al cargar la lista de productos: ${message}`;
    if (message.includes('403') || message.includes('Forbidden')) {
        errorMessage = "Acceso Denegado (403): Tu cuenta no tiene permiso para ver el inventario.";
    } else if (message.includes('401') || message.includes('Unauthorized')) {
        errorMessage = "No Autorizado (401): Por favor, inicia sesión de nuevo.";
    }

    return (
      <Card className="p-6">
        <p className="text-red-500 font-semibold">{errorMessage}</p>
        <p className="text-sm text-gray-500 mt-2">Asegúrate de que la API está disponible y que tu cuenta tiene los permisos correctos.</p>
      </Card>
    );
  }

  if (products && products.length === 0 && !isLoadingProducts) {
      return (
          <div className="text-center p-12 space-y-4">
              <Package className="w-16 h-16 mx-auto text-gray-400" />
              <h2 className="text-2xl font-semibold">No hay productos registrados en el catálogo.</h2>
              <p className="text-muted-foreground">Debes añadir productos antes de gestionar el inventario.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 p-4">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Productos para Inventariar</CardTitle>
                <div className="relative flex items-center w-full max-w-sm">
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o SKU..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
            {isLoadingProducts || isStockLoading ? (
                <div className="flex items-center justify-center p-8 text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando lista y calculando existencias...
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock Total</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.sku}</TableCell> 
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                product.totalStock <= 5 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 
                                product.totalStock <= 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            }`}>
                            {product.totalStock} unidades
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenLotManagement(Number(product.id))}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" /> Gestionar Lotes
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>

        {/* DIALOGO DE GESTIÓN DE LOTES (LotManagementModal) */}
        <Dialog open={selectedProductId !== null} onOpenChange={handleCloseLotManagement}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Gestión de Lotes de Inventario: {selectedProductName || 'Cargando...'}</DialogTitle>
                </DialogHeader>
                {selectedProductId !== null && (
                    <LotManagementModal 
                        productId={selectedProductId}
                        productName={selectedProductName}
                        onLotUpdate={handleLotUpdate}
                        onClose={handleCloseLotManagement}
                    />
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default Inventory;
