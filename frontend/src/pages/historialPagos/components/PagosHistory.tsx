import { getClasesOptions } from "@/pages/historialPagos/services/getClasesOption";
import { getHistorialPagos } from "@/pages/historialPagos/services/getHistorialPagos";
import { getProfesoresOptions } from "@/pages/historialPagos/services/getProfesoresOption";
import type { ClaseOpcion, FiltrosHistorial, PagoHistorial, ProfesorOpcion } from "@/pages/historialPagos/types";
import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiFilter, FiSearch, FiRefreshCcw, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const getTodayString = () => new Date().toISOString().split("T")[0];
const getLastMonthString = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split("T")[0];
};

const formatMoneda = (monto: number, moneda: 'USD' | 'BS') => {
  if (moneda === 'USD') {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(monto);
  } else {
    return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto) + " Bs";
  }
};

const formatMetodo = (metodo: string) => {
  if (!metodo) return "N/A";
  const map: Record<string, string> = {
    'pago_movil': 'Pago Móvil',
    'transferencia': 'Transferencia',
    'efectivo': 'Efectivo',
    'punto': 'Punto de Venta',
    'zelle': 'Zelle',
    'binance': 'Binance',
    'transferencia_int': 'Transferencia Intl.'
  };
  return map[metodo] || metodo.replace(/_/g, ' ').toUpperCase();
};

export default function PagosHistory() {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<PagoHistorial[]>([]);
  const [clasesOpciones, setClasesOpciones] = useState<ClaseOpcion[]>([]);
  const [profesoresOpciones, setProfesoresOpciones] = useState<ProfesorOpcion[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  // Estado inicial de los filtros para poder restaurarlo fácilmente
  const defaultFiltros: FiltrosHistorial = {
    fechaInicio: getLastMonthString(),
    fechaFin: getTodayString(),
    claseId: "",
    profesorId: "",
    searchTerm: "",
    page: 1,
    perPage: 15,
  };

  
  const [filtros, setFiltros] = useState<FiltrosHistorial>(defaultFiltros);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    getClasesOptions().then(setClasesOpciones);
    getProfesoresOptions().then(setProfesoresOpciones);
  }, []);

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getHistorialPagos(filtros);
      setPagos(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el historial.");
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

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

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setSearchInput("");
    setFiltros(defaultFiltros);
  };


  const handleVerDetalles = (id: string) => {
    navigate(`/recordPagos/details/${id}`);
  };

  return (
    // Se agregó mb-12 para dar bastante espacio en la parte inferior de la pantalla
    <div className="flex flex-col space-y-4 mb-12">
      
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
              placeholder="Buscar (nombre o cédula)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 w-full pl-10 pr-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaInicio" className="text-xs font-medium text-slate-500">Desde</label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFilterChange}
              className=" h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaFin" className="text-xs font-medium text-slate-500">Hasta</label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFilterChange}
              className="h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="claseId" className="text-xs font-medium text-slate-500">Clase</label>
            <select
              id="claseId"
              name="claseId"
              value={filtros.claseId}
              onChange={handleFilterChange}
              className="h-9 px-3 w-40 truncate border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">Todas</option>
              {clasesOpciones.map(clase => (
                <option key={clase.id} value={clase.id}>{clase.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="profesorId" className="text-xs font-medium text-slate-500">Profesor</label>
            <select
              id="profesorId"
              name="profesorId"
              value={filtros.profesorId}
              onChange={handleFilterChange}
              className="h-9 px-3 w-40 truncate border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="">Todos</option>
              {profesoresOpciones.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.nombre} {prof.apellido}</option>
              ))}
            </select>
          </div>
          
          {/* Botón de limpiar filtros */}
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
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Atleta</th>
                <th className="px-4 py-3 font-medium">Clase</th>
                <th className="px-4 py-3 font-medium">Profesor</th>
                <th className="px-4 py-3 font-medium">Método / Ref</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Cargando...
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FiFilter className="text-xl mb-1" />
                      <p>No se encontraron pagos con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => {
                  const atleta = pago.expand?.matricula_id?.expand?.atleta_id;
                  const clase = pago.expand?.matricula_id?.expand?.clase_id;
                  const profesor = clase?.expand?.entrenador_id;
                  
                  return (
                    <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(pago.fecha_pago).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {atleta ? `${atleta.nombre} ${atleta.apellido}` : "N/A"}
                        {/* Se eliminó el "V-" como solicitaste */}
                        {atleta?.cedula && <span className="block text-[11px] text-slate-400 font-normal">{atleta.cedula}</span>}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]">
                        {clase ? clase.nombre : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {profesor ? `${profesor.nombre} ${profesor.apellido}` : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 text-[13px]">
                            {formatMetodo(pago.metodo)}
                          </span>
                          {pago.referencia && pago.referencia.toUpperCase() !== 'EFECTIVO' && (
                            <span className="font-mono text-[11px] text-slate-500">Ref: {pago.referencia}</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-right ${pago.type === 'USD' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {formatMoneda(pago.monto, pago.type)}
                      </td>
                      {/* Nuevo botón de acciones dinámico */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleVerDetalles(pago.id)}
                            className="cursor-pointer group relative inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                            title="Ver detalles completos"
                          >
                            <FiEye size={18} className="transition-transform duration-300 group-hover:scale-110" />
                            
                            {/* Tooltip personalizado opcional (aparece en hover) */}
                            <span className=" absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Ver Detalles
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
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(filtros.page + 1)}
                disabled={filtros.page === totalPages}
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
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