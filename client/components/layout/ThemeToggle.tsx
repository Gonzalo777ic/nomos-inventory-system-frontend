import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
      aria-label="Cambiar tema"
    >
      <span className="hidden sm:inline">{theme === "dark" ? "Modo oscuro" : "Modo claro"}</span>
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M21.64 13a9 9 0 11-10.63-10.6 7 7 0 1010.63 10.6z"/></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0 4a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zm0-20a1 1 0 00-1 1v1a1 1 0 102 0V2a1 1 0 00-1-1zM4.22 5.64a1 1 0 001.42 0l.7-.7a1 1 0 10-1.42-1.42l-.7.7a1 1 0 000 1.42zM17.66 19.08a1 1 0 001.42 0l.7-.7a1 1 0 00-1.42-1.42l-.7.7a1 1 0 000 1.42zM2 13a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zm20-2a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM4.22 18.36a1 1 0 000 1.42l.7.7a1 1 0 101.42-1.42l-.7-.7a1 1 0 00-1.42 0zM17.66 4.92a1 1 0 000-1.42l-.7-.7a1 1 0 10-1.42 1.42l.7.7a1 1 0 001.42 0z"/></svg>
      )}
    </button>
  );
}
