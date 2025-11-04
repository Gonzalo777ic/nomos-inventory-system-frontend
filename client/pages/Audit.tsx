import React from 'react';

const Audit: React.FC = () => {
  return (
    <div className="p-8 dark:bg-gray-800 rounded-lg min-h-[500px]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registro de Auditoría</h1>
      <p className="text-gray-700 dark:text-gray-300">Logs de acciones realizadas por los usuarios del sistema.</p>
    </div>
  );
};

export default Audit;
