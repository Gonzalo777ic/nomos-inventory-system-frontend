import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import ProductList from './ProductList';

/**
 * Products: Componente principal de la página Catálogo Maestro de Productos.
 * Ahora sirve como un simple wrapper para ProductList, si decides usarlo
 * como un componente de presentación de alto nivel.
 */
function Products() {


  
  return (

    <Card className="shadow-lg h-full">
        {}
        <ProductList /> 
    </Card>
  );
}

export default Products;
