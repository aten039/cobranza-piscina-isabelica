
import React from 'react';
import { InputGroup } from '@/components/InputGroup';
import type { IFormData } from '@/pages/inscribir/types';
import { MdPerson, MdCalendarToday } from 'react-icons/md';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  age: number | null;
  isMinor: boolean;
}

export const PersonalDataForm: React.FC<Props> = ({ formData, handleChange, age, isMinor }) => {
  // 1. CÁLCULO DE LA FECHA LÍMITE (Igual que antes)
  const today = new Date();
  const minAge = 0; 
  const maxYear = today.getFullYear() - minAge;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const maxDateAllowed = `${maxYear}-${month}-${day}`;

  // --- NUEVOS MANEJADORES DE VALIDACIÓN ---

  // A. Forzar Mayúsculas (Para Nombres y Apellidos)
  const handleUpperCase = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.value = e.target.value.toUpperCase();
    handleChange(e);
  };

 const handleOnlyNumbers = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reemplaza cualquier cosa que NO sea un número (0-9) por vacío
    // CORREGIDO: Faltaban los paréntesis y las barras / /
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    handleChange(e);
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="font-bold text-lg mb-4 text-blue-600 flex items-center gap-2">
        <MdPerson className="text-2xl" /> Datos Personales
      </h3>

      {/* NOMBRES Y APELLIDOS EN MAYÚSCULAS */}
      <div className="grid grid-cols-2 gap-3">
        <InputGroup 
            maxLength={50}
            label="Nombres" 
            name="name" 
            value={formData.name} 
            onChange={handleUpperCase} // <--- Validación aplicada
            required 
        />
        <InputGroup 
            maxLength={50}
            label="Apellidos" 
            name="surname" 
            value={formData.surname} 
            onChange={handleUpperCase} // <--- Validación aplicada
            required 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Cédula</label>
          <div className="flex">
            <select name="cedulaType" value={formData.cedulaType} onChange={handleChange} className="bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg text-sm pl-3 pr-2 py-2.5 outline-none">
              <option value="V">V</option>
              <option value="E">E</option>
              <option value="P">P</option>
            </select>
            <input 
                type="tel" 
                maxLength={10} 
                name="cedulaNum" 
                value={formData.cedulaNum} 
                onChange={handleOnlyNumbers} // <--- Validación aplicada (Solo números)
                className="w-full border border-gray-300 rounded-r-lg p-2.5 focus:outline-none focus:border-blue-500 font-mono" 
                placeholder="12345678" 
            />
          </div>
        </div>
        
        {/* INPUT DE FECHA */}
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Nacimiento <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
              max={maxDateAllowed}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 relative z-10 bg-transparent uppercase" 
            />
            <MdCalendarToday className="absolute right-3 bottom-3 text-gray-400 pointer-events-none z-0" />
          </div>
        </div>
      </div>

       <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Edad</label>
          <div className="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-800 text-center">
            {age !== null ? `${age} Años` : '--'}
          </div>
        </div>
        
        {/* TELÉFONO SOLO NÚMEROS */}
        <div>
          <label className={`text-xs font-bold ml-1 block mb-1 ${isMinor ? 'text-gray-400' : 'text-gray-500'}`}>
            Teléfono {isMinor && '(Inactivo)'}
          </label>
          <div className={`flex shadow-sm rounded-lg transition-opacity ${isMinor ? 'opacity-50' : 'opacity-100'}`}>
          {/* Input del código de área (reemplaza al select) */}
          <input
            type="tel"
            name="phoneCode"
            value={formData.phoneCode}
            onChange={handleOnlyNumbers} // Reutilizamos tu función de solo números
            disabled={isMinor} // Se bloquea igual que el resto si es menor
            maxLength={4}
            minLength={4}
            required
            placeholder={isMinor ? "---" : "0414"}
            className={`w-20 bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg text-sm px-2 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:z-10 transition-colors text-center font-mono font-bold text-gray-700 disabled:cursor-not-allowed`}
          />
          
          {/* Input del número principal */}
          <input 
            type="tel" 
            name="phoneNum" 
            value={formData.phoneNum} 
            onChange={handleOnlyNumbers} 
            disabled={isMinor} 
            maxLength={7} 
            placeholder={isMinor ? "Bloqueado" : "1234567"} 
            className="w-full border border-gray-300 rounded-r-lg p-2.5 focus:outline-none focus:border-blue-500 focus:z-10 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono transition-colors" 
          />
        </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Dirección <span className="text-red-500">*</span></label>
        <textarea 
            maxLength={100}
            name="address" 
            value={formData.address} 
            onChange={handleUpperCase} // También aplicamos mayúsculas a la dirección para consistencia
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none uppercase focus:outline-none focus:border-blue-500 h-20"
        ></textarea>
      </div>
    </div>
  );
};