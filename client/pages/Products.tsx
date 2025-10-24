import React from 'react';
// 🎯 Eliminamos la importación de Layout
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import ProductList from './ProductList'; // 🎯 Importamos el componente de lista

/**
 * Products: Componente principal de la página Catálogo Maestro de Productos.
 * Ahora sirve como un simple wrapper para ProductList, si decides usarlo
 * como un componente de presentación de alto nivel.
 */
function Products() {
  // 🎯 Eliminamos toda la lógica de estado (useState, useEffect, handle...)
  // 🎯 Ahora la lógica de la lista y el formulario está en ProductList.tsx
  
  return (
    // 🎯 ELIMINAMOS <Layout> ya que lo maneja la ruta en App.tsx
    <Card className="shadow-lg h-full">
        {/* Usamos Card para mantener el estilo de la página */}
        <ProductList /> 
    </Card>
  );
}

export default Products;
