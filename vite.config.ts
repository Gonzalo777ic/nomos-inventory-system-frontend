import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // Configuración del proxy para redirigir las llamadas a la API
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: { // <-- AÑADE ESTE BLOQUE DE CONFIGURACIÓN
    globals: true,
    environment: 'jsdom', // <-- ESTO ES LO CRUCIAL
    setupFiles: './setupTests.ts', // Opcional, si quieres configurar @testing-library/jest-dom
    css: false, // Ignorar CSS para pruebas más rápidas
  }


}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
