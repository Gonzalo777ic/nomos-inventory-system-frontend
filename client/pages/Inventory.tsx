import { useEffect, useState } from "react";
import { listProducts } from "../api/services/products";
import { Product } from "../types";

export default function Inventory() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    listProducts().then(setProducts);
  }, []);

  const filtered = products.filter((p) =>
    [p.title, p.author, p.isbn].some((f) => f?.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-sm text-muted-foreground">Listado de productos con filtros</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor o ISBN"
            className="w-64 rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/40"
          />
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Agregar producto</button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Autor</th>
              <th className="p-3 font-medium">ISBN</th>
              <th className="p-3 font-medium">Precio</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.author}</td>
                <td className="p-3">{p.isbn}</td>
                <td className="p-3">${p.price.toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="rounded-md border px-3 py-1 text-xs">Editar</button>
                    <button className="rounded-md border px-3 py-1 text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
