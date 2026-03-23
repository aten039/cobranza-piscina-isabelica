import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Agregamos FiEye a las importaciones
import { FiArrowLeft, FiUser, FiDollarSign, FiList, FiEye } from "react-icons/fi"; 
import { PAYMENT_OPTIONS, type LiquidacionConPagos } from "@/pages/historialPagos/types";
import { getLiquidacionById } from "@/pages/historialPagos/services/getLiquidacionById";

// Utilidades de formato
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

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const safeDateString = dateString.includes(' ') ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return "Fecha Inválida";
    return date.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return "N/A";
  }
};

export default function LiquidacionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [data, setData] = useState<LiquidacionConPagos | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalles = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLiquidacionById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        <p>Cargando detalles de liquidación...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-red-600 mb-4">{error || "No se encontró la liquidación."}</p>
        <button 
          onClick={() => navigate('/liquidaciones')}
          className="cursor-pointer px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Volver al Historial
        </button>
      </div>
    );
  }

  const { liquidacion, pagosAsociados } = data;
  const profesor = liquidacion.expand?.entrenador_id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      
      {/* Botón Volver y Cabecera */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
          title="Volver atrás"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detalles de la Liquidación</h2>
          <p className="text-sm text-slate-500">ID del Registro: <span className="font-mono">{liquidacion.id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta: Información del Profesor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUser className="text-blue-600" size={18} />
              <h3 className="font-semibold text-slate-800">Entrenador / Profesor</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre Completo</p>
            <p className="text-slate-900 font-medium text-xl mt-1">
              {profesor ? `${profesor.nombre} ${profesor.apellido}` : "Desconocido"}
            </p>
            <p className="text-sm text-slate-500 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">
              {pagosAsociados.length} pagos liquidados
            </p>
          </div>
        </div>

        {/* Tarjeta: Detalles Financieros de la Liquidación */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
            <FiDollarSign className="text-emerald-600" size={18} />
            <h3 className="font-semibold text-slate-800">Transferencia Realizada</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monto Liquidado</p>
                <p className={`text-2xl font-bold ${liquidacion.type === 'USD' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {formatMoneda(liquidacion.monto, liquidacion.type)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fecha Liquidación</p>
                <p className="text-slate-900 font-medium">{formatDate(liquidacion.fecha_pago)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Método</p>
                <p className="text-slate-900 font-medium">{formatMetodo(liquidacion.metodo)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Referencia</p>
                <p className="text-slate-700 font-mono text-sm">
                  {liquidacion.referencia && liquidacion.referencia.toUpperCase() !== 'EFECTIVO' ? liquidacion.referencia : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN INFERIOR: TABLA DE PAGOS INCLUIDOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
          <FiList className="text-slate-600" size={18} />
          <h3 className="font-semibold text-slate-800">Pagos incluidos en esta liquidación</h3>
        </div>
        
        {pagosAsociados.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No se encontraron pagos vinculados a esta liquidación.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Fecha de Cobro</th>
                  <th className="px-5 py-3 font-medium">Atleta</th>
                  <th className="px-5 py-3 font-medium">Clase</th>
                  <th className="px-5 py-3 font-medium text-right">Monto Pagado</th>
                  {/* Nueva Columna para Acciones */}
                  <th className="px-5 py-3 font-medium text-center w-16">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pagosAsociados.map(pago => {
                  const atleta = pago.expand?.matricula_id?.expand?.atleta_id;
                  const clase = pago.expand?.matricula_id?.expand?.clase_id;
                  
                  return (
                    <tr key={pago.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(pago.fecha_pago)}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {atleta ? `${atleta.nombre} ${atleta.apellido}` : "Desconocido"}
                      </td>
                      <td className="px-5 py-3 truncate max-w-[150px]">
                        {clase ? clase.nombre : "N/A"}
                      </td>
                      <td className={`px-5 py-3 font-semibold text-right ${pago.type === 'USD' ? 'text-emerald-700' : 'text-blue-700'}`}>
                        {formatMoneda(pago.monto, pago.type as 'USD' | 'BS')}
                      </td>
                      {/* Nuevo Botón del Ojito */}
                      <td className="px-5 py-3 text-center">
                        
                          
                        <button
                            onClick={() => navigate(`/recordPagos/details/${pago.id}`)}
                            className="cursor-pointer group relative inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                            title="Ver detalles completos"
                          >
                            <FiEye size={18} className="transition-transform duration-300 group-hover:scale-110" />
                            
                           
                          </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}