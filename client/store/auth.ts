import axios from "axios";
import { create } from "zustand";

// Define la interfaz de tu estado de autenticación
interface AuthState {
  token: string | null;
  user: any; // O el tipo de dato de tu usuario
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("nomos_token") || null,
  user: null,
  isAuthenticated: !!localStorage.getItem("nomos_token"),
  login: async (credentials) => {
    try {
      // Usamos la URL completa para asegurar que la petición se envíe al puerto y ruta correctos.
      const response = await axios.post("http://localhost:8080/api/auth/login", credentials);
      const token = response.data; // La respuesta es directamente el token, no un objeto con una propiedad 'token'

      // Agregamos un console.log para mostrar el usuario y el token
      console.log("Usuario autenticado:", credentials.username);
      console.log("Token JWT:", token);

      // Guarda el token en localStorage
      localStorage.setItem("nomos_token", token);

      // Actualiza el estado de la aplicación
      set({
        token,
        isAuthenticated: true,
      });

    } catch (error) {
      console.error("Error en el login:", error);
      // Re-lanza el error original para que el componente Login.tsx lo capture.
      // Esto nos dará un mensaje de error más específico en la consola.
      throw error;
    }
  },
  logout: () => {
    // Limpia el token al cerrar sesión
    localStorage.removeItem("nomos_token");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
