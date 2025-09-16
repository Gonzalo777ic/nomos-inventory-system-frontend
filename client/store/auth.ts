import { create } from "zustand";
import axios from "axios";

type User = { id: string; email: string };

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("nomos_token"),
  isAuthenticated: !!localStorage.getItem("nomos_token"),
  async login({ email, password }) {
    // Try hitting a ping endpoint just to exercise axios, ignore errors
    try {
      await axios.get("/api/ping");
    } catch {}
    // Mock success
    const token = "demo-token";
    localStorage.setItem("nomos_token", token);
    set({ user: { id: "u1", email }, token, isAuthenticated: true });
  },
  logout() {
    localStorage.removeItem("nomos_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
