// src/pages/deuda/components/ListDeudas.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPhoneAlt, 
  FaUserCircle, 
  FaCalendarTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaMoneyCheckAlt,
  FaClock,
  FaUserTie,
} from "react-icons/fa";
import type { DeudaRecord, PaginatedResult } from "@/pages/deudas/types";
import { obtenerDeudasPaginadas } from "@/pages/deudas/services/obtenerDeudasPaginadas";
import { GetDeudasError } from "@/pages/deudas/types/errors";

export const ListDeudas: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResult<DeudaRecord> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDeudas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await obtenerDeudasPaginadas(currentPage, itemsPerPage);
        setData(response);
      } catch (err) {
        if (err instanceof GetDeudasError) {
          setError(err.message || "Ocurrió un error inesperado.");
        }else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeudas();
  }, [currentPage]);

  // --- NUEVA LÓGICA DE FECHAS ---
  const getEstadoCobertura = (fecha: string | null): 'VENCIDO' | 'POR_VENCER' | 'VIGENTE' => {
    if (!fecha) return 'VENCIDO';
    
    // Normalizamos las fechas eliminando las horas para una comparación exacta de días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cobertura = new Date(fecha.split(' ')[0] + "T00:00:00");
    
    // 1. Ya pasó la fecha
    if (cobertura < hoy) return 'VENCIDO';

    // 2. Calculamos la fecha límite de advertencia (Hoy + 5 días)
    const fechaAdvertencia = new Date(hoy);
    fechaAdvertencia.setDate(hoy.getDate() + 5);

    // Si la cobertura está entre hoy y los próximos 5 días
    if (cobertura <= fechaAdvertencia) return 'POR_VENCER';

    // 3. Todo está en orden
    return 'VIGENTE';
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin pagos";
    return new Date(fecha.split(' ')[0] + "T00:00:00").toLocaleDateString("es-VE");
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Próximos Cobros y Deudas</h2>
          <p className="text-sm text-slate-500">Gestión de mensualidades de atletas activos</p>
        </div>
      </div>

      {loading && <div className="p-8 text-center text-slate-500">Cargando deudas...</div>}
      {error && <div className="p-8 text-center text-red-500 font-medium">{error}</div>}

      {!loading && !error && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Atleta</th>
                  <th className="px-6 py-4 font-medium">Clase</th>
                  <th className="px-6 py-4 font-medium">Contacto</th>
                  <th className="px-6 py-4 font-medium text-right">Cobertura Hasta</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.items.map((deuda) => {
                  const estado = getEstadoCobertura(deuda.cobertura_hasta);

                  return (
                    <tr key={deuda.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FaUserCircle className="text-slate-400 text-xl" />
                          <div>
                            <p className="font-medium text-slate-800">
                              {deuda.atleta_nombre} {deuda.atleta_apellido}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{deuda.atleta_cedula}</p>
                          </div>
                        </div>
                      </td>
                      
                     {/* --- CELDA DE CLASE Y ENTRENADOR --- */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          {/* Tag de la Clase */}
                          <div 
                            className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100 px-2.5 py-1 rounded inline-block truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px]"
                            title={deuda.clase_nombre} 
                          >
                            {deuda.clase_nombre}
                          </div>
                          
                          {/* Subtítulo: Entrenador */}
                          <div 
                            className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium ml-1 truncate max-w-[140px]" 
                            title={`Entrenador: ${deuda.entrenador_nombre} ${deuda.entrenador_apellido}`}
                          >
                            <FaUserTie className="text-slate-300" />
                            <span className="truncate uppercase">
                              {deuda.entrenador_nombre} {deuda.entrenador_apellido}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <FaPhoneAlt className="text-slate-300" />
                          <span>{deuda.atleta_telefono || "N/A"}</span>
                        </div>
                      </td>

                      {/* --- CELDA DE FECHA MEJORADA --- */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {estado === 'VENCIDO' && <FaCalendarTimes className="text-red-500 text-sm" title="Mensualidad Vencida" />}
                          {estado === 'POR_VENCER' && <FaClock className="text-amber-500 text-sm animate-pulse" title="Vence en los próximos 5 días" />}
                          
                          <span className={`font-medium text-xs px-2 py-1 rounded-md border ${
                            estado === 'VENCIDO' ? "text-red-600 bg-red-50 border-red-100" : 
                            estado === 'POR_VENCER' ? "text-amber-700 bg-amber-50 border-amber-200" : 
                            "text-emerald-700 bg-emerald-50 border-emerald-100"
                          }`}>
                            {formatearFecha(deuda.cobertura_hasta)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/pagos/atleta/${deuda.atleta_id}`)}
                          className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-100 shadow-sm"
                          title={`Cobrar a ${deuda.atleta_nombre}`}
                        >
                          <FaMoneyCheckAlt />
                          Registrar Pago
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay deudas registradas para atletas activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>
              Mostrando página <span className="font-medium">{data.page}</span> de <span className="font-medium">{data.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={data.page === 1}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, data.totalPages))}
                disabled={data.page === data.totalPages}
                className="p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};