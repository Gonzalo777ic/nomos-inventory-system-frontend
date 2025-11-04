import React from 'react';

const Purchases: React.FC = () => {
  return (
    <div className="p-8 dark:bg-gray-800 rounded-lg min-h-[500px]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Órdenes de Abastecimiento</h1>
      <p className="text-gray-700 dark:text-gray-300">Aquí se gestionarán las órdenes de compra a proveedores.</p>
    </div>
  );
};

export default Purchases;
