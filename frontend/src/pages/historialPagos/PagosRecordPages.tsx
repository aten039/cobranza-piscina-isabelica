import { Outlet, NavLink } from "react-router-dom";
import { FiClock, FiDollarSign } from "react-icons/fi"; // Íconos para las pestañas

export default function PagosRecordPages() {
  return (
    <div className="flex flex-col w-full h-full min-h-screen p-6 bg-slate-50 pb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Administración de Pagos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Módulo central para la gestión financiera del Complejo de Piscinas.
        </p>
      </header>

      {/* Navegación tipo Tabs Coloridas */}
      <nav className="flex gap-3 mb-6 border-b border-slate-200 pb-px">
        <NavLink
          to="/recordPagos"
          end // 'end' asegura que solo se marque activa si la ruta es exactamente /recordPagos
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-md border-b-4 border-blue-800 translate-y-px"
                : "bg-white text-slate-500 border border-slate-200 border-b-0 hover:bg-slate-100 hover:text-slate-700"
            }`
          }
        >
          <FiClock size={16} />
          Histórico de Pagos
        </NavLink>
        <NavLink
          to="/recordPagos/liquidaciones"
          className={({ isActive }) =>
            `flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              isActive
                ? "bg-emerald-600 text-white shadow-md border-b-4 border-emerald-800 translate-y-px"
                : "bg-white text-slate-500 border border-slate-200 border-b-0 hover:bg-slate-100 hover:text-slate-700"
            }`
          }
        >
          <FiDollarSign size={16} />
          Pendientes por Liquidar
        </NavLink>
      </nav>

      {/* Contenedor principal donde se inyectan los componentes hijos */}
      <main className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet /> 
      </main>
    </div>
  );
}