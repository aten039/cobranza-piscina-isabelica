import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiFileText, 
  FiUsers, 
  FiExternalLink,
  FiXCircle 
} from "react-icons/fi";
import type { PagoHistorial } from "@/pages/historialPagos/types";
import { getPagoById } from "@/pages/historialPagos/services/getPagosById";
import { anularPago } from "@/pages/historialPagos/services/anularPago";

// --- UTILIDADES DE FORMATO ---
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

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const safeDateString = dateString.includes(' ') ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return "Fecha Inválida";
    return date.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error formateando la fecha:", error.message);
    }
  }
};

const calcularEdad = (fechaNacimiento?: string) => {
  if (!fechaNacimiento) return null;
  const safeDateString = fechaNacimiento.includes(' ') ? fechaNacimiento.replace(' ', 'T') : fechaNacimiento;
  const nacimiento = new Date(safeDateString);
  const hoy = new Date();
  
  if (isNaN(nacimiento.getTime())) return null;

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

// --- VALIDACIÓN DE 15 DÍAS ---
const esMenorA15Dias = (fechaPago?: string) => {
  if (!fechaPago) return false;
  const safeDateString = fechaPago.includes(' ') ? fechaPago.replace(' ', 'T') : fechaPago;
  const fecha = new Date(safeDateString);
  const hoy = new Date();
  
  const diferenciaTiempo = hoy.getTime() - fecha.getTime();
  const diferenciaDias = diferenciaTiempo / (1000 * 3600 * 24);
  
  return diferenciaDias <= 15;
};

export default function PagoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pago, setPago] = useState<PagoHistorial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnulando, setIsAnulando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalles = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPagoById(id);
      setPago(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles]);

  // Manejador para anular el pago
  const handleAnular = async () => {
    if (!pago?.id) return;
    
    const confirmar = window.confirm("¿Estás seguro de que deseas anular este pago? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    setIsAnulando(true);
    try {
      await anularPago(pago.id);
      setPago(prev => prev ? { ...prev, is_null: true } : null);
      alert("Pago anulado exitosamente.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al anular el pago.");
    } finally {
      setIsAnulando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        <p>Cargando detalles del pago...</p>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-red-600 mb-4">{error || "No se encontró el pago."}</p>
        <button 
          onClick={() => navigate('/recordPagos')}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Volver al Historial
        </button>
      </div>
    );
  }

  const atleta = pago.expand?.matricula_id?.expand?.atleta_id;
  const clase = pago.expand?.matricula_id?.expand?.clase_id;
  const profesor = clase?.expand?.entrenador_id;
  const estaLiquidado = !!pago.liquidacion_id;

  const edadAtleta = calcularEdad(atleta?.fecha_nacimiento);
  const esMenor = edadAtleta !== null && edadAtleta < 18;
  const tieneRepresentante = !!atleta?.representante_nombre;

  // Condiciones para mostrar el botón de anular
  const fueAnulado = !!pago.is_null;
  const cumpleTiempo = esMenorA15Dias(pago.fecha_pago);
  const puedeAnular = !fueAnulado && !estaLiquidado && cumpleTiempo;

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      
      {/* Botón Volver y Cabecera */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
            title="Volver atrás"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">Detalles del Pago</h2>
              {/* Etiqueta visual si está anulado */}
              {fueAnulado && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <FiXCircle size={14} /> Anulado
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">ID del Registro: <span className="font-mono">{pago.id}</span></p>
          </div>
        </div>

        {/* Botón de anular (Solo se muestra si cumple condiciones) */}
        {puedeAnular && (
          <button
            onClick={handleAnular}
            disabled={isAnulando}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${isAnulando 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm active:scale-95'
              }`}
          >
            {isAnulando ? (
              <span className="animate-spin border-b-2 border-slate-400 h-4 w-4 rounded-full"></span>
            ) : (
              <FiXCircle size={16} />
            )}
            {isAnulando ? "Anulando..." : "Anular Pago"}
          </button>
        )}
      </div>

      {/* Si el pago está anulado, todo el contenido tiene un sutil efecto de opacidad 
        para indicar inactividad visual, pero REMOVIMOS el pointer-events-none 
        para que los enlaces sigan funcionando.
      */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start transition-all ${fueAnulado ? 'opacity-80 grayscale-[40%]' : ''}`}>
        
        {/* CUADRANTE 1: Información del Atleta */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUser className="text-blue-600" size={18} />
              <h3 className="font-semibold text-slate-800">Datos del Atleta</h3>
            </div>
            {edadAtleta !== null && (
              <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded-md">
                {edadAtleta} años
              </span>
            )}
          </div>
          
          <div className="p-5">
            <div 
              onClick={() => atleta?.id && navigate(`/atletas/perfil/${atleta.id}`)}
              className="group cursor-pointer rounded-lg p-3 -mx-3 -mt-3 mb-2 hover:bg-slate-50 transition-colors flex justify-between items-center"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre Completo</p>
                <p className="text-slate-900 font-medium text-lg group-hover:text-blue-600 transition-colors">
                  {atleta ? `${atleta.nombre} ${atleta.apellido}` : "Desconocido"}
                </p>
                {atleta?.cedula && <p className="text-sm text-slate-500 font-mono">C.I: {atleta.cedula}</p>}
              </div>
              <FiExternalLink className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>

            {esMenor && (
              <div className="pt-3 border-t border-slate-100 bg-blue-50/50 -mx-5 px-5 pb-3">
                <div className="flex items-center gap-2 mb-2 pt-2">
                  <FiUsers className="text-blue-500" size={14} />
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Representante Legal</p>
                </div>
                <p className="text-slate-800 font-medium">
                  {atleta?.representante_nombre || "No registrado"}
                </p>
                <div className="flex gap-4 mt-1">
                  {atleta?.representante_cedula && (
                    <p className="text-xs text-slate-500 font-mono">C.I: {atleta.representante_cedula}</p>
                  )}
                  {tieneRepresentante && atleta?.telefono && (
                    <p className="text-xs text-slate-500">Tel: {atleta.telefono}</p>
                  )}
                </div>
              </div>
            )}
            
            <div 
              onClick={() => clase?.id && navigate(`/entrenadores/clases/${clase.id}`)}
              className="pt-3 mt-3 border-t border-slate-100 group cursor-pointer rounded-lg p-3 -mx-3 -mb-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Clase y Entrenador</p>
                <p className="text-slate-900 font-medium mt-1 group-hover:text-blue-600 transition-colors">{clase ? clase.nombre : "N/A"}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Prof: {profesor ? `${profesor.nombre} ${profesor.apellido}` : "N/A"}
                </p>
              </div>
              <FiExternalLink className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>
          </div>
        </div>

        {/* CUADRANTE 2: Detalles Financieros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
            <FiDollarSign className="text-emerald-600" size={18} />
            <h3 className="font-semibold text-slate-800">Información de la Transacción</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monto Pagado</p>
                <p className={`text-2xl font-bold ${pago.type === 'USD' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {formatMoneda(pago.monto, pago.type)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fecha de Pago</p>
                <p className="text-slate-900 font-medium">{formatDate(pago.fecha_pago)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Método</p>
                <p className="text-slate-900 font-medium">{formatMetodo(pago.metodo)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Referencia</p>
                <p className="text-slate-700 font-mono text-sm">
                  {pago.referencia && pago.referencia.toUpperCase() !== 'EFECTIVO' ? pago.referencia : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CUADRANTE 3: Cobertura del Mes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
            <FiCalendar className="text-purple-600" size={18} />
            <h3 className="font-semibold text-slate-800">Periodo de Cobertura</h3>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Desde</p>
              <p className="text-slate-900 font-medium">{formatDate(pago.cobertura_desde)}</p>
            </div>
            <div className="h-px bg-slate-300 w-12 mx-4"></div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hasta</p>
              <p className="text-slate-900 font-medium">{formatDate(pago.cobertura_hasta)}</p>
            </div>
          </div>
        </div>

        {/* CUADRANTE 4: Estado de Liquidación */}
        <div 
          className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${estaLiquidado ? 'group cursor-pointer hover:border-emerald-300 transition-colors' : ''}`}
          onClick={() => estaLiquidado && pago.liquidacion_id && navigate(`/recordPagos/liq/details/${pago.liquidacion_id}`)}
        >
          <div className={`bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2 ${estaLiquidado ? 'group-hover:bg-emerald-50/50 transition-colors' : ''}`}>
            <FiFileText className="text-orange-500" size={18} />
            <h3 className="font-semibold text-slate-800">Estado de Liquidación</h3>
          </div>
          <div className={`p-5 flex items-center gap-4 ${estaLiquidado ? 'group-hover:bg-emerald-50/30 transition-colors' : ''}`}>
            {estaLiquidado ? (
              <>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full flex-shrink-0">
                  <FiCheckCircle size={24} />
                </div>
                <div>
                  <p className="text-emerald-700 font-semibold group-hover:text-emerald-800 transition-colors">Pago Liquidado (Comisión pagada)</p>
                  <p className="text-sm text-slate-500 font-mono mt-1">
                    ID Liq: {pago.liquidacion_id}
                  </p>
                </div>
                <FiExternalLink className="ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </>
            ) : (
              <>
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                  <FiClock size={24} />
                </div>
                <div>
                  <p className="text-amber-700 font-semibold">Pendiente por Liquidar</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Este pago aún no ha sido incluido en una liquidación para el profesor.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}