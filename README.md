NOMOS INVENTORY SYSTEM FRONTEND

Este es el repositorio del frontend para el Sistema de Inventario Nomos, construido con React, TypeScript, Vite, y estilizado con Tailwind CSS. Utilizamos pnpm como gestor de paquetes.

INICIO RÁPIDO

Sigue estos pasos para configurar y ejecutar la aplicación de desarrollo en tu máquina local.

REQUISITOS PREVIOS
Asegúrate de tener instalado lo siguiente:

Node.js (versión recomendada: 18 o superior)

pnpm (el gestor de paquetes del proyecto)

Si no tienes pnpm, puedes instalarlo globalmente con npm:
npm install -g pnpm

INSTALACIÓN DE DEPENDENCIAS
Navega hasta el directorio raíz del proyecto e instala todas las dependencias:

Navega al directorio del proyecto (si aún no estás ahí)
cd nomos-inventory-system-frontend

Instala todas las dependencias usando pnpm
pnpm install

CONFIGURACIÓN DEL ENTORNO
La aplicación necesita una variable de entorno para saber dónde encontrar la API del backend.

Crea un archivo llamado .env.local en la raíz del proyecto.

Añade la variable que apunta a tu servidor de desarrollo local:

.env.local
VITE_API_URL=http://localhost:3000/api

Ajusta el valor de VITE_API_URL si tu backend usa un puerto diferente.

EJECUCIÓN DEL PROYECTO

INICIAR EL FRONTEND (DESARROLLO)
Ejecuta el servidor de desarrollo de Vite. Este comando inicia el entorno con Recarga Rápida de Módulos (HMR).

pnpm run dev

La aplicación estará disponible en tu navegador en: http://localhost:5173/ (o el puerto que muestre la consola).

INICIAR EL BACKEND (REQUISITO)
El frontend depende de que el servidor de la API esté activo.

Asegúrate de iniciar el repositorio del backend antes de correr el frontend.
(Consulta el README del repositorio del backend para las instrucciones de inicio).

SCRIPTS COMUNES

Estos son los comandos principales disponibles en el package.json para facilitar el trabajo:

| Comando | Descripción |
| pnpm run dev | Inicia el servidor de desarrollo. |
| pnpm run build | Compila la aplicación para producción (generando la carpeta dist). |
| pnpm run preview | Inicia un servidor local para previsualizar la build de producción. |
| pnpm run test | Ejecuta las pruebas unitarias y de integración con Vitest. |
| pnpm run lint | Analiza el código en busca de errores y problemas de estilo. |

NOTA IMPORTANTE SOBRE DATOS INICIALES

El mocking de datos de localStorage ha sido eliminado en los servicios de API.

Todas las llamadas a productos (listar, crear, actualizar, eliminar) ahora intentarán comunicarse directamente con la VITE_API_URL.

Si necesitas añadir datos iniciales para pruebas, debes hacerlo directamente a través del backend.
