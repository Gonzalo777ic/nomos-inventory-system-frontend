// client/pages/Login.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Envía la credencial (ya sea username o email) y la contraseña al backend
      await login({ username: credential, password });
      navigate("/app", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:block bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white p-10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_0%_80%,rgba(255,255,255,0.04),transparent_40%)]" />
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l8 4-8 4-8-4 8-4Z" />
                <path d="M4 7v6l8 4 8-4V7" />
              </svg>
            </span>
            Nomos
          </div>
          <div className="mt-auto">
            <h1 className="text-4xl font-bold leading-tight">Sistema de gestión de inventario para librerías</h1>
            <p className="mt-4 text-white/80 max-w-md">Control de productos, ventas, proveedores y alertas de stock bajo. Interfaz moderna, rápida y segura.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <div className="md:hidden mx-auto mb-4 flex items-center justify-center gap-3 text-lg font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l8 4-8 4-8-4 8-4Z" />
                  <path d="M4 7v6l8 4 8-4V7" />
                </svg>
              </span>
              Nomos
            </div>
            <h2 className="text-2xl font-semibold">Bienvenido</h2>
            <p className="text-muted-foreground">Inicia sesión para acceder al panel</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Usuario o correo electrónico</label>
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 outline-none",
                  "focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600/60"
                )}
                placeholder="usuario@dominio.com o nombre_de_usuario"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 outline-none",
                  "focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600/60"
                )}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Accediendo..." : "Iniciar sesión"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground text-center">Demo: usa cualquier email y contraseña</p>
        </div>
      </div>
    </div>
  );
}
