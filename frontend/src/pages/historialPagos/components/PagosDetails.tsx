import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiCalendar, FiDollarSign, FiCheckCircle, FiClock, FiFileText, FiUsers } from "react-icons/fi";
import type { PagoHistorial } from "@/pages/historialPagos/types";
import { getPagoById } from "@/pages/historialPagos/services/getPagosById";

// Utilidades de formato
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

// --- CORRECCIÓN DE FECHAS ---
// PocketBase devuelve "2023-10-25 10:00:00.000Z". Lo limpiamos para evitar Invalid Date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    // Reemplaza el espacio por 'T' para asegurar el parseo correcto en todos los navegadores
    const safeDateString = dateString.includes(' ') ? dateString.replace(' ', 'T') : dateString;
    const date = new Date(safeDateString);
    
    // Si la fecha es inválida, evitamos que crashee
    if (isNaN(date.getTime())) return "Fecha Inválida";
    
    return date.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  } catch (error) {
    if ( error instanceof Error) {
      console.error("Error formateando la fecha:", error.message);
    }
  }
};

// --- CÁLCULO DE EDAD ---
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

export default function PagoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pago, setPago] = useState<PagoHistorial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // Calculamos la edad para determinar si es menor
  const edadAtleta = calcularEdad(atleta?.fecha_nacimiento);
  const esMenor = edadAtleta !== null && edadAtleta < 18;

  return (
    // Agregado mb-12 para dar respiro visual al final de la página
    <div className="max-w-4xl mx-auto space-y-6 mb-12">
      
      {/* Botón Volver y Cabecera */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
          title="Volver atrás"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detalles del Pago</h2>
          <p className="text-sm text-slate-500">ID del Registro: <span className="font-mono">{pago.id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta: Información del Atleta */}
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
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nombre Completo</p>
              <p className="text-slate-900 font-medium text-lg">
                {atleta ? `${atleta.nombre} ${atleta.apellido}` : "Desconocido"}
              </p>
              {atleta?.cedula && <p className="text-sm text-slate-500 font-mono">C.I: {atleta.cedula}</p>}
            </div>

            {/* Condicional: Si es menor de edad, mostrar representante */}
            {esMenor && (
              <div className="pt-3 border-t border-slate-100 bg-blue-50/50 -mx-5 px-5 pb-3">
                <div className="flex items-center gap-2 mb-2 pt-2">
                  <FiUsers className="text-blue-500" size={14} />
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Representante Legal</p>
                </div>
                <p className="text-slate-800 font-medium">
                  {atleta?.nombre_representante || "No registrado"}
                </p>
                <div className="flex gap-4 mt-1">
                  {atleta?.cedula_representante && (
                    <p className="text-xs text-slate-500 font-mono">C.I: {atleta.cedula_representante}</p>
                  )}
                  {atleta?.telefono_representante && (
                    <p className="text-xs text-slate-500">Tel: {atleta.telefono_representante}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Clase y Entrenador</p>
              <p className="text-slate-900 font-medium mt-1">{clase ? clase.nombre : "N/A"}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Prof: {profesor ? `${profesor.nombre} ${profesor.apellido}` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta: Detalles Financieros */}
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

        {/* Tarjeta: Cobertura del Mes */}
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

        {/* Tarjeta: Estado de Liquidación */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-2">
            <FiFileText className="text-orange-500" size={18} />
            <h3 className="font-semibold text-slate-800">Estado de Liquidación</h3>
          </div>
          <div className="p-5 flex items-center gap-4">
            {estaLiquidado ? (
              <>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full flex-shrink-0">
                  <FiCheckCircle size={24} />
                </div>
                <div>
                  <p className="text-emerald-700 font-semibold">Pago Liquidado (Comisión pagada)</p>
                  <p className="text-sm text-slate-500 font-mono mt-1">
                    ID Liq: {pago.liquidacion_id}
                  </p>
                </div>
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