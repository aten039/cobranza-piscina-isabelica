import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Tipos
import type { ClaseFull, Entrenador } from '@/pages/entrenadores/types';
// Asegúrate de exportar VistaClaseAlumno en tus types
import type { VistaClaseAlumno } from '@/pages/entrenadores/types'; 

// Servicios de Lectura

import { getClaseDetails } from '@/pages/entrenadores/services/getClasesDetails';

// Servicios de Mutación
import { syncHorarios, type SimpleHorario } from '@/pages/entrenadores/services/syncHorarios';
import { updateClase } from '@/pages/entrenadores/services/UpdateClase';
import { deleteClase } from '@/pages/entrenadores/services/deleteClases';

// Errores
import { DeleteClasesError, GetClasesDetailsError, UpdateClasesError } from '@/pages/entrenadores/types/error';

// Iconos
import { 
  FaSwimmingPool, FaArrowLeft, FaPen, FaSave, FaUndo, FaSpinner, 
  FaClock, FaCalendarDay, FaUserGraduate, FaIdCard, FaPhoneAlt,
  FaMoneyBillWave, FaChild, FaUserTie, FaCheckCircle, FaTrashAlt,
  FaBan
} from 'react-icons/fa';
import { MdAddCircle, MdDeleteOutline } from "react-icons/md";
import { getEntrenadoresActive } from '@/pages/entrenadores/services/getEntrenadoresActive';

const ClaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Estados de Datos ---
  const [clase, setClase] = useState<ClaseFull | null>(null);
  const [matriculas, setMatriculas] = useState<VistaClaseAlumno[]>([]); // AHORA USA LA VISTA SQL
  const [allEntrenadores, setAllEntrenadores] = useState<Entrenador[]>([]);
  
  // Estado local para manejar los horarios en la UI (Lista simple)
  const [scheduleList, setScheduleList] = useState<SimpleHorario[]>([]);

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // --- Estados para el Formulario ---
  const [formData, setFormData] = useState<Partial<ClaseFull>>({});

  // Estados temporales para agregar nuevos horarios
  const [tempDia, setTempDia] = useState('LUNES');
  const [tempHora, setTempHora] = useState('06:00');

  // Constantes para selectores
  const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADOS", "DOMINGO"];
  const bloquesHora = Array.from({ length: 17 }, (_, i) => {
    const hora = i + 6;
    return `${hora < 10 ? '0' + hora : hora}:00`;
  });

  // --- 1. Cargar Datos Iniciales ---
  useEffect(() => {
    if (!id) return;

    const loadAllData = async () => {
      try {
        setLoading(true);
        const [details, entrenadoresList] = await Promise.all([
          getClaseDetails(id),
          getEntrenadoresActive()
        ]);
        
        setClase(details.clase);
        setMatriculas(details.matriculas); // Recibe la lista aplanada de la Vista SQL
        setAllEntrenadores(entrenadoresList);

        const simpleHorarios = details.horarios.map(h => ({
            dia: h.expand?.horario_id?.dia || '',
            hora: h.expand?.horario_id?.hora || ''
        })).filter(h => h.dia && h.hora);

        setScheduleList(simpleHorarios);

        setFormData({
          nombre: details.clase.nombre,
          costo: details.clase.costo,
          edadMin: details.clase.edadMin,
          entrenador_id: details.clase.entrenador_id,
        });

      } catch (err) {
        if (err instanceof GetClasesDetailsError) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar los detalles.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id]);

 // --- Manejadores de Input ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Si es tipo número lo parseamos, si es el campo nombre lo pasamos a mayúsculas.
    let finalValue: string | number = value;
    
    if (type === 'number') {
        finalValue = Number(value);
    } else if (name === 'nombre') {
        // Obligamos a que el estado guarde el nombre en mayúsculas
        finalValue = value.toUpperCase(); 
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // --- Gestión de Horarios (UI Local) ---
  const addHorario = () => {
    const existe = scheduleList.find(h => h.dia === tempDia && h.hora === tempHora);
    if (existe) return; 
    setScheduleList([...scheduleList, { dia: tempDia, hora: tempHora }]);
  };

  const removeHorario = (index: number) => {
    const newList = [...scheduleList];
    newList.splice(index, 1);
    setScheduleList(newList);
  };

  // --- 2. Guardar Cambios ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      setWarningMsg(null);

      const updatedClase = await updateClase(id, formData);
      
      if (clase) {
        setClase(prev => prev ? ({ ...prev, ...updatedClase }) : null);
      }

      try {
        await syncHorarios(id, scheduleList);
        setSuccessMsg("Clase y horarios actualizados correctamente");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(null), 3000);

      } catch (scheduleError) {
        console.error("Error en horarios:", scheduleError);
        setWarningMsg("⚠️ Los datos de la clase se guardaron, pero hubo un error al guardar los horarios. Por favor intente actualizar los horarios nuevamente.");
      }

    } catch (err) {
       console.error(err);
       if (err instanceof UpdateClasesError) {
          setError(err.message);
       } else {
          setError("Ocurrió un error crítico al guardar la clase.");
       }
    } finally {
      setSaving(false);
    }
  };

  // --- 3. Eliminar Clase (Soft Delete) ---
  const handleDeleteClass = async () => {
      const confirmacion = window.confirm(
          "⚠️ ¿Estás seguro que deseas eliminar esta clase?\n\nAl hacerlo, se inactivará permanentemente y todas las matrículas asociadas serán dadas de baja."
      );
      
      if (confirmacion && id) {
          try {
              setDeleting(true);
              await deleteClase(id);
              navigate('/entrenadores/clases');
          } catch (err) {
                if (err instanceof DeleteClasesError) {
                    setError(err.message);
                } else { 
                    setError("Ocurrió un error al eliminar la clase.");
                }
              setDeleting(false);
          }
      }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  // --- Renderizado ---

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-blue-600">
      <FaSpinner className="animate-spin text-5xl mb-4" />
      <p className="animate-pulse font-medium">Cargando aula...</p>
    </div>
  );

  if (!clase) return <div className="p-8 text-center">Clase no encontrada</div>;

  // CONDICIÓN: Verificar si la clase está inactiva/eliminada
  const isDeleted = !clase.activo;

  const inputClass = `w-full p-2.5 rounded-lg border transition-all outline-none text-sm ${
    isEditing 
      ? 'border-blue-300 focus:ring-2 focus:ring-blue-500/20 bg-white' 
      : 'border-transparent bg-slate-100 text-slate-600 font-medium'
  }`;

  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in pb-24">
      
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm cursor-pointer"
      >
        <FaArrowLeft className="mr-2" /> Volver al listado
      </button>

      {/* BANNER DE CLASE ELIMINADA */}
      {isDeleted && (
        <div className="mb-6 bg-red-50/80 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 font-bold animate-fade-in shadow-sm">
          <FaBan className="text-2xl" />
          Esta clase se encuentra inactiva o ha sido eliminada. El registro actual es de solo lectura por motivos de auditoría.
        </div>
      )}

      {/* Encabezado Principal */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${isDeleted ? 'bg-slate-100 border-slate-300 grayscale-[0.3]' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`${isDeleted ? 'bg-slate-400 shadow-slate-200' : 'bg-blue-600 shadow-blue-200'} p-4 rounded-xl text-white shadow-lg`}>
            <FaSwimmingPool className="text-3xl" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold uppercase tracking-tight ${isDeleted ? 'text-slate-600 line-through decoration-slate-400' : 'text-slate-800'}`}>
              {clase.nombre}
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-2">
               ID: {clase.id}
               {isDeleted && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">INACTIVA</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
           {/* Solo mostramos los botones de edición si la clase está ACTIVA */}
           {!isDeleted && (
               isEditing ? (
                 <button onClick={handleCancel} className="cursor-pointer px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all text-sm">
                   <FaUndo /> Cancelar
                 </button>
               ) : (
                 <button onClick={() => setIsEditing(true)} className="cursor-pointer px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all text-sm shadow-sm">
                   <FaPen /> Editar Datos
                 </button>
               )
           )}
        </div>
      </div>

      {/* Contenido Principal (Filtro oscuro si está eliminada) */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all ${isDeleted ? 'opacity-90 grayscale-[0.5]' : ''}`}>

        {/* COLUMNA IZQUIERDA: Formulario y Horarios */}
        <div className="lg:col-span-1 space-y-6 relative">
          
          {/* Overlay protector si está eliminado */}
          {isDeleted && (
            <div className="absolute inset-0 z-10 cursor-not-allowed"></div>
          )}

          {/* Tarjeta 1: Datos Básicos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              <FaPen className="text-blue-500 text-sm" /> Detalles de la Clase
            </h2>

            {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">{error}</div>}
            {warningMsg && <div className="mb-4 p-3 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200 flex items-start gap-2">
                <span className="text-lg">⚠️</span> <span>{warningMsg}</span>
            </div>}
            {successMsg && <div className="mb-4 p-2 bg-green-50 text-green-600 text-xs rounded border border-green-100 flex items-center gap-1"><FaCheckCircle/> {successMsg}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={labelClass}>Nombre de la Clase</label>
                <input
                  maxLength={50}
                  type="text"
                  name="nombre"
                  disabled={!isEditing}
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  className={`${inputClass} uppercase`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}><FaMoneyBillWave className="inline mr-1"/> Costo ($)</label>
                  <input
                    type="number"
                    name="costo"
                    disabled={!isEditing}
                    value={formData.costo || 0}
                    onChange={handleInputChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}><FaChild className="inline mr-1"/> Edad Min.</label>
                  <input
                    maxLength={50}
                    type="number"
                    name="edadMin"
                    disabled={!isEditing}
                    value={formData.edadMin || 0}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}><FaUserTie className="inline mr-1"/> Entrenador</label>
                <select
                  name="entrenador_id"
                  disabled={!isEditing}
                  value={formData.entrenador_id || ''}
                  onChange={handleInputChange}
                  className={`${inputClass} uppercase`}
                >
                  <option value="">Seleccione...</option>
                  {allEntrenadores.map(ent => (
                    <option key={ent.id} value={ent.id}>
                      {ent.nombre} {ent.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>

          {/* Tarjeta 2: Gestión de Horarios */}
          <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-colors ${isEditing ? 'border-blue-200 shadow-md' : ''}`}>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FaClock className="text-orange-400" /> Horarios Asignados
            </h2>
            
            {isEditing && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className={labelClass}>Agregar Bloque</label>
                    <div className="flex gap-2 mb-2">
                        <select 
                            value={tempDia} 
                            onChange={(e) => setTempDia(e.target.value)}
                            className="flex-1 text-xs p-2 rounded border border-slate-300 outline-none cursor-pointer uppercase"
                        >
                            {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                            value={tempHora} 
                            onChange={(e) => setTempHora(e.target.value)}
                            className="flex-1 text-xs p-2 rounded border border-slate-300 outline-none cursor-pointer font-mono"
                        >
                             {bloquesHora.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <button 
                        type="button" 
                        onClick={addHorario}
                        className="cursor-pointer w-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                        <MdAddCircle /> Agregar Horario
                    </button>
                </div>
            )}

            {scheduleList.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">Sin horarios definidos</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scheduleList.map((h, index) => (
                  <div 
                    key={`${h.dia}-${h.hora}-${index}`} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all uppercase
                      ${isEditing 
                        ? 'bg-white border border-blue-200 shadow-sm pr-1' 
                        : 'bg-orange-50 border border-orange-100 text-orange-700'
                      }`}
                  >
                    <FaCalendarDay className={isEditing ? "text-blue-400" : "text-orange-300"} />
                    <span className={isEditing ? "text-slate-700" : ""}>{h.dia}</span> 
                    <span className={isEditing ? "text-slate-300" : "text-orange-300"}>|</span> 
                    <span className={isEditing ? "text-slate-700" : "font-mono"}>{h.hora}</span>
                    
                    {isEditing && (
                        <button 
                            type="button"
                            onClick={() => removeHorario(index)}
                            className="cursor-pointer ml-1 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar horario"
                        >
                            <MdDeleteOutline size={16} />
                        </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditing && (
            <button 
                onClick={handleSave}
                disabled={saving}
                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
            >
                {saving ? <FaSpinner className="animate-spin"/> : <FaSave />}
                Guardar Todos los Cambios
            </button>
          )}

          {/* Ocultamos el botón de eliminar si ya está eliminada */}
          {!isEditing && !isDeleted && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                  <button 
                    onClick={handleDeleteClass}
                    disabled={deleting}
                    className="cursor-pointer w-full flex items-center justify-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-100 hover:border-red-500 bg-red-50 py-3 rounded-xl transition-all font-semibold text-sm group shadow-sm"
                  >
                      {deleting ? <FaSpinner className="animate-spin"/> : <FaTrashAlt className="group-hover:animate-bounce" />}
                      Eliminar Clase Permanentemente
                  </button>
              </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Lista de Alumnos */}
        <div className="lg:col-span-2">
          <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col h-full min-h-[500px] ${isDeleted ? 'border-slate-300' : 'border-slate-100'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDeleted ? 'bg-slate-200 border-slate-300' : 'bg-slate-50/50 border-slate-100'}`}>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaUserGraduate className={isDeleted ? "text-slate-500" : "text-blue-500"} /> Alumnos Matriculados {isDeleted && "(Histórico)"}
              </h2>
              <span className={`${isDeleted ? 'bg-slate-300 text-slate-700' : 'bg-blue-100 text-blue-700'} px-3 py-1 rounded-full text-xs font-bold`}>
                Total: {matriculas.length}
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {matriculas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FaUserGraduate className="text-4xl mb-2 opacity-20" />
                  <p>No hay alumnos inscritos en esta clase.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alumno</th>
                      <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                      <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                      <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Cobertura</th>
                      <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {matriculas.map((row) => {
                      
                      // Validación de Fecha de Cobertura
                      const hasCobertura = !!row.cobertura_hasta;
                      
                      // Importante: parsear la fecha de forma segura (asumiendo formato ISO YYYY-MM-DD)
                      let isExpired = true;
                      let formattedDate = "";
                      
                      if (hasCobertura) {
                          // Se añade "T00:00:00" para evitar problemas de zona horaria (UTC -> Local)
                          const coberturaDate = new Date(row.cobertura_hasta!.split(' ')[0] + "T00:00:00");
                          // Normalizar fecha de hoy (sin horas) para comparación justa
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          isExpired = coberturaDate < today;
                          formattedDate = coberturaDate.toLocaleDateString('es-VE');
                      }

                      return (
                        <tr key={row.id} className={`hover:bg-blue-50/30 transition-colors group ${!row.matricula_activa ? 'opacity-70 bg-slate-50/50' : ''}`}>
                          <td className="p-3">
                            <div className="font-bold text-slate-700 text-sm uppercase">
                              {row.atleta_nombre} {row.atleta_apellido}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-mono mt-0.5">
                              <FaIdCard className="text-slate-400"/> {row.atleta_cedula}
                            </div>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                             <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <FaPhoneAlt className="text-slate-300"/>
                              {row.atleta_telefono || 'N/A'}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                row.matricula_activa ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                            }`}>
                                {row.matricula_activa ? 'Activa' : 'Pausada'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {hasCobertura ? (
                                <div className={`text-xs font-bold font-mono px-2 py-1 rounded-md inline-block ${
                                    isExpired 
                                    ? 'bg-red-50 text-red-600 border border-red-100' 
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                    {formattedDate}
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400 italic font-medium">Sin pagos</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => navigate(`/atletas/perfil/${row.atleta_id}`)}
                              className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                              Ver Perfil
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClaseDetails;