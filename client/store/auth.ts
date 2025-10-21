import { create } from 'zustand';

// Definición del tipo de la función de logout real (de Auth0)
type Auth0LogoutFunction = (options?: { logoutParams?: { returnTo?: string } }) => void;

interface AuthState {
  // El token de acceso
  token: string | null; 
  // El objeto user de Auth0
  user: any | null; 
  // Indica si el estado de autenticación (isAuthenticated) fue determinado
  isAuthReady: boolean; 
  // Sincronizado con useAuth0
  isAuthenticated: boolean; 
  
  // 🛑 NUEVO: Almacena la función de logout de Auth0 inyectada desde useAuth.tsx
  auth0LogoutFn: Auth0LogoutFunction | null;

  // Funciones (Acciones)
  
  // 🛑 EXISTENTE: Función para sincronizar con los resultados básicos de useAuth0
  syncAuth: (isAuthenticated: boolean, user: any | undefined) => void; 
  // 🛑 EXISTENTE: Función para guardar el token
  setToken: (token: string) => void;
  
  // 🛑 NUEVO: Función para establecer el estado de listo (usado en useAuth)
  setIsAuthReady: (isReady: boolean) => void;
  // 🛑 NUEVO: Función para establecer el objeto user (usado en useAuth.tsx para limpiar o sincronizar)
  setUser: (user: any | null) => void;
  // 🛑 NUEVO: Función para inyectar el logout de Auth0
  setLogoutFunction: (fn: Auth0LogoutFunction) => void;

  // 🛑 IMPLEMENTADO: Función wrapper de logout, usada por componentes (e.g., Layout.tsx)
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isAuthReady: false,
  auth0LogoutFn: null, // Inicialmente nulo

  // Sincroniza el estado de Auth0 con Zustand
  syncAuth: (isAuthenticated, user) => {
    set({ 
      isAuthenticated, 
      user: user || null, 
      isAuthReady: true 
    });
  },

  setToken: (token) => {
    set({ token });
  },

  // 🛑 NUEVO: Implementación de setIsAuthReady
  setIsAuthReady: (isReady) => {
    set({ isAuthReady: isReady });
  },

  // 🛑 NUEVO: Implementación de setUser
  setUser: (user) => {
    set({ user: user });
  },
  
  // 🛑 NUEVO: Implementación de setLogoutFunction
  setLogoutFunction: (fn) => {
    set({ auth0LogoutFn: fn });
  },

  // 🛑 NUEVO: Implementación de logout (llama a la función inyectada)
  logout: () => {
    // Llama a la función de Auth0 que fue inyectada
    const auth0Logout = get().auth0LogoutFn;
    if (auth0Logout) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
      // Limpia el estado localmente
      set({ 
        isAuthenticated: false, 
        user: null, 
        token: null,
        isAuthReady: true // Mantiene el ready state para evitar saltos
      });
    } else {
      console.error("Auth0 logout function not initialized in store.");
    }
  },

}));
