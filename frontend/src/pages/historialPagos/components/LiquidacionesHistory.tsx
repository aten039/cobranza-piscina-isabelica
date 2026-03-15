// ARCHIVO: src/pages/historialLiquidaciones/LiquidacionesHistory.tsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch, FiRefreshCcw, FiEye } from "react-icons/fi";

import { getProfesoresOptions } from "@/pages/historialPagos/services/getProfesoresOption"; // Reusado del módulo de pagos

import { PAYMENT_OPTIONS, type FiltrosLiquidacion, type LiquidacionHistorial, type ProfesorOpcion } from "@/pages/historialPagos/types"; // Usando tus constantes
import { getHistorialLiquidaciones } from "@/pages/historialPagos/services/getHistorialLiquidaciones";

// --- Helpers ---
const getTodayString = () => new Date().toISOString().split("T")[0];
const getLastMonthString = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split("T")[0];
};

const formatMoneda = (monto: number, moneda: 'USD' | 'BS') => {
  if (moneda === 'USD') return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monto);
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto) + " Bs";
};

const formatMetodo = (metodo: string) => {
  if (!metodo) return "N/A";
  const opBS = PAYMENT_OPTIONS.BS.find(m => m.value === metodo);
  if (opBS) return opBS.label;
  const opUSD = PAYMENT_OPTIONS.USD.find(m => m.value === metodo);
  if (opUSD) return opUSD.label;
  return metodo.replace(/_/g, ' ').toUpperCase();
};

export default function LiquidacionesHistory() {
  const navigate = useNavigate();
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionHistorial[]>([]);
  const [profesoresOpciones, setProfesoresOpciones] = useState<ProfesorOpcion[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const defaultFiltros: FiltrosLiquidacion = {
    fechaInicio: getLastMonthString(),
    fechaFin: getTodayString(),
    profesorId: "",
    searchTerm: "",
    page: 1,
    perPage: 15,
  };

  const [filtros, setFiltros] = useState<FiltrosLiquidacion>(defaultFiltros);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Carga inicial de profesores
  useEffect(() => {
    getProfesoresOptions().then(setProfesoresOpciones).catch(console.error);
  }, []);

  // Fetch centralizado
  const fetchLiquidaciones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getHistorialLiquidaciones(filtros);
      setLiquidaciones(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el historial de liquidaciones.");
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchLiquidaciones();
  }, [fetchLiquidaciones]);

  // Debounce para el buscador (evita saturar la base de datos en cada tecla)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, searchTerm: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFiltros((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimpiarFiltros = () => {
    setSearchInput("");
    setFiltros(defaultFiltros);
  };

 const handleVerDetalles = (id: string) => {
    navigate(`/recordPagos/liq/details/${id}`);
  };

  return (
    <div className="flex flex-col space-y-4 mb-12 relative">
      
      {/* Barra de Herramientas y Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        
        <div className="flex flex-wrap items-end gap-4 w-full">
          {/* Buscador general */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar (referencia o profesor)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-full pl-10 pr-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaInicio" className="text-xs font-medium text-slate-500">Desde</label>
            <input
              type="date" id="fechaInicio" name="fechaInicio"
              value={filtros.fechaInicio} onChange={handleFilterChange}
              className="h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaFin" className="text-xs font-medium text-slate-500">Hasta</label>
            <input
              type="date" id="fechaFin" name="fechaFin"
              value={filtros.fechaFin} onChange={handleFilterChange}
              className="h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="profesorId" className="text-xs font-medium text-slate-500">Profesor</label>
            <select
              id="profesorId" name="profesorId"
              value={filtros.profesorId} onChange={handleFilterChange}
              className="h-9 px-3 w-48 truncate border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">Todos</option>
              {profesoresOpciones.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.nombre} {prof.apellido}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleLimpiarFiltros}
            className="cursor-pointer h-9 px-3 flex items-center gap-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors"
            title="Limpiar filtros"
          >
            <FiRefreshCcw />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Tabla de Resultados */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha Liquidada</th>
                <th className="px-4 py-3 font-medium">Profesor</th>
                <th className="px-4 py-3 font-medium">Método / Ref</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Cargando liquidaciones...
                  </td>
                </tr>
              ) : liquidaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FiFilter className="text-xl mb-1" />
                      <p>No se encontraron liquidaciones con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                liquidaciones.map((liq) => {
                  const profesor = liq.expand?.entrenador_id;
                  
                  return (
                    <tr key={liq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(liq.fecha_pago).toLocaleDateString('es-VE')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {profesor ? `${profesor.nombre} ${profesor.apellido}` : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 text-[13px]">
                            {formatMetodo(liq.metodo)}
                          </span>
                          {liq.referencia && liq.referencia.toUpperCase() !== 'EFECTIVO' && (
                            <span className="font-mono text-[11px] text-slate-500">Ref: {liq.referencia}</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-right ${liq.type === 'USD' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {formatMoneda(liq.monto, liq.type)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleVerDetalles(liq.id)}
                          className="cursor-pointer group relative inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                          title="Ver detalle de pagos incluidos"
                        >
                          <FiEye size={18} className="transition-transform duration-300 group-hover:scale-110" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Ver Pagos
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-sm text-slate-500">
              Página {filtros.page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(filtros.page - 1)}
                disabled={filtros.page === 1}
                className="cursor-pointer p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(filtros.page + 1)}
                disabled={filtros.page === totalPages}
                className="cursor-pointer p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}