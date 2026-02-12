import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputGroup } from '@/components/InputGroup'; 

// Iconos
import { 
  MdOutlineClass, 
  MdSave, 
  MdAddCircle, 
  MdDeleteOutline 
} from "react-icons/md";
import { 
  FaClock, 
  FaCalendarDay, 
  FaUserGraduate, 
  FaChalkboardTeacher 
} from 'react-icons/fa';

// Servicios y Tipos
import { getEntrenadores } from '@/pages/entrenadores/services/getEntrenadores';
import type { ClaseFormData, Entrenador } from '@/pages/entrenadores/types';
import { createClaseConHorarios } from '@/pages/entrenadores/services/createClaseHorario';


const ClasesForm: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  
  // Estado principal del formulario
  const [formData, setFormData] = useState<ClaseFormData>({
    nombre: '',
    costo: 0,
    edadMin: 0,
    entrenador_id: '',
    horarios: []
  });

  // Estados para el selector temporal de horarios
  const [tempDia, setTempDia] = useState('LUNES');
  const [tempHora, setTempHora] = useState('06:00');

  // Cargar lista de entrenadores al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getEntrenadores();
        setEntrenadores(data);
      } catch (error) {
        console.error("Error al cargar entrenadores:", error);
      }
    };
    cargarDatos();
  }, []);

  // Generar bloques de horas (06:00 a 22:00)
  const bloquesHora = Array.from({ length: 17 }, (_, i) => {
    const hora = i + 6;
    return `${hora < 10 ? '0' + hora : hora}:00`;
  });

  const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

  // Manejador de cambios unificado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validaciones para campos numéricos (Rango 0 - 100)
    if (name === 'costo' || name === 'edadMin') {
      const numValue = Number(value);
      if (numValue < 0) return;
      if (numValue > 100) return;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      return;
    }

    // Nombre en mayúsculas y asignación general
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'nombre' ? value.toUpperCase() : value 
    }));
  };

  // Agregar horario a la lista
  const addHorario = () => {
    const existe = formData.horarios.find(h => h.dia === tempDia && h.hora === tempHora);
    if (existe) {
      alert("Este horario ya ha sido agregado a la lista.");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, { dia: tempDia, hora: tempHora }]
    }));
  };

  // Quitar horario de la lista
  const removeHorario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
// 1. Acumulador de errores
    const errores: string[] = [];

    // 2. Validaciones de negocio
    if (!formData.entrenador_id) {
      errores.push("Debe seleccionar un entrenador responsable.");
    }
    if(!formData.nombre.trim()) {
      errores.push("El nombre de la clase no puede estar vacío.");
    }
    
    if (formData.horarios.length === 0) {
      errores.push("Debe añadir al menos un horario para la clase.");
    }

    if (formData.costo <= 0) {
      errores.push("El costo mensual debe ser mayor a 0.");
    }

    if (formData.edadMin < 0) {
      errores.push("La edad mínima no puede ser negativa.");
    }

    // 3. Si hay errores, los mostramos todos juntos y frenamos la ejecución
    if (errores.length > 0) {
      const mensajeFinal = "⚠️ Faltan datos obligatorios para continuar:\n\n- " + errores.join("\n- ");
      alert(mensajeFinal);
      return; 
    }

    setLoading(true);
    try {
      await createClaseConHorarios(formData);
      alert("✅ Clase y horarios guardados exitosamente.");
      navigate('/clases');
    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("❌ Ocurrió un error al guardar. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-sm transition-all">
      {/* Encabezado */}
      <h3 className="font-bold text-xs text-gray-400 uppercase mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-blue-600 bg-blue-50 p-1 rounded-md">
          <MdOutlineClass size={18} />
        </span>
        Configuración de Nueva Clase / Entrenamiento
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* FILA 1: Nombre y Entrenador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup
            label="Nombre de la Clase"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: NATACIÓN NIVEL 1"
            required
          />

          <div>
            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 flex items-center gap-1">
              <FaChalkboardTeacher className="text-blue-400"/> Entrenador Responsable <span className="text-red-500">*</span>
            </label>
            <select 
              name="entrenador_id"
              value={formData.entrenador_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none bg-white transition-all cursor-pointer"
              required
            >
              <option value="">Seleccione un entrenador...</option>
              {entrenadores.map(ent => (
                <option key={ent.id} value={ent.id}>
                  {ent.apellido} {ent.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FILA 2: Costo y Edad Mínima */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Costo Mensual ($)</label>
            <input
              type="number"
              name="costo"
              value={formData.costo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-all font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 flex items-center gap-1">
              <FaUserGraduate className="text-[10px]"/> Edad Mínima
            </label>
            <input
              type="number"
              name="edadMin"
              value={formData.edadMin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-all font-mono"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* SECCIÓN: Gestión de Horarios */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Planificación de Horarios
          </label>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-end gap-3 shadow-inner">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">DÍA DE SEMANA</label>
              <select 
                value={tempDia} 
                onChange={(e) => setTempDia(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold text-slate-400 mb-1 block">HORA DE INICIO</label>
              <select 
                value={tempHora} 
                onChange={(e) => setTempHora(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bloquesHora.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <button
              type="button"
              onClick={addHorario}
              className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs font-bold shadow-md active:scale-95"
            >
              <MdAddCircle size={18} /> AÑADIR BLOQUE
            </button>
          </div>

          {/* Listado de bloques agregados */}
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.horarios.length === 0 && (
              <p className="text-xs text-slate-400 italic">No se han definido horarios para esta clase...</p>
            )}
            {formData.horarios.map((h, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-white border border-blue-200 pl-3 pr-1 py-1.5 rounded-full text-[11px] font-bold text-blue-700 shadow-sm animate-in fade-in zoom-in duration-200"
              >
                <FaCalendarDay className="text-blue-300" /> {h.dia}
                <FaClock className="text-blue-300 ml-1" /> {h.hora}
                <button 
                  type="button"
                  onClick={() => removeHorario(index)}
                  className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ml-1"
                >
                  <MdDeleteOutline size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar - Estilo Negro */}
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer w-full py-3.5 rounded-xl font-bold text-xs shadow-lg mt-6 transition-all uppercase tracking-widest flex justify-center items-center gap-2
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl active:scale-[0.98]'}
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">Procesando...</span>
          ) : (
            <>
              <MdSave size={16} className="text-gray-400"/>
              Registrar Clase en el Sistema
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ClasesForm;