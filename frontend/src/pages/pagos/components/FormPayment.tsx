import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Iconos
import { 
  FaArrowLeft, FaSpinner, FaSave, FaCheckCircle, 
  FaSwimmer, FaIdCard, FaBirthdayCake, FaChalkboardTeacher, FaCalendarCheck
} from 'react-icons/fa';

// Servicios y Tipos
import { PaymentForm, type IPaymentData } from './PaymentForm';
import { getAtletaParaPago } from '../services/getAtletaParaPago';
import { getMatriculasActivas } from '../services/getMatriculasActivas';
import { getUltimaCobertura } from '../services/getUltimaCobertura';
import { createPagoMensualidad } from '../services/createPagoMensualidad';
import type { AtletaPago, MatriculaActiva } from '../types';

const getLocalDateString = (dateObj = new Date()) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Utilidad para sumar 1 mes manteniendo el mismo día
const addOneMonth = (dateString: string) => {
  if (!dateString) return '';
  const [yyyy, mm, dd] = dateString.split('-').map(Number);
  
  let nextMonth = mm + 1;
  let nextYear = yyyy;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = yyyy + 1;
  }

  const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate();
  const finalDay = Math.min(dd, daysInNextMonth);

  const nextMm = String(nextMonth).padStart(2, '0');
  const nextDd = String(finalDay).padStart(2, '0');
  return `${nextYear}-${nextMm}-${nextDd}`;
};

const FormPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [atleta, setAtleta] = useState<AtletaPago | null>(null);
  const [matriculas, setMatriculas] = useState<MatriculaActiva[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedMatriculaId, setSelectedMatriculaId] = useState<string>('');
  
  const hoyStr = getLocalDateString();
  const [paymentData, setPaymentData] = useState<IPaymentData>({
    currency: 'BS',
    paymentMethod: 'pago_movil',
    paymentAmount: '',
    paymentRef: '',
    paymentDate: hoyStr,
    coverageDate: addOneMonth(hoyStr), 
  });

  const edadAtleta = useMemo(() => {
    if (!atleta?.fecha_nacimiento) return 0;
    const birthDate = new Date(atleta.fecha_nacimiento);
    let age = new Date().getFullYear() - birthDate.getFullYear();
    if (new Date().getMonth() < birthDate.getMonth() || (new Date().getMonth() === birthDate.getMonth() && new Date().getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [atleta?.fecha_nacimiento]);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [atletaData, matriculasData] = await Promise.all([
          getAtletaParaPago(id),
          getMatriculasActivas(id)
        ]);
        setAtleta(atletaData);
        setMatriculas(matriculasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Efecto: Busca la última fecha y asigna el monto si es USD
  useEffect(() => {
    if (!selectedMatriculaId) return;

    const fetchFechas = async () => {
      setLoadingDates(true);
      try {
        const matriculaSelec = matriculas.find(m => m.id === selectedMatriculaId);
        const costoClase = matriculaSelec?.expand?.clase_id?.costo || '';
        
        const ultimaCobertura = await getUltimaCobertura(selectedMatriculaId);
        
        let fechaInicioBase = hoyStr;
        if (ultimaCobertura) {
            // PocketBase usa "YYYY-MM-DD HH:mm:ss", extraemos solo los 10 primeros caracteres
            fechaInicioBase = ultimaCobertura.substring(0, 10);
        } 

        const proximaCobertura = addOneMonth(fechaInicioBase);

        setPaymentData(prev => ({
            ...prev,
            paymentAmount: prev.currency === 'USD' ? costoClase : prev.paymentAmount,
            coverageDate: proximaCobertura // AHORA SÍ SE CARGARÁ AUTOMÁTICAMENTE
        }));

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchFechas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatriculaId]); 


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMatriculaId) {
        setError("Debe seleccionar una clase para procesar el pago."); return;
    }
    if (!paymentData.paymentAmount || Number(paymentData.paymentAmount) <= 0) {
        setError("El monto del pago debe ser mayor a 0."); return;
    }
    if (!paymentData.paymentMethod.includes('efectivo') && !paymentData.paymentRef.trim()) {
        setError("El número de referencia es obligatorio."); return;
    }

    try {
      setSaving(true);
      
      await createPagoMensualidad({
          matricula_id: selectedMatriculaId,
          monto: Number(paymentData.paymentAmount),
          referencia: paymentData.paymentRef.trim() || 'EFECTIVO',
          
          // FECHAS
          fecha_pago: paymentData.paymentDate + ' 12:00:00.000Z', 
          cobertura_desde: paymentData.paymentDate + ' 12:00:00.000Z', // <-- AÑADIDO (Toma el día del pago)
          cobertura_hasta: paymentData.coverageDate + ' 12:00:00.000Z',
          
          // METODOS Y MONEDA
          type: paymentData.currency,
          metodo: paymentData.paymentMethod, 
      });
      
      setSuccess(true);
      setTimeout(() => navigate(`/atletas/perfil/${id}`), 2500);

    } catch (err) {
        // Aprovechamos para imprimir el error exacto en consola si sigue fallando
        console.error("Fallo al guardar:", err);
        setError(err instanceof Error ? err.message : "Error desconocido al registrar el pago.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-5xl text-blue-600"/></div>;
  if (!atleta) return <div className="p-10 text-center text-slate-500">Atleta no encontrado.</div>;

  const matriculaSeleccionada = matriculas.find(m => m.id === selectedMatriculaId);
  const claseSelec = matriculaSeleccionada?.expand?.clase_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      
      <button onClick={() => navigate(-1)} className="cursor-pointer mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">
        <FaArrowLeft className="mr-2" /> Volver al Perfil
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-5">
         <div className="bg-green-50 text-green-600 p-4 rounded-xl"><FaCalendarCheck className="text-3xl" /></div>
         <div>
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Registro de Mensualidad</h1>
             <p className="text-slate-500 text-sm font-medium">Asienta el pago de una clase en la que el atleta ya está matriculado.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex justify-center items-center shadow-sm text-blue-600 border border-slate-200">
                    <FaSwimmer className="text-xl"/>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 uppercase">{atleta.nombre} {atleta.apellido}</h3>
                    <div className="flex gap-3 text-xs font-bold text-slate-500 mt-1">
                        <span><FaIdCard className="inline"/> {atleta.cedula}</span>
                        <span><FaBirthdayCake className="inline"/> {edadAtleta} AÑOS</span>
                    </div>
                </div>
            </div>

            <form id="paymentForm" onSubmit={handleSave} className="p-6 md:p-8">
                
                {error && <div className="p-4 mb-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                
                {success ? (
                    <div className="py-10 text-center text-green-600 bg-green-50 rounded-2xl border border-green-100 animate-fade-in-up">
                        <FaCheckCircle className="text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-black">¡Pago Registrado Exitosamente!</h2>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Clase a Pagar *</label>
                            {matriculas.length === 0 ? (
                                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold">El atleta no está matriculado en ninguna clase activa.</div>
                            ) : (
                                <select 
                                    value={selectedMatriculaId}
                                    onChange={(e) => setSelectedMatriculaId(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer"
                                >
                                    <option value="" disabled className='text-sm'>-- SELECCIONE CLASE INSCRITA --</option>
                                    {matriculas.map(mat => {
                                        const c = mat.expand?.clase_id;
                                        if(!c) return null;
                                        
                                        const profNombre = c.expand?.entrenador_id?.nombre || '';
                                        const profApellido = c.expand?.entrenador_id?.apellido || '';
                                        const profTexto = profNombre ? `Prof. ${profNombre} ${profApellido}` : 'Sin Prof.';

                                        return (
                                           <option key={mat.id} value={mat.id}>
                                              {c.nombre} | {profTexto} | {c.costo}$
                                           </option>
                                        )
                                    })}
                                </select>
                            )}
                        </div>

                        {claseSelec && (
                            <div className="mt-6 bg-blue-50/50 p-5 rounded-xl border border-blue-100 animate-fade-in">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Resumen de Clase</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 uppercase flex items-center gap-1">
                                        <FaChalkboardTeacher className="text-blue-400"/> 
                                        Prof. {claseSelec.expand?.entrenador_id?.nombre}
                                    </span>
                                    <span className="text-xl font-black text-green-600">${claseSelec.costo} <span className="text-xs font-bold text-green-600/60">/ MES</span></span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>

        <div className="lg:col-span-3">
            {!success && (
                <>
                    {loadingDates && selectedMatriculaId ? (
                         <div className="mt-6 p-10 text-center text-blue-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                             <FaSpinner className="animate-spin text-3xl mb-2"/>
                             <p className="font-bold text-sm">Calculando fechas de cobertura...</p>
                         </div>
                    ) : (
                         <PaymentForm paymentData={paymentData} setPaymentData={setPaymentData} />
                    )}
                    
                    <button 
                        form="paymentForm"
                        type="submit" 
                        disabled={saving || loadingDates || !selectedMatriculaId || matriculas.length === 0} 
                        className=" cursor-pointer w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <FaSpinner className="animate-spin text-xl" /> : <FaSave className="text-xl" />} 
                        {saving ? 'PROCESANDO PAGO...' : 'REGISTRAR PAGO MENSUAL'}
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default FormPayment;