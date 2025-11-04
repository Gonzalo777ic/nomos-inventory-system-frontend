import React from 'react';

const RealtimeLocation: React.FC = () => {
  return (
    <div className="p-8 dark:bg-gray-800 rounded-lg min-h-[500px]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Ubicación en Tiempo Real</h1>
      <p className="text-gray-700 dark:text-gray-300">Visualización de la ubicación de los vehículos o repartidores.</p>
    </div>
  );
};

export default RealtimeLocation;
