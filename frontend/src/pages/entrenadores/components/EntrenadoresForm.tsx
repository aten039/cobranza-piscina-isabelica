import React, { useState } from 'react';
import { InputGroup } from '@/components/InputGroup'; 
import { MdPersonAdd, MdSave } from "react-icons/md";
import type { ProfessorData } from '@/pages/entrenadores/types';
import { createEntrenador } from '@/pages/entrenadores/services/crearEntrenador';
import { useNavigate } from 'react-router-dom';
import { CreateEntrenadorError } from '@/pages/entrenadores/types/error';
import { FaPhoneAlt } from 'react-icons/fa';

const EntrenadoresForm: React.FC = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfessorData>({
    nombre: '',
    apellido: '',
    cedulaType: 'V', 
    cedula: '',
    phoneCode: '0414',
    telefono: '',
    direccion: ''
  });
  
  const [loading, setLoading] = useState(false);

  // 1. Manejador de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convertimos a mayúsculas solo si es texto o email
    const finalValue = (type === 'text' || type === 'email') 
      ? value.toUpperCase() 
      : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const validate = (): boolean => {
    const errors: string[] = []; 

    if (!formData.nombre.trim()) errors.push("El campo NOMBRE es obligatorio.");
    if (!formData.apellido.trim()) errors.push("El campo APELLIDO es obligatorio.");
    if (!formData.cedula.trim()) errors.push("Debes ingresar el número de CÉDULA.");
    
    if (!formData.telefono.trim()) {
      errors.push("Debes ingresar el número de TELÉFONO.");
    } else if (formData.telefono.length < 7) {
      errors.push("El teléfono parece incompleto (muy corto).");
    }

    if (errors.length > 0) {
      alert("⚠️ Faltan datos obligatorios para continuar:\n\n- " + errors.join("\n- "));
      return false; 
    }

    return true; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true); 

    try {
      await createEntrenador(formData);
      
      alert("✅ Entrenador guardado exitosamente");
      
      setFormData({
        nombre: '', apellido: '', cedulaType: 'V', cedula: '', 
        phoneCode: '0414', telefono: '', direccion: ''
      });

      navigate('/entrenadores');

    } catch (error) {
        if (error instanceof CreateEntrenadorError) {
          alert(`❌ ${error.message}`);
        } else {
           alert("❌ Ocurrió un error inesperado al guardar el entrenador.");
        }
    } finally {
      setLoading(false); 
    }
  };

  // --- ESTILOS COMPARTIDOS ---
  // Estos estilos aseguran que la Cédula y el Teléfono se vean idénticos
  const selectPrefixClass = "bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg text-sm px-2 py-2.5 outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer text-center font-bold text-gray-700";
  const inputSuffixClass = "w-full border border-gray-300 rounded-r-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-0 uppercase placeholder-gray-300 transition-all font-mono";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit transition-all shadow-sm">
      <h3 className="font-bold text-xs text-gray-400 uppercase mb-5 flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-gray-600 bg-gray-100 p-1 rounded-md">
           <MdPersonAdd size={18} />
        </span>
        Nuevo Entrenador
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* FILA 1: Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: JUAN"
            required
          />
          <InputGroup
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ej: PÉREZ"
            required
          />
        </div>

        {/* FILA 2: Cédula y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* CAMPO CÉDULA */}
          <div>
            <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">
             Cédula <span className="text-red-500">*</span>
            </label>
            <div className="flex w-full shadow-sm">
              <select
                name="cedulaType"
                value={formData.cedulaType}
                onChange={handleChange}
                className={`${selectPrefixClass} w-16`}
              >
                <option value="V">V</option>
                <option value="E">E</option>
              </select>
              <input
                type="tel"
                maxLength={12}
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                className={inputSuffixClass}
                placeholder="12345678"
              />
            </div>
          </div>

          {/* CAMPO TELÉFONO (Diseño igualado) */}
          <div>
           <label className="text-xs font-bold text-gray-500 ml-1 mb-1 flex items-center gap-1">
             <FaPhoneAlt className="text-gray-400 text-[10px]" /> Teléfono <span className="text-red-500">*</span>
           </label>
           <div className="flex w-full shadow-sm">
               {/* Select: Código de área */}
               <select
                   name="phoneCode"
                   value={formData.phoneCode}
                   onChange={handleChange}
                   className={`${selectPrefixClass} w-20`} // Ajustado a w-20 para que quepan 4 dígitos bien
               >
                   <option value="0412">0412</option>
                   <option value="0414">0414</option>
                   <option value="0424">0424</option>
                   <option value="0416">0416</option>
                   <option value="0426">0426</option>
               </select>

               {/* Input: Número restante */}
               <input
                   type="tel"
                   name="telefono"
                   value={formData.telefono}
                   onChange={handleChange}
                   maxLength={7}
                   placeholder="1234567"
                   className={inputSuffixClass}
               />
           </div>
          </div>
        </div>

        {/* FILA 3: Dirección */}
        <InputGroup
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Av. Bolívar, Casa Nro..."
        />

        {/* Botón Guardar */}
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full py-3.5 rounded-xl font-bold text-xs shadow-lg mt-4 transition-all uppercase tracking-widest flex justify-center items-center gap-2
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg active:scale-95'}
            `}
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <MdSave size={16} className="text-gray-400"/>
                Guardar Profesor
              </>
            )}
          </button>
      </form>
    </div>
  );
};

export default EntrenadoresForm;