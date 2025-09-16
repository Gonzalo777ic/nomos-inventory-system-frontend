import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { ThemeToggle } from "./ThemeToggle";

export default function Layout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block border-r bg-sidebar p-4">
        <Brand />
        <nav className="mt-6 space-y-1 text-sm">
          <NavItem to="/app/dashboard" label="Dashboard" />
          <NavItem to="/app/inventory" label="Inventario" />
          <NavItem to="/app/sales" label="Ventas" />
          <NavItem to="/app/reports" label="Reportes" />
          <NavItem to="/app/alerts" label="Alertas" />
          <NavItem to="/app/suppliers" label="Proveedores" />
        </nav>
      </aside>
      <div className="flex flex-col">
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 text-lg font-semibold">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
        N
      </span>
      Nomos
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent ${isActive ? "bg-accent text-accent-foreground" : "text-foreground/90"}`
      }
      end
    >
      <span>{label}</span>
    </NavLink>
  );
}

function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user?.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-md border px-3 py-1"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
