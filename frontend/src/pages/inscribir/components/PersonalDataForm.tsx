
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
            label="Nombres" 
            name="name" 
            value={formData.name} 
            onChange={handleUpperCase} // <--- Validación aplicada
            required 
        />
        <InputGroup 
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
              <option>V</option><option>E</option>
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
          <div className={`flex transition-opacity ${isMinor ? 'opacity-50' : 'opacity-100'}`}>
            <select
                   name="phoneCode"
                   value={formData.phoneCode}
                   onChange={handleChange}
                   className={`bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg text-sm px-2 py-2.5 outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer text-center font-bold text-gray-700 w-20`}
               >
                   <option value="0412">0412</option>
                   <option value="0414">0414</option>
                   <option value="0424">0424</option>
                   <option value="0416">0416</option>
                   <option value="0426">0426</option>
               </select>
            <input 
                type="tel" 
                name="phoneNum" 
                value={formData.phoneNum} 
                onChange={handleOnlyNumbers} // <--- Validación aplicada
                disabled={isMinor} 
                className="w-full border border-gray-300 rounded-r-lg p-2.5 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 font-mono" 
                placeholder={isMinor ? "Bloqueado" : "1234567"} 
                maxLength={7} 
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 ml-1 block mb-1">Dirección <span className="text-red-500">*</span></label>
        <textarea 
            name="address" 
            value={formData.address} 
            onChange={handleUpperCase} // También aplicamos mayúsculas a la dirección para consistencia
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none uppercase focus:outline-none focus:border-blue-500 h-20"
        ></textarea>
      </div>
    </div>
  );
};