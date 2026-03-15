// ARCHIVO: src/pages/historialPagos/PagosLiquidaciones.tsx

import { getClasesOptions } from "@/pages/historialPagos/services/getClasesOption";
import { getHistorialPagos } from "@/pages/historialPagos/services/getHistorialPagos";
import { getProfesoresOptions } from "@/pages/historialPagos/services/getProfesoresOption";
import { procesarLiquidacion } from "@/pages/historialPagos/services/procesarLiquidacion";
import { 
  PAYMENT_OPTIONS, // <-- Nueva importación de la estructura
  type ClaseOpcion, 
  type FiltrosHistorial, 
  type PagoHistorial, 
  type ProfesorOpcion 
} from "@/pages/historialPagos/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCcw, FiAlertCircle, FiDollarSign, FiX, FiCheckCircle } from "react-icons/fi";

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

// Actualizado para buscar en la nueva estructura anidada
const formatMetodo = (metodo: string) => {
  if (!metodo) return "N/A";
  const opBS = PAYMENT_OPTIONS.BS.find(m => m.value === metodo);
  if (opBS) return opBS.label;
  const opUSD = PAYMENT_OPTIONS.USD.find(m => m.value === metodo);
  if (opUSD) return opUSD.label;
  return metodo.replace(/_/g, ' ').toUpperCase();
};

export default function PagosLiquidaciones() {
  const [pagos, setPagos] = useState<PagoHistorial[]>([]);
  const [clasesOpciones, setClasesOpciones] = useState<ClaseOpcion[]>([]);
  const [profesoresOpciones, setProfesoresOpciones] = useState<ProfesorOpcion[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de Selección
  const [selectedPagos, setSelectedPagos] = useState<Set<string>>(new Set());
  const [selectedProfesorId, setSelectedProfesorId] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<string | null>(null);

  // Estados del Modal de Liquidación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  
  // Tipamos explícitamente el estado del formulario para que coincida con las llaves del objeto
  const [formLiq, setFormLiq] = useState<{
    monto: string;
    referencia: string;
    metodo: string;
    type: 'USD' | 'BS';
    fecha_pago: string;
  }>({ 
    monto: "", 
    referencia: "", 
    metodo: "", 
    type: "BS",
    fecha_pago: getTodayString() 
  });

  const defaultFiltros: FiltrosHistorial = {
    fechaInicio: getLastMonthString(),
    fechaFin: getTodayString(),
    claseId: "",
    profesorId: "",
    searchTerm: "",
    page: 1,
    perPage: 15,
    soloPendientes: true,
  };

  const [filtros, setFiltros] = useState<FiltrosHistorial>(defaultFiltros);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    getClasesOptions().then(setClasesOpciones).catch(() => {});
    getProfesoresOptions().then(setProfesoresOpciones).catch(() => {});
  }, []);

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getHistorialPagos(filtros);
      setPagos(response.items);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los pagos pendientes.");
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  useEffect(() => {
    if (exitoMsg) {
      const timer = setTimeout(() => setExitoMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [exitoMsg]);

  // --- CÁLCULOS DINÁMICOS CORREGIDOS ---
  const { totalUSD, totalBS } = useMemo(() => {
    let usd = 0;
    let bs = 0;
    pagos.forEach(pago => {
      if (selectedPagos.has(pago.id)) {
        const montoNumerico = Number(pago.monto) || 0; 
        const monedaSegura = pago.type?.toUpperCase(); 

        if (monedaSegura === 'USD') usd += montoNumerico;
        else if (monedaSegura === 'BS') bs += montoNumerico;
      }
    });
    return { totalUSD: usd, totalBS: bs };
  }, [pagos, selectedPagos]);

  // --- Handlers ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFiltros((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros(defaultFiltros);
    setSelectedPagos(new Set());
    setSelectedProfesorId(null);
  };

  const handleTogglePago = (pagoId: string, profesorId: string) => {
    const newSelection = new Set(selectedPagos);

    if (newSelection.has(pagoId)) {
      newSelection.delete(pagoId);
      setSelectedPagos(newSelection);
      if (newSelection.size === 0) setSelectedProfesorId(null);
    } else {
      if (selectedProfesorId !== null && selectedProfesorId !== profesorId) {
        setAlerta("Solo puedes seleccionar pagos de un mismo profesor.");
        return;
      }
      newSelection.add(pagoId);
      setSelectedPagos(newSelection);
      setSelectedProfesorId(profesorId);
      
      if (filtros.profesorId !== profesorId) {
        setFiltros(prev => ({ ...prev, profesorId, page: 1 }));
      }
    }
  };

  const handleSelectAll = () => {
    if (pagos.length === 0) return;
    const profesoresEnPantalla = new Set(
      pagos.map(p => p.expand?.matricula_id?.expand?.clase_id?.entrenador_id).filter(Boolean)
    );

    if (profesoresEnPantalla.size > 1) {
      setAlerta("Filtra por un profesor específico antes de seleccionar todos los registros.");
      return;
    }

    const profesorIdEnPantalla = Array.from(profesoresEnPantalla)[0] as string;

    if (selectedProfesorId && selectedProfesorId !== profesorIdEnPantalla) {
      setAlerta("Los pagos visibles no coinciden con el profesor que ya tienes seleccionado.");
      return;
    }

    const allVisibleSelected = pagos.every(p => selectedPagos.has(p.id));
    
    if (allVisibleSelected) {
      const newSelection = new Set(selectedPagos);
      pagos.forEach(p => newSelection.delete(p.id));
      setSelectedPagos(newSelection);
      if (newSelection.size === 0) setSelectedProfesorId(null);
    } else {
      const newSelection = new Set(selectedPagos);
      pagos.forEach(p => newSelection.add(p.id));
      setSelectedPagos(newSelection);
      setSelectedProfesorId(profesorIdEnPantalla);

      if (filtros.profesorId !== profesorIdEnPantalla) {
        setFiltros(prev => ({ ...prev, profesorId: profesorIdEnPantalla, page: 1 }));
      }
    }
  };

  const handleAbrirModal = () => {
    if (selectedProfesorId && selectedPagos.size > 0) {
      setFormLiq({ 
        monto: "", 
        referencia: "", 
        metodo: "pago_movil", 
        type: "BS",
        fecha_pago: getTodayString() 
      });
      setIsModalOpen(true);
    }
  };

  const handleSubmitLiquidacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfesorId || selectedPagos.size === 0) return;
    
    if (!formLiq.monto || !formLiq.metodo || !formLiq.fecha_pago) {
      setAlerta("Debe llenar todos los campos obligatorios, incluyendo la fecha.");
      return;
    }

    if (formLiq.metodo !== 'efectivo' && !formLiq.referencia) {
      setAlerta("La referencia es obligatoria para este método de pago.");
      return;
    }

    setIsSubmitting(true);
    try {
      await procesarLiquidacion(
        {
          entrenador_id: selectedProfesorId,
          monto: Number(formLiq.monto),
          referencia: formLiq.metodo === 'efectivo' ? 'EFECTIVO' : formLiq.referencia,
          type: formLiq.type,
          metodo: formLiq.metodo,
          fecha_pago: formLiq.fecha_pago
        },
        Array.from(selectedPagos)
      );
      
      setIsModalOpen(false);
      setExitoMsg(`Se liquidaron ${selectedPagos.size} pagos correctamente.`);
      setSelectedPagos(new Set());
      setSelectedProfesorId(null);
      fetchPagos(); 
    } catch (err) {
      setAlerta(err instanceof Error ? err.message : "Error al procesar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const profesorInfo = profesoresOpciones.find(p => p.id === selectedProfesorId);

  return (
    <div className="flex flex-col space-y-4 mb-12 relative">
      
      {/* Alertas */}
      {alerta && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg shadow-lg animate-in slide-in-from-top-4">
          <FiAlertCircle size={18} /> {alerta}
        </div>
      )}
      {exitoMsg && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-lg animate-in slide-in-from-top-4">
          <FiCheckCircle size={18} /> {exitoMsg}
        </div>
      )}

      {/* --- MODAL DE LIQUIDACIÓN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FiDollarSign className="text-emerald-600" />
                Procesar Liquidación
              </h3>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitLiquidacion} className="p-6 space-y-5">
              
              <div className="text-center mb-4">
                <p className="text-sm text-slate-500">Liquidación para:</p>
                <p className="font-bold text-xl text-slate-800">
                  {profesorInfo ? `${profesorInfo.nombre} ${profesorInfo.apellido}` : "Profesor"}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">{selectedPagos.size} pagos seleccionados</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen Recaudado</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Total en Dólares:</span>
                  <span className="font-semibold text-emerald-700">{formatMoneda(totalUSD, 'USD')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 font-medium">Total en Bolívares:</span>
                  <span className="font-semibold text-blue-700">{formatMoneda(totalBS, 'BS')}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                
                {/* Monto y Moneda */}
                <div className="flex gap-3">
                  <div className="space-y-1.5 flex-[2]">
                    <label className="text-sm font-medium text-slate-700">Monto Final a Liquidar</label>
                    <input
                      type="number" step="0.01" min="0" required disabled={isSubmitting}
                      value={formLiq.monto} onChange={(e) => setFormLiq({...formLiq, monto: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium disabled:bg-slate-50 disabled:cursor-not-allowed"
                      placeholder="Ej: 50.00"
                    />
                  </div>
                  <div className="space-y-1.5 flex-[1]">
                    <label className="text-sm font-medium text-slate-700">Moneda</label>
                    <select
                      value={formLiq.type} 
                      onChange={(e) => {
                        const nuevaMoneda = e.target.value as 'USD' | 'BS';
                        // Reseteo Inteligente: Borramos el método y la ref porque cambiaron las opciones disponibles
                        setFormLiq({
                          ...formLiq, 
                          type: nuevaMoneda,
                          metodo: "", 
                          referencia: "" 
                        });
                      }}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="BS">BS</option>
                    </select>
                  </div>
                </div>

                {/* Fecha y Método Dinámico */}
                <div className="flex gap-3">
                  <div className="space-y-1.5 flex-[1]">
                    <label className="text-sm font-medium text-slate-700">Fecha</label>
                    <input
                      type="date" required disabled={isSubmitting}
                      value={formLiq.fecha_pago} 
                      onChange={(e) => setFormLiq({...formLiq, fecha_pago: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="space-y-1.5 flex-[2]">
                    <label className="text-sm font-medium text-slate-700">Método de Pago</label>
                    <select
                      required disabled={isSubmitting}
                      value={formLiq.metodo} 
                      onChange={(e) => {
                        const isEfectivo = e.target.value === 'efectivo';
                        setFormLiq({...formLiq, metodo: e.target.value, referencia: isEfectivo ? '' : formLiq.referencia});
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <option value="" disabled>Seleccione método</option>
                      {/* Generación dinámica basada en la moneda seleccionada */}
                      {PAYMENT_OPTIONS[formLiq.type].map(opcion => (
                        <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Referencia */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Referencia de la Transferencia
                    {formLiq.metodo === 'efectivo' && <span className="text-slate-400 font-normal ml-2">(No requerida)</span>}
                  </label>
                  <input
                    type="text" 
                    required={formLiq.metodo !== 'efectivo'} 
                    disabled={isSubmitting || formLiq.metodo === 'efectivo'}
                    value={formLiq.referencia} 
                    onChange={(e) => setFormLiq({...formLiq, referencia: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm uppercase disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    placeholder={formLiq.metodo === 'efectivo' ? "N/A" : "Ej: ZELLE-12345"}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}
                  className="cursor-pointer flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  className="cursor-pointer flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Liquidar Ahora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BARRA DE FILTROS --- */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-end gap-4 w-full md:w-auto">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaInicio" className="text-xs font-medium text-slate-500">Desde</label>
            <input type="date" id="fechaInicio" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFilterChange} className="h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="fechaFin" className="text-xs font-medium text-slate-500">Hasta</label>
            <input type="date" id="fechaFin" name="fechaFin" value={filtros.fechaFin} onChange={handleFilterChange} className="h-9 px-3 w-36 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-400" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="claseId" className="text-xs font-medium text-slate-500">Clase</label>
            <select id="claseId" name="claseId" value={filtros.claseId} onChange={handleFilterChange} className="h-9 px-3 w-40 truncate border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
              <option value="">Todas</option>
              {clasesOpciones.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="profesorId" className="text-xs font-medium text-slate-500">Profesor</label>
            <select id="profesorId" name="profesorId" value={filtros.profesorId} onChange={handleFilterChange} className="h-9 px-3 w-40 truncate border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
              <option value="">Todos</option>
              {profesoresOpciones.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
            </select>
          </div>
          <button onClick={handleLimpiarFiltros} className="cursor-pointer h-9 px-3 flex items-center gap-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors">
            <FiRefreshCcw /> <span className="hidden xl:inline">Limpiar</span>
          </button>
        </div>

        {/* Botón Abrir Modal */}
        <button
          onClick={handleAbrirModal}
          disabled={selectedPagos.size === 0}
          className="cursor-pointer h-10 px-6 flex items-center gap-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
        >
          <FiDollarSign size={18} />
          Liquidar ({selectedPagos.size})
        </button>
      </div>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">{error}</div>}

      {/* --- TABLA --- */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={pagos.length > 0 && pagos.every(p => selectedPagos.has(p.id))} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer h-4 w-4" />
                </th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Profesor</th>
                <th className="px-4 py-3 font-medium">Clase</th>
                <th className="px-4 py-3 font-medium">Método / Ref</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Cargando pagos pendientes...</td></tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FiFilter className="text-xl mb-1" />
                      <p>No hay pagos pendientes por liquidar con estos filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => {
                  const clase = pago.expand?.matricula_id?.expand?.clase_id;
                  const profesor = clase?.expand?.entrenador_id;
                  const profesorId = profesor?.id || "";
                  const isSelected = selectedPagos.has(pago.id);
                  const isDisabled = selectedProfesorId !== null && selectedProfesorId !== profesorId;
                  
                  return (
                    <tr key={pago.id} className={`transition-colors ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'} ${isDisabled ? 'opacity-60 bg-slate-50' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => handleTogglePago(pago.id, profesorId)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer h-4 w-4 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(pago.fecha_pago).toLocaleDateString('es-VE')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {profesor ? `${profesor.nombre} ${profesor.apellido}` : "N/A"}
                      </td>
                      <td className="px-4 py-3 truncate max-w-[150px]">
                        {clase ? clase.nombre : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 text-[13px]">{formatMetodo(pago.metodo)}</span>
                          {pago.referencia && pago.referencia.toUpperCase() !== 'EFECTIVO' && (
                            <span className="font-mono text-[11px] text-slate-500">Ref: {pago.referencia}</span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold text-right ${pago.type === 'USD' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {formatMoneda(pago.monto, pago.type)}
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
            <span className="text-sm text-slate-500">Página {filtros.page} de {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => handlePageChange(filtros.page - 1)} disabled={filtros.page === 1} className="cursor-pointer p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronLeft size={16} /></button>
              <button onClick={() => handlePageChange(filtros.page + 1)} disabled={filtros.page === totalPages} className="cursor-pointer p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}