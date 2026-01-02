import { create } from "zustand";

type Auth0LogoutFunction = (options?: {
  logoutParams?: { returnTo?: string };
}) => void;

interface AuthState {
  token: string | null;

  user: any | null;
  supplierId: number | null;
  isAuthReady: boolean;

  isAuthenticated: boolean;

  auth0LogoutFn: Auth0LogoutFunction | null;

  syncAuth: (isAuthenticated: boolean, user: any | undefined) => void;

  setToken: (token: string) => void;

  setIsAuthReady: (isReady: boolean) => void;

  setUser: (user: any | null) => void;

  setLogoutFunction: (fn: Auth0LogoutFunction) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  supplierId: null,
  token: null,
  isAuthReady: false,
  auth0LogoutFn: null,

  syncAuth: (isAuthenticated, user) => {
    const supplierId = user?.["https://nomosstore.com/supplier_id"] || null;

    set({
      isAuthenticated,
      user: user || null,
      supplierId: supplierId ? Number(supplierId) : null,
      isAuthReady: true,
    });
  },

  setToken: (token) => {
    set({ token });
  },

  setIsAuthReady: (isReady) => {
    set({ isAuthReady: isReady });
  },

  setUser: (user) => {
    set({ user: user });
  },

  setLogoutFunction: (fn) => {
    set({ auth0LogoutFn: fn });
  },

  logout: () => {
    const auth0Logout = get().auth0LogoutFn;
    if (auth0Logout) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isAuthReady: true,
      });
    } else {
      console.error("Auth0 logout function not initialized in store.");
    }
  },
}));
