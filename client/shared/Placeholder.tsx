import { Link } from "react-router-dom";

export default function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-6">
          <Link to="/app/dashboard" className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
