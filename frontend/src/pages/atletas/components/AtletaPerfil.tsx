import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Iconos (Se agregaron FaTrash, FaPlay, FaPause)
import { 
  FaSave, FaPen, FaArrowLeft, 
  FaIdCard, FaMapMarkerAlt, FaCheckCircle, 
  FaSpinner, FaUndo, FaBirthdayCake, FaBriefcaseMedical, FaUserFriends, FaPlusCircle,
  FaSwimmer, FaPowerOff, FaToggleOn, FaToggleOff, FaTrash, FaPlay, FaPause
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

const AtletaPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMatriculas, setLoadingMatriculas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // NUEVO: Estado para saber qué matrícula específica se está procesando
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
      // --- ESTÁ ACTIVO -> VAMOS A DESACTIVAR ---
      if (!window.confirm('¿Seguro que deseas DESACTIVAR a este atleta? Todas sus matrículas actuales se darán de baja y pasarán al histórico.')) return;

      setIsToggling(true);
      setError(null);
      try {
        // Este servicio ahora solo desactiva y limpia matrículas de forma segura
        const updated = await toggleAtletaStatus(atleta);
        setAtleta(updated);
        
        // Lo pasamos a la pestaña de inactivas visualmente
        setTabMatriculasActivas(false);
        setSuccessMsg("Atleta desactivado correctamente.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de conexión al desactivar.");
      } finally {
        setIsToggling(false);
      }
      
    } else {
      // --- ESTÁ INACTIVO -> VAMOS A ACTIVAR ---
      // NO tocamos la base de datos. Solo avisamos y redirigimos.
      if (!window.confirm('Para reactivar a un atleta es obligatorio inscribirlo en una clase. Serás redirigido a la pantalla de matriculación.')) return;
      
      navigate(`/atletas/matricular/${id}`);
    }
  };
  // --- NUEVOS MANEJADORES DE MATRÍCULA ---
  const handleToggleMatricula = async (e: React.MouseEvent, mat: Matricula) => {
    e.stopPropagation(); // Evita navegar a la clase
    if (!window.confirm(`¿Deseas ${mat.activo ? 'pausar' : 'reactivar'} esta matrícula?`)) return;

    setProcessingMatriculaId(mat.id);
    try {
        await toggleMatriculaStatus(mat.id, mat.activo);
        
        // Operación exitosa: la sacamos de esta pestaña para que el usuario la vea en la otra
        setMatriculas(prev => prev.filter(m => m.id !== mat.id));
        setSuccessMsg(`Matrícula ${mat.activo ? 'pausada' : 'reactivada'} con éxito.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al procesar la solicitud";
        alert(errorMsg);
        
        // NUEVO: Si la matrícula era huérfana y el servicio la marcó como eliminada,
        // la sacamos inmediatamente de la vista para limpiar la interfaz.
        if (errorMsg.includes("descartada del historial")) {
            setMatriculas(prev => prev.filter(m => m.id !== mat.id));
        }
    } finally {
        setProcessingMatriculaId(null);
    }
  };

  const handleDeleteMatricula = async (e: React.MouseEvent, matId: string) => {
    e.stopPropagation(); // Evita navegar a la clase
    if (!window.confirm("¿ADVERTENCIA: Estás seguro de eliminar permanentemente esta matrícula del historial? Esta acción no se puede deshacer.")) return;

    setProcessingMatriculaId(matId);
    try {
        await deleteMatricula(matId);
        // La sacamos de la vista inmediatamente
        setMatriculas(prev => prev.filter(m => m.id !== matId));
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
      setError("No se pudieron guardar los cambios. Verifique su conexión.");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative">
            {!atleta.activo && !isEditing && (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-grayscale-[0.5] z-10 rounded-2xl flex items-center justify-center pointer-events-none">
                    <p className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-slate-500 border border-slate-200">Atleta Inactivo. Reactívelo para realizar modificaciones.</p>
                </div>
            )}

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded flex items-center gap-2"><FaCheckCircle/> {successMsg}</div>}

            <form onSubmit={handleSave} className="space-y-5 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Nombre <span className="text-red-400">*</span></label>
                        <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Apellido <span className="text-red-400">*</span></label>
                        <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Cédula <span className="text-red-400">*</span></label>
                        <div className="flex w-full">
                            <select name="cedulaType" value={formData.cedulaType} onChange={handleInputChange} disabled={!isEditing} className={`w-16 ${prefixSelectClass}`}>
                                <option value="V">V</option><option value="E">E</option>
                            </select>
                            <input type="text" name="cedulaNum" maxLength={10} value={formData.cedulaNum || ''} onChange={handleNumberChange} disabled={!isEditing} className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Teléfono <span className="text-red-400">*</span></label>
                        <div className="flex w-full">
                            <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} disabled={!isEditing} className={`w-24 ${prefixSelectClass}`}>
                                <option value="0422">0422</option>
                                <option value="0412">0412</option>
                                <option value="0414">0414</option>
                                <option value="0424">0424</option>
                                <option value="0416">0416</option>
                                <option value="0426">0426</option>  
                            </select>
                            <input type="text" name="simplePhone" maxLength={7} value={formData.simplePhone || ''} onChange={handleNumberChange} disabled={!isEditing} placeholder="1234567" className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
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
                        <textarea rows={2} name="direccion" value={formData.direccion || ''} onChange={handleInputChange} disabled={!isEditing} className={`${inputClass} pl-10 resize-none`} />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className={`${labelClass} text-red-400`}>Condición Médica</label>
                    <textarea rows={2} name="condicion_medica" value={formData.condicion_medica || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="NINGUNA"
                        className={`${inputClass} ${formData.condicion_medica ? 'bg-red-50 text-red-700 border-red-100' : ''}`} />
                </div>

                {isMinor && (
                    <div className="pt-4 border-t border-slate-100 bg-orange-50/30 p-4 rounded-xl border border-orange-100 animate-fade-in">
                        <h4 className="text-xs font-bold text-orange-500 uppercase mb-3 flex items-center gap-2"><FaUserFriends className="text-lg"/> Datos del Representante (Obligatorio)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nombre y Apellido Rep.</label>
                                <input type="text" name="representante_nombre" value={formData.representante_nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
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

        {/* --- LISTA DE MATRÍCULAS --- */}
        <div className="lg:col-span-1 space-y-6">
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[400px] relative ${!atleta.activo ? 'opacity-80' : ''}`}>
                
                {!atleta.activo && (
                    <div className="absolute inset-0 bg-slate-50/30 z-10 flex items-center justify-center pointer-events-none"></div>
                )}

                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2"><MdPool className="text-blue-500 text-xl"/> Historial Clases</h2>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{matriculas.length}</span>
                    </div>
                    
                    <div className="flex bg-slate-200/50 p-1 rounded-lg">
                        <button onClick={() => setTabMatriculasActivas(true)} className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-all flex justify-center items-center gap-1 cursor-pointer ${tabMatriculasActivas ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FaToggleOn className="text-sm" /> Activas
                        </button>
                        <button onClick={() => setTabMatriculasActivas(false)} className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-all flex justify-center items-center gap-1 cursor-pointer ${!tabMatriculasActivas ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FaToggleOff className="text-sm" /> Inactivas
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-3">
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
                                    
                                    {/* SECCIÓN DE BOTONES DE MATRÍCULA */}
                                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-slate-600">${clase?.costo}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${tabMatriculasActivas ? 'bg-green-50 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                                {tabMatriculasActivas ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            {/* Activar/Pausar */}
                                            <button 
                                                title={mat.activo ? 'Pausar matrícula' : 'Reactivar matrícula'}
                                                onClick={(e) => handleToggleMatricula(e, mat)}
                                                className={`p-1.5 rounded bg-slate-100 text-slate-600 hover:text-white transition-colors cursor-pointer ${mat.activo ? 'hover:bg-orange-500' : 'hover:bg-green-500'}`}
                                            >
                                                {isProcessingThis ? <FaSpinner className="animate-spin text-xs" /> : mat.activo ? <FaPause className="text-xs"/> : <FaPlay className="text-xs"/>}
                                            </button>
                                            
                                            {/* Eliminar (Soft Delete) */}
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

                <div className="p-4 border-t border-slate-100 bg-white relative z-20">
                    <button 
                        onClick={() => navigate(`/atletas/matricular/${id}`)}
                        disabled={!atleta.activo}
                        className="cursor-pointer w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 hover:border-blue-300 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <FaPlusCircle /> Nueva Inscripción
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AtletaPerfil;