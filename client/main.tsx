import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css'; // Asegúrate de importar tus estilos globales

// Aseguramos que el elemento 'root' existe antes de intentar montarlo
const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // Si este mensaje aparece, el index.html está mal
    console.error("Error: El elemento con id 'root' no se encontró en el DOM.");
}
