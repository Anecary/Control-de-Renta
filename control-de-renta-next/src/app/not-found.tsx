import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800">404 - Página no encontrada</h2>
      <p className="text-slate-500 text-sm mt-2">La página que buscas no existe.</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}
