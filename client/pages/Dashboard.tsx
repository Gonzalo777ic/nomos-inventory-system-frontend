import { useEffect, useMemo, useState } from "react";
import { getDashboardData, getLowStockProducts } from "../api/services/metrics";
import { formatCurrency } from "../utils/format";
import { Product } from "../types";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [kpis, setKpis] = useState({ products: 0, salesToday: 0, revenueToday: 0 });
  const [trend, setTrend] = useState<{ date: string; value: number }[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    getDashboardData().then((d) => {
      setKpis({ products: d.products, salesToday: d.salesToday, revenueToday: d.revenueToday });
      setTrend(d.salesTrend);
    });
    getLowStockProducts().then(setLowStock);
  }, []);

  const chartData = useMemo(() => trend, [trend]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Panel general</h1>
        <p className="text-sm text-muted-foreground">Resumen de inventario y ventas de hoy</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard title="Productos" value={kpis.products.toString()} subtitle="Totales en catálogo" />
        <KpiCard title="Ventas (hoy)" value={kpis.salesToday.toString()} subtitle="Transacciones registradas" />
        <KpiCard title="Ingresos (hoy)" value={formatCurrency(kpis.revenueToday)} subtitle="Monto total" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tendencia de ventas (últimos 14 días)</h3>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 24, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#059669" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Alertas de stock bajo</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 && <li className="text-sm text-muted-foreground">Sin alertas por ahora</li>}
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{p.title}</span>
                <span className="inline-flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">{p.stock} uds</span>
                  <span className="text-muted-foreground">{formatCurrency(p.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
