import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Iconos
import { 
  FaArrowLeft, FaSpinner, FaSave, FaCheckCircle, 
  FaSwimmer, FaIdCard, FaBirthdayCake, FaChalkboardTeacher
} from 'react-icons/fa';
import { MdPool } from "react-icons/md";

// Componente de Pago Autónomo
import { PaymentForm, type IPaymentData } from './PaymentForm';

// Servicios y Tipos
import { getAtletaById } from '@/pages/atletas/services/getAtletaById';
import { getClasesDisponibles } from '@/pages/atletas/services/getClasesDisponibles';
import { getMatriculasByAtleta } from '@/pages/atletas/services/getMatriculasByAtletas';
import { createMatricula, type CreateMatriculaConPagoDTO } from '@/pages/atletas/services/createMatricula';
import type { Atleta, Clase } from '@/pages/atletas/types';

// Obtener fecha local (YYYY-MM-DD)
const getLocalDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const AtletaMatricular: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [clasesFiltradas, setClasesFiltradas] = useState<Clase[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedClaseId, setSelectedClaseId] = useState<string>('');
  
  const hoyStr = getLocalDateString();
  const [paymentData, setPaymentData] = useState<IPaymentData>({
    currency: 'BS',
    paymentMethod: 'pago_movil',
    paymentAmount: '',
    paymentRef: '',
    paymentDate: hoyStr,
    coverageDate: hoyStr, 
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
        const [atletaData, clasesData, matriculasData] = await Promise.all([
          getAtletaById(id),
          getClasesDisponibles(),
          getMatriculasByAtleta(id)
        ]);

        setAtleta(atletaData);

        const birthDate = new Date(atletaData.fecha_nacimiento);
        let age = new Date().getFullYear() - birthDate.getFullYear();
        if (new Date().getMonth() < birthDate.getMonth() || (new Date().getMonth() === birthDate.getMonth() && new Date().getDate() < birthDate.getDate())) {
            age--;
        }

        const clasesInscritasIds = matriculasData.map(m => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mat = m as any; 
            return mat.clase_id || mat.clase || mat.expand?.clase_id?.id || "";
        });

        const clasesValidas = clasesData.filter(clase => {
            const edadMin = Number(clase.edadMin) || 0;
            return edadMin <= age && !clasesInscritasIds.includes(clase.id);
        });

        setClasesFiltradas(clasesValidas);

      } catch (err) {
        console.error("Error al cargar datos para matricular:", err);
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id || !selectedClaseId) {
        setError("Debe seleccionar una clase."); return;
    }
    if (!paymentData.paymentAmount || Number(paymentData.paymentAmount) <= 0) {
        setError("El monto del pago debe ser mayor a 0."); return;
    }
    if (!paymentData.paymentMethod.includes('efectivo') && !paymentData.paymentRef.trim()) {
        setError("El número de referencia es obligatorio."); return;
    }

    try {
      setSaving(true);
      
      const payload: CreateMatriculaConPagoDTO = {
          matricula: {
              atleta_id: id,
              clase_id: selectedClaseId,
              fecha_inscripcion: paymentData.paymentDate,
              activo: true
          },
          pago: {
              monto: Number(paymentData.paymentAmount),
              referencia: paymentData.paymentRef.trim() || 'EFECTIVO',
              fecha_pago: paymentData.paymentDate + ' 12:00:00.000Z', 
              cobertura_desde: paymentData.paymentDate,
              cobertura_hasta: paymentData.coverageDate,
          }
      };

      await createMatricula(payload);
      
      setSuccess(true);
      setTimeout(() => navigate(`/atletas/perfil/${id}`), 2000);

    } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido al guardar.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><FaSpinner className="animate-spin text-5xl text-blue-600"/></div>;
  if (!atleta) return <div className="p-10 text-center text-slate-500">Atleta no encontrado.</div>;

  const claseSeleccionada = clasesFiltradas.find(c => c.id === selectedClaseId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">
        <FaArrowLeft className="mr-2" /> Volver al Perfil
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-5">
         <div className="bg-blue-50 text-blue-600 p-4 rounded-xl"><MdPool className="text-3xl" /></div>
         <div>
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nueva Inscripción y Pago</h1>
             <p className="text-slate-500 text-sm font-medium">Asigna la clase y registra la primera mensualidad de inmediato.</p>
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

            <form id="enrollForm" onSubmit={handleSave} className="p-6 md:p-8">
                
                {error && <div className="p-4 mb-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
                
                {success ? (
                    <div className="py-10 text-center text-green-600 bg-green-50 rounded-2xl border border-green-100 animate-fade-in-up">
                        <FaCheckCircle className="text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-black">¡Transacción Exitosa!</h2>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Seleccione la Clase *</label>
                            {clasesFiltradas.length === 0 ? (
                                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold">No hay clases disponibles (Edad o ya inscrito).</div>
                            ) : (
                                <select 
                                    value={selectedClaseId}
                                    onChange={(e) => {
                                        setSelectedClaseId(e.target.value);
                                        const c = clasesFiltradas.find(cl => cl.id === e.target.value);
                                        if (c && paymentData.currency === 'USD') {
                                            setPaymentData(prev => ({ ...prev, paymentAmount: c.costo }));
                                        }
                                    }}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                                >
                                    <option value="" disabled className=' text-sm text-wrap'>-- SELECCIONE UNA CLASE --</option>
                                    {clasesFiltradas.map(clase => (
                                        <option key={clase.id} value={clase.id}>{clase.nombre} | {clase.expand?.entrenador_id?.nombre} | {clase.costo}$ (MIN: {clase.edadMin} salkfsakdksadkhaskjdhashdAÑOS)</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {claseSeleccionada && (
                            <div className="mt-6 bg-blue-50/50 p-5 rounded-xl border border-blue-100 animate-fade-in">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Resumen de Clase</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 uppercase">
                                        <FaChalkboardTeacher className="inline text-blue-400 mr-1"/> 
                                        {claseSeleccionada.expand?.entrenador_id?.nombre} {claseSeleccionada.expand?.entrenador_id?.apellido}
                                    </span>
                                    <span className="text-xl font-black text-green-600">${claseSeleccionada.costo} <span className="text-xs font-bold text-green-600/60">/ MES</span></span>
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
                    <PaymentForm paymentData={paymentData} setPaymentData={setPaymentData} />
                    
                    <button 
                        form="enrollForm"
                        type="submit" 
                        disabled={saving || !selectedClaseId || clasesFiltradas.length === 0} 
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <FaSpinner className="animate-spin text-xl" /> : <FaSave className="text-xl" />} 
                        {saving ? 'PROCESANDO...' : 'CONFIRMAR Y PAGAR'}
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default AtletaMatricular;