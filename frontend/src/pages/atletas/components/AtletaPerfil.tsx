import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Iconos
import { 
  FaSave, FaPen, FaArrowLeft, 
  FaIdCard, FaMapMarkerAlt, FaCheckCircle, 
  FaSpinner, FaUndo, FaBirthdayCake, FaBriefcaseMedical, FaUserFriends, FaPlusCircle,
  FaSwimmer, FaPowerOff, FaToggleOn, FaToggleOff, FaTrash, FaPlay, FaPause, FaMoneyBillWave, FaCalendarAlt
} from 'react-icons/fa';
import { MdPool } from "react-icons/md";

// Servicios y Tipos
import { getAtletaById } from '@/pages/atletas/services/getAtletaById';
import { updateAtleta } from '@/pages/atletas/services/updateAtleta';
import { getMatriculasByAtleta } from '@/pages/atletas/services/getMatriculasByAtletas';
import { toggleAtletaStatus } from '@/pages/atletas/services/toggleAtletaStatus';
import { toggleMatriculaStatus } from '@/pages/atletas/services/toggleMatriculaStatus';
import { deleteMatricula } from '@/pages/atletas/services/deleteMatricula';
import type { Atleta, Matricula } from '@/pages/atletas/types';

interface AtletaFormData extends Partial<Atleta> {
  phoneCode?: string;
  simplePhone?: string;
  cedulaType?: string;
  cedulaNum?: string;
  repCedulaType?: string;
  repCedulaNum?: string;
}
// Función para invertir la fecha a DD/MM/AAAA
const formatToDDMMYYYY = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const [yyyy, mm, dd] = dateString.substring(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
};
// Extendemos el tipo localmente por si TypeScript no detecta el cambio global aún
type MatriculaUI = Matricula & { ultima_cobertura?: string | null };

const AtletaPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [matriculas, setMatriculas] = useState<MatriculaUI[]>([]);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMatriculas, setLoadingMatriculas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const [processingMatriculaId, setProcessingMatriculaId] = useState<string | null>(null);
  const [tabMatriculasActivas, setTabMatriculasActivas] = useState<boolean>(true);
  const [formData, setFormData] = useState<AtletaFormData>({});
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isMinor = useMemo(() => {
    if (!formData.fecha_nacimiento) return false;
    const today = new Date();
    const birthDate = new Date(formData.fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  }, [formData.fecha_nacimiento]);

  useEffect(() => {
    if (!id) return;
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const atletaData = await getAtletaById(id);
        setAtleta(atletaData);

        let phCode = "0412"; let phNum = "";
        if (atletaData.telefono && atletaData.telefono.length > 4) {
             if(atletaData.telefono.includes('-')){
                 const parts = atletaData.telefono.split('-');
                 phCode = parts[0]; phNum = parts[1];
             } else {
                 phCode = atletaData.telefono.substring(0, 4); phNum = atletaData.telefono.substring(4);
             }
        }

        let cedType = "V"; let cedNum = "";
        if (atletaData.cedula) {
             const clean = atletaData.cedula.toUpperCase();
             if(clean.includes('-')){
                 const parts = clean.split('-');
                 cedType = parts[0]; cedNum = parts[1];
             } else {
                 cedType = clean.charAt(0); cedNum = clean.substring(1);
             }
        }

        let repType = "V"; let repNum = "";
        if (atletaData.representante_cedula) {
            const cleanRep = atletaData.representante_cedula.toUpperCase();
            if(cleanRep.includes('-')){
                const parts = cleanRep.split('-');
                repType = parts[0]; repNum = parts[1];
            } else {
                repType = cleanRep.charAt(0); repNum = cleanRep.substring(1);
            }
        }

        let formattedDate = "";
        if (atletaData.fecha_nacimiento) {
            formattedDate = new Date(atletaData.fecha_nacimiento).toISOString().split('T')[0];
        }

        setFormData({
            ...atletaData, phoneCode: phCode, simplePhone: phNum, cedulaType: cedType, cedulaNum: cedNum,
            repCedulaType: repType, repCedulaNum: repNum, fecha_nacimiento: formattedDate
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido al cargar el perfil");
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const loadMatriculas = async () => {
      try {
        setLoadingMatriculas(true);
        // El servicio ya hace el Promise.all internamente y devuelve las matrículas con su fecha
        const data = await getMatriculasByAtleta(id, tabMatriculasActivas);
        setMatriculas(data);
      } catch (err) {
        console.error("Error cargando matrículas:", err);
      } finally {
        setLoadingMatriculas(false);
      }
    };
    loadMatriculas();
  }, [id, tabMatriculasActivas]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = (type === 'text' || type === 'textarea') ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
  };

  const handleToggleStatus = async () => {
    if (!atleta || !id) return;
    
    if (atleta.activo) {
      if (!window.confirm('¿Seguro que deseas DESACTIVAR a este atleta? Todas sus matrículas actuales se darán de baja y pasarán al histórico.')) return;
      setIsToggling(true);
      setError(null);
      try {
        const updated = await toggleAtletaStatus(atleta);
        setAtleta(updated);
        setTabMatriculasActivas(false);
        setSuccessMsg("Atleta desactivado correctamente.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de conexión al desactivar.");
      } finally {
        setIsToggling(false);
      }
    } else {
      if (!window.confirm('Para reactivar a un atleta es obligatorio inscribirlo en una clase. Serás redirigido a la pantalla de matriculación.')) return;
      navigate(`/atletas/matricular/${id}`);
    }
  };

  const handleToggleMatricula = async (e: React.MouseEvent, mat: MatriculaUI) => {
    e.stopPropagation();
    if (!window.confirm(`¿Deseas ${mat.activo ? 'pausar' : 'reactivar'} esta matrícula?`)) return;

    setProcessingMatriculaId(mat.id);
    try {
        await toggleMatriculaStatus(mat.id, mat.activo);
        setMatriculas(prev => prev.filter(m => m.id !== mat.id));
        setSuccessMsg(`Matrícula ${mat.activo ? 'pausada' : 'reactivada'} con éxito.`);
        setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al procesar la solicitud";
        alert(errorMsg);
        if (errorMsg.includes("descartada del historial")) {
            setMatriculas(prev => prev.filter(m => m.id !== mat.id));
        }
    } finally {
        setProcessingMatriculaId(null);
    }
  };

  // --- MODIFICADO: Actualiza el estado del atleta si este fue desactivado por el servicio ---
  const handleDeleteMatricula = async (e: React.MouseEvent, matId: string) => {
    e.stopPropagation(); 
    if (!window.confirm("¿ADVERTENCIA: Estás seguro de eliminar permanentemente esta matrícula del historial? Esta acción no se puede deshacer.")) return;

    setProcessingMatriculaId(matId);
    try {
        await deleteMatricula(matId);
        
        // 1. Removemos la matrícula de la UI actual
        setMatriculas(prev => prev.filter(m => m.id !== matId));
        
        // 2. Verificamos silenciosamente si el atleta fue desactivado en backend
        if (id) {
            const atletaActualizado = await getAtletaById(id);
            setAtleta(atletaActualizado);
            
            // Si el atleta pasó a inactivo, opcionalmente movemos la vista a "inactivas"
            if (!atletaActualizado.activo && atleta?.activo) {
                setTabMatriculasActivas(false);
            }
        }

        setSuccessMsg("Matrícula eliminada correctamente.");
        setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
        alert(err instanceof Error ? err.message : "Error al procesar la solicitud");
    } finally {
        setProcessingMatriculaId(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.nombre?.trim()) errors.push("- El NOMBRE es obligatorio.");
    if (!formData.apellido?.trim()) errors.push("- El APELLIDO es obligatorio.");
    if(!isMinor && !formData.cedulaNum?.trim()) errors.push("- La CÉDULA es obligatoria.");
    if (!formData.fecha_nacimiento) errors.push("- La FECHA DE NACIMIENTO es obligatoria.");
    if (!formData.simplePhone?.trim()) errors.push("- El TELÉFONO es obligatorio.");
    else if (formData.simplePhone.length !== 7) errors.push("- El TELÉFONO debe tener 7 dígitos.");
    if (!formData.direccion?.trim()) errors.push("- La DIRECCIÓN es obligatoria.");
    if (isMinor) {
        if (!formData.representante_nombre?.trim()) errors.push("- Nombre del REPRESENTANTE es obligatorio (es menor de edad).");
        if (!formData.repCedulaNum?.trim()) errors.push("- Cédula del REPRESENTANTE es obligatoria (es menor de edad).");
        else if (formData.repCedulaNum.length < 5) errors.push("- La CÉDULA del representante es muy corta.");
    }
    if (errors.length > 0) {
        alert("POR FAVOR CORRIJA LOS SIGUIENTES ERRORES:\n\n" + errors.join("\n"));
        return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!validateForm()) return;

    try {
      setSaving(true); setError(null);
      const finalPhone = `${formData.phoneCode}-${formData.simplePhone}`;
      const finalCedula = `${formData.cedulaType}-${formData.cedulaNum}`;
      const finalRepCedula = isMinor ? `${formData.repCedulaType}-${formData.repCedulaNum}` : '';

      const payload: Partial<Atleta> = {
        nombre: formData.nombre, apellido: formData.apellido, cedula: finalCedula,
        telefono: finalPhone, fecha_nacimiento: new Date(formData.fecha_nacimiento!).toISOString(),
        direccion: formData.direccion, condicion_medica: formData.condicion_medica,
        representante_nombre: isMinor ? formData.representante_nombre : '', representante_cedula: finalRepCedula,
      };

      const updated = await updateAtleta(id, payload);
      setAtleta(updated); setSuccessMsg("Perfil actualizado correctamente"); setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError("No se pudieron guardar los cambios.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false); setFormData(prev => ({ ...prev })); window.location.reload(); 
  };

  if (loadingProfile) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-blue-600"/></div>;
  if (!atleta) return <div className="p-10 text-center">Atleta no encontrado</div>;

  const inputClass = `w-full p-2.5 rounded-lg border transition-all outline-none text-sm uppercase ${
    isEditing ? 'border-blue-300 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800' : 'border-transparent bg-slate-100 text-slate-600 font-medium cursor-not-allowed'
  }`;
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";
  const prefixSelectClass = `rounded-l-lg border-r-0 text-center font-bold text-slate-700 cursor-pointer text-sm outline-none ${
    isEditing ? 'bg-slate-50 border border-blue-300 focus:ring-2 focus:ring-blue-500/20' : 'bg-slate-200 border-transparent cursor-not-allowed'
  }`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in pb-20">
      
      <button onClick={() => navigate(-1)} className="mb-6 cursor-pointer flex items-center text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">
        <FaArrowLeft className="mr-2" /> Volver 
      </button>

      {/* --- HEADER --- */}
      <div className={`rounded-t-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-6 transition-colors ${!atleta.activo ? 'bg-gradient-to-r from-slate-600 to-slate-500 grayscale-[0.5]' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}>
        <div className="flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border-2 border-white/30 shadow-inner">
             <FaSwimmer className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">{atleta.nombre} {atleta.apellido}</h1>
            <div className="flex gap-3 mt-2 flex-wrap">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1"><FaIdCard/> {atleta.cedula}</span>
                {!atleta.activo && <span className="bg-slate-800/80 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><FaPowerOff/> INACTIVO</span>}
                {atleta.condicion_medica && <span className="bg-red-500/80 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 animate-pulse"><FaBriefcaseMedical/> CONDICIÓN MÉDICA</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isEditing && (
              <button onClick={handleToggleStatus} disabled={isToggling}
                  className={`cursor-pointer px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md text-sm ${atleta.activo ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' : 'bg-green-500 hover:bg-green-600 text-white border-green-600'}`}>
                  {isToggling ? <FaSpinner className="animate-spin" /> : <FaPowerOff />} {atleta.activo ? 'Desactivar' : 'Activar'}
              </button>
          )}

          {isEditing ? (
             <button onClick={handleCancel} className=" cursor-pointer px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"><FaUndo /> Cancelar</button>
          ) : (
            <button onClick={() => setIsEditing(true)} className=" cursor-pointer px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all text-sm"><FaPen /> Editar Datos</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- FORMULARIO DATOS (IZQUIERDA) --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded flex items-center gap-2"><FaCheckCircle/> {successMsg}</div>}

            <form onSubmit={handleSave} className="space-y-5 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Nombre <span className="text-red-400">*</span></label>
                        <input max={50} type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Apellido <span className="text-red-400">*</span></label>
                        <input max={50} type="text" name="apellido" value={formData.apellido || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Cédula <span className="text-red-400">*</span></label>
                        <div className="flex w-full">
                            <select name="cedulaType" value={formData.cedulaType} onChange={handleInputChange} disabled={!isEditing} className={`w-16 ${prefixSelectClass}`}>
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="P">P</option>
                            </select>
                            <input type="text" name="cedulaNum" maxLength={10} value={formData.cedulaNum || ''} onChange={handleNumberChange} disabled={!isEditing} className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Teléfono <span className="text-red-400">*</span></label>
                        <div className="flex w-full shadow-sm rounded-lg">
                    {/* Input: Código de área */}
                    <input 
                        type="tel" 
                        name="phoneCode" 
                        value={formData.phoneCode || ''} 
                        onChange={handleNumberChange} // <--- Pasamos a usar el filtro de números aquí también
                        disabled={!isEditing} 
                        maxLength={4} 
                        minLength={4} 
                        required
                        placeholder="0414" 
                        className={`w-24 text-center font-mono focus:z-10 cursor-text ${prefixSelectClass}`} 
                    />
                    
                    {/* Input: Número restante */}
                    <input 
                        type="tel" 
                        name="simplePhone" 
                        maxLength={7} 
                        value={formData.simplePhone || ''} 
                        onChange={handleNumberChange} 
                        disabled={!isEditing} 
                        placeholder="1234567" 
                        className={`flex-1 rounded-l-none rounded-r-lg font-mono focus:z-10 ${inputClass}`} 
                    />
                </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Fecha de Nacimiento <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <FaBirthdayCake className="absolute top-3 left-3 text-slate-400 z-10"/>
                            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange} disabled={!isEditing} className={`${inputClass} pl-10 uppercase`} />
                        </div>
                        <p className="text-[10px] mt-1 text-slate-400 text-right">{isMinor ? <span className="text-orange-500 font-bold">ES MENOR DE EDAD</span> : <span className="text-green-600 font-bold">ES MAYOR DE EDAD</span>}</p>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Dirección <span className="text-red-400">*</span></label>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute top-3 left-3 text-slate-400 z-10"/>
                        <textarea maxLength={100} rows={2} name="direccion" value={formData.direccion || ''} onChange={handleInputChange} disabled={!isEditing} className={`${inputClass} pl-10 resize-none`} />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className={`${labelClass} text-red-400`}>Condición Médica</label>
                    <textarea  maxLength={100} rows={2} name="condicion_medica" value={formData.condicion_medica || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="NINGUNA"
                        className={`${inputClass} ${formData.condicion_medica ? 'bg-red-50 text-red-700 border-red-100' : ''}`} />
                </div>

                {isMinor && (
                    <div className="pt-4 border-t border-slate-100 bg-orange-50/30 p-4 rounded-xl border border-orange-100 animate-fade-in">
                        <h4 className="text-xs font-bold text-orange-500 uppercase mb-3 flex items-center gap-2"><FaUserFriends className="text-lg"/> Datos del Representante (Obligatorio)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nombre y Apellido Rep.</label>
                                <input max={50} type="text" name="representante_nombre" value={formData.representante_nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Cédula Rep.</label>
                                <div className="flex w-full">
                                    <select name="repCedulaType" value={formData.repCedulaType || 'V'} onChange={handleInputChange} disabled={!isEditing} className={`w-16 ${prefixSelectClass}`}>
                                        <option value="V">V</option><option value="E">E</option>
                                    </select>
                                    <input type="text" name="repCedulaNum" maxLength={10} value={formData.repCedulaNum || ''} onChange={handleNumberChange} disabled={!isEditing} className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <button type="submit" disabled={saving} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 mt-4">
                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Guardar Cambios
                    </button>
                )}
            </form>
        </div>

        {/* --- LISTA DE MATRÍCULAS (DERECHA) --- */}
        <div className="lg:col-span-1 h-full max-h-[750px] flex flex-col">
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full relative ${!atleta.activo ? 'opacity-80' : ''}`}>
                
                {/* Título Superior */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center relative z-20">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><MdPool className="text-blue-500 text-xl"/> Matrículas</h2>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{matriculas.length}</span>
                </div>

                {/* Acciones Rápidas y Pestañas */}
                <div className="p-4 border-b border-slate-100 bg-white relative z-20 space-y-4">
                    
                    {/* Botones Grid 2 Columnas (Armonioso) */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => navigate(`/atletas/matricular/${id}`)}
                            disabled={!atleta.activo}
                            className="cursor-pointer py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPlusCircle className="text-lg mb-0.5" />
                            <span>Inscribir</span>
                        </button>

                        <button 
                            onClick={() => navigate(`/pagos/atleta/${id}`)}
                            disabled={!atleta.activo}
                            className="cursor-pointer py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 font-bold text-xs hover:bg-green-100 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaMoneyBillWave className="text-lg mb-0.5" />
                            <span>Pagar Mes</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setTabMatriculasActivas(true)} className={`flex-1 text-xs py-1.5 rounded font-bold transition-all flex justify-center items-center gap-1 cursor-pointer ${tabMatriculasActivas ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FaToggleOn className="text-sm" /> Activas
                        </button>
                        <button onClick={() => setTabMatriculasActivas(false)} className={`flex-1 text-xs py-1.5 rounded font-bold transition-all flex justify-center items-center gap-1 cursor-pointer ${!tabMatriculasActivas ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FaToggleOff className="text-sm" /> Inactivas
                        </button>
                    </div>
                </div>

                {!atleta.activo && (
                    <div className="absolute inset-0 bg-slate-50/30 z-10 flex items-center justify-center pointer-events-none"></div>
                )}

                {/* Lista Scrollable */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {loadingMatriculas ? (
                        <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-2xl text-slate-400"/></div>
                    ) : matriculas.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 relative z-20">
                            <MdPool className="mx-auto text-4xl opacity-20 mb-2"/>
                            <p className="text-sm">Sin inscripciones {tabMatriculasActivas ? 'activas' : 'inactivas'}.</p>
                        </div>
                    ) : (
                        matriculas.map((mat) => {
                            const clase = mat.expand?.clase_id;
                            const profe = clase?.expand?.entrenador_id;
                            const isProcessingThis = processingMatriculaId === mat.id;

                            return (
                                <div key={mat.id}
                                onClick={() => clase?.id && navigate(`/entrenadores/clases/${clase.id}`)}
                                className={`border cursor-pointer rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-all relative z-20 group ${tabMatriculasActivas ? 'border-blue-100' : 'border-slate-200 bg-slate-50 opacity-80'} ${isProcessingThis ? 'opacity-50 pointer-events-none' : ''}`}>
                                    
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase">{clase?.nombre || 'Clase Desconocida'}</h4>
                                    <p className="text-xs text-slate-500 uppercase">Prof. {profe ? `${profe.nombre} ${profe.apellido}` : 'Sin asignar'}</p>
                                    
                                    {/* SECCIÓN INFERIOR DE LA MATRÍCULA (Costo, Estados, Vencimiento y Acciones) */}
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                        
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-mono font-bold text-slate-600">${clase?.costo}</span>
                                            
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${tabMatriculasActivas ? 'bg-green-50 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                                {tabMatriculasActivas ? 'Activa' : 'Inactiva'}
                                            </span>

                                            {/* --- FECHA DE COBERTURA (VENCIMIENTO) --- */}
                                            <div className="flex items-center gap-1 text-[10px] font-bold ml-1 border-l border-slate-200 pl-2">
                                                <FaCalendarAlt className={mat.ultima_cobertura ? "text-blue-400" : "text-slate-300"}/>
                                                {mat.ultima_cobertura ? (
                                                    <span className="text-slate-500">
                                                        VENCE: <span className="text-blue-600">{formatToDDMMYYYY(mat.ultima_cobertura)}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-orange-500">SIN PAGOS</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                title={mat.activo ? 'Pausar matrícula' : 'Reactivar matrícula'}
                                                onClick={(e) => handleToggleMatricula(e, mat)}
                                                className={`p-1.5 rounded bg-slate-100 text-slate-600 hover:text-white transition-colors cursor-pointer ${mat.activo ? 'hover:bg-orange-500' : 'hover:bg-green-500'}`}
                                            >
                                                {isProcessingThis ? <FaSpinner className="animate-spin text-xs" /> : mat.activo ? <FaPause className="text-xs"/> : <FaPlay className="text-xs"/>}
                                            </button>
                                            
                                            <button 
                                                title="Eliminar matrícula permanentemente"
                                                onClick={(e) => handleDeleteMatricula(e, mat.id)}
                                                className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                            >
                                                {isProcessingThis ? <FaSpinner className="animate-spin text-xs" /> : <FaTrash className="text-xs"/>}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AtletaPerfil;