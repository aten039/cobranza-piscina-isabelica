import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Entrenador, Clase } from '@/pages/entrenadores/types';
import { 
  EntrenadorError, 
  UpdateEntrenadorError 
} from '@/pages/entrenadores/types/error';

// Iconos (Agregué FaEye)
import { 
  FaUserTie, FaSave, FaPen, FaArrowLeft, FaSwimmingPool, 
  FaPhoneAlt, FaIdCard, FaMapMarkerAlt, FaCheckCircle, 
  FaTimesCircle, FaSpinner, FaUndo, FaEye 
} from 'react-icons/fa';

import { getEntrenadorById } from '@/pages/entrenadores/services/gerEntrenadorById';
import { getClasesByEntrenador } from '@/pages/entrenadores/services/getClasesByEntrenador';
import { updateEntrenador } from '@/pages/entrenadores/services/updateEntrenador';

// Definimos un tipo extendido para manejar los campos temporales del formulario
interface FormData extends Partial<Entrenador> {
  phoneCode?: string;
  simplePhone?: string;
}

const EntrenadorPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados de Datos
  const [entrenador, setEntrenador] = useState<Entrenador | null>(null);
  const [clases, setClases] = useState<Clase[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estado del Formulario usando el tipo extendido
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [entrenadorData, clasesData] = await Promise.all([
          getEntrenadorById(id),
          getClasesByEntrenador(id)
        ]);
        
        setEntrenador(entrenadorData);
        setClases(clasesData);

        let code = "0414"; // Default
        let num = "";

        if (entrenadorData.telefono) {
          if (entrenadorData.telefono.includes('-')) {
            const parts = entrenadorData.telefono.split('-');
            code = parts[0];
            num = parts[1];
          } else {
            // Fallback por si viene sin guion
            code = entrenadorData.telefono.substring(0, 4);
            num = entrenadorData.telefono.substring(4);
          }
        }

        setFormData({
          ...entrenadorData,
          phoneCode: code,
          simplePhone: num
        });

      } catch (err) {
        if (err instanceof EntrenadorError) {
          setError(err.message);
        } else {
          setError("Error inesperado al cargar el perfil.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Manejador de cambios genérico
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;
    
    try {
      setSaving(true);
      setError(null);

      // Combinar código y número antes de guardar
      const finalPhone = `${formData.phoneCode}-${formData.simplePhone}`;
      
      // Creamos el objeto limpio para enviar
      const payload = {
        ...formData,
        telefono: finalPhone
      };
      
      delete payload.phoneCode;
      delete payload.simplePhone;

      const updatedEntrenador = await updateEntrenador(id, payload);
      
      setEntrenador(updatedEntrenador);
      setSuccessMsg("¡Perfil actualizado correctamente!");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      if (err instanceof UpdateEntrenadorError) {
        setError(err.message);
      } else {
        setError("No se pudieron guardar los cambios.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (entrenador) {
        const parts = (entrenador.telefono || "").split('-');
        setFormData({
            ...entrenador,
            phoneCode: parts[0] || "0414",
            simplePhone: parts[1] || ""
        });
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-blue-600">
      <FaSpinner className="animate-spin text-4xl mb-4" />
      <p>Cargando perfil...</p>
    </div>
  );

  if (error && !entrenador) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!entrenador) return null;

  const hasClases = clases.length > 0;

  // Clases de estilo para reutilizar
  const inputBaseClass = `p-3 border transition-all outline-none ${
     isEditing 
       ? 'border-blue-300 focus:ring-2 focus:ring-blue-500/20 bg-white' 
       : 'border-transparent bg-slate-50 text-slate-700 font-medium'
  }`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      
      {/* Botón Volver */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium"
      >
        <FaArrowLeft className="mr-2" /> Volver al listado
      </button>

      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border-2 border-white/30 shadow-inner">
            <FaUserTie className="text-5xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{entrenador.nombre} {entrenador.apellido}</h1>
            <p className="text-blue-100 opacity-90 flex items-center gap-2 mt-1 font-mono bg-blue-800/30 px-2 py-0.5 rounded w-fit">
              <FaIdCard /> {entrenador.cedula}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
             <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm">
               <FaUndo /> Cancelar
             </button>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all">
              <FaPen className="text-sm" /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${hasClases ? 'lg:grid-cols-3' : ''} gap-8 mt-6`}>
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className={`${hasClases ? 'lg:col-span-2' : 'w-full'} bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative`}>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2"><FaCheckCircle /> {successMsg}</div>}

          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Información Personal
            </h2>
            {isEditing && <span className="text-xs text-blue-500 font-semibold uppercase tracking-wider animate-pulse">Modo Edición</span>}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  disabled={!isEditing}
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg ${inputBaseClass}`}
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  disabled={!isEditing}
                  value={formData.apellido || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg ${inputBaseClass}`}
                />
              </div>

              {/* Campo Teléfono Dividido */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono</label>
                <div className="relative flex w-full shadow-sm rounded-lg">
                    <div className="absolute top-3.5 left-3 text-slate-400 z-10 pointer-events-none">
                       <FaPhoneAlt />
                    </div>
                    
                    <select
                        name="phoneCode"
                        disabled={!isEditing}
                        value={formData.phoneCode || '0412'}
                        onChange={handleInputChange}
                        className={`w-28 pl-9 pr-2 rounded-l-lg border-r-0 cursor-pointer appearance-none ${inputBaseClass}`}
                    >
                        <option value="0412">0412</option>
                        <option value="0414">0414</option>
                        <option value="0424">0424</option>
                        <option value="0416">0416</option>
                        <option value="0426">0426</option>
                    </select>

                    <input
                        type="tel"
                        name="simplePhone"
                        maxLength={7}
                        disabled={!isEditing}
                        value={formData.simplePhone || ''}
                        onChange={handleInputChange}
                        placeholder="1234567"
                        className={`w-full rounded-r-lg font-mono ${inputBaseClass}`}
                    />
                </div>
              </div>

              {/* Cédula */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cédula</label>
                <div className="relative">
                  <FaIdCard className="absolute top-3.5 left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="cedula"
                    disabled={true} 
                    value={formData.cedula || ''}
                    className="w-full p-3 pl-10 rounded-lg border border-transparent bg-slate-100 text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="md:col-span-2 relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute top-3.5 left-3 text-slate-400 pointer-events-none" />
                  <textarea
                    name="direccion"
                    rows={3}
                    disabled={!isEditing}
                    value={formData.direccion || ''}
                    onChange={handleInputChange}
                    className={`w-full pl-10 resize-none leading-relaxed rounded-lg ${inputBaseClass}`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* COLUMNA DERECHA: Clases */}
        {hasClases && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaSwimmingPool className="text-blue-500" /> Clases Asignadas
              </h2>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                {clases.length}
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {clases.map((clase) => (
                <div 
                  key={clase.id} 
                  className={`p-4 rounded-xl border transition-all duration-200 group hover:shadow-md ${
                    clase.activo 
                      ? 'border-blue-100 bg-gradient-to-br from-white to-blue-50' 
                      : 'border-slate-100 bg-slate-50 opacity-60 grayscale-[0.5]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {clase.nombre}
                    </h3>
                    {clase.activo ? (
                      <FaCheckCircle className="text-green-500 text-lg" title="Activo" />
                    ) : (
                      <FaTimesCircle className="text-slate-400 text-lg" title="Inactivo" />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-slate-200/50 pt-3 mt-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Costo</p>
                      <p className="text-lg font-mono font-bold text-slate-600">${clase.costo}</p>
                    </div>

                    {/* BOTÓN VER CLASE */}
                    <button 
                      onClick={() => navigate(`/clases/${clase.id}`)}
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-100 hover:border-blue-200"
                    >
                      <FaEye className="text-sm" /> Ver Clase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EntrenadorPerfil;