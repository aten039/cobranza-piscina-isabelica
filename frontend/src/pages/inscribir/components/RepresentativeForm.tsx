import React from 'react';
import { InputGroup } from '@/components/InputGroup';
import type { IFormData } from '@/pages/inscribir/types';
import { MdFamilyRestroom } from 'react-icons/md';

interface RepProps {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const RepresentativeForm: React.FC<RepProps> = ({ formData, handleChange }) => {

  // --- MANEJADORES DE VALIDACIÓN ---

  // A. Forzar Mayúsculas (Nombres y Apellidos)
  const handleUpperCase = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.toUpperCase();
    handleChange(e);
  };

  // B. Solo Números (Cédula y Teléfono)
  const handleOnlyNumbers = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    handleChange(e);
  };

  return (
    <div className="pt-4 mt-2 border-t border-dashed border-orange-200 bg-orange-50/50 p-4 rounded-xl animate-fade">
      <h4 className="font-bold text-xs text-orange-600 mb-3 uppercase flex items-center gap-1">
        <MdFamilyRestroom className="text-lg" /> Datos del Representante (Obligatorio)
      </h4>
      
      <div className="space-y-3">
        {/* NOMBRES Y APELLIDOS EN MAYÚSCULAS */}
        <div className="grid grid-cols-2 gap-3">
          <InputGroup 
            label="Nombre" 
            name="repName" 
            value={formData.repName} 
            onChange={handleUpperCase} // <--- Validación aplicada
            className="bg-white border-orange-200" 
          />
          <InputGroup 
            label="Apellido" 
            name="repSurname" 
            value={formData.repSurname} 
            onChange={handleUpperCase} // <--- Validación aplicada
            className="bg-white border-orange-200" 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* CÉDULA SOLO NÚMEROS */}
          <div className="flex">
            <select 
              name="repCedulaType" 
              value={formData.repCedulaType} 
              onChange={handleChange} 
              className="bg-white border border-orange-200 border-r-0 rounded-l-lg text-xs pl-2 py-2 outline-none text-gray-600"
            >
              <option>V</option>
              <option>E</option>
            </select>
            <input 
              type="tel" 
              maxLength={10} 
              name="repCedulaNum" 
              placeholder="Cédula" 
              value={formData.repCedulaNum} 
              onChange={handleOnlyNumbers} // <--- Validación aplicada
              className="w-full border border-orange-200 bg-white rounded-r-lg p-2 text-sm focus:outline-none focus:border-orange-400 font-mono" 
            />
          </div>

          {/* TELÉFONO SOLO NÚMEROS */}
          <div className="flex">
            <select 
              name="repPhoneCode" 
              value={formData.repPhoneCode} 
              onChange={handleChange} 
              className="bg-white border border-orange-200 border-r-0 rounded-l-lg text-xs pl-2 py-2 outline-none text-gray-600"
            >
              <option value="0412">0412</option>
              <option value="0414">0414</option>
              <option value="0424">0424</option>
              <option value="0416">0416</option>
              <option value="0426">0426</option>
            </select>
            <input 
              type="tel" 
              maxLength={7} 
              name="repPhoneNum" 
              placeholder="Teléfono" 
              value={formData.repPhoneNum} 
              onChange={handleOnlyNumbers} // <--- Validación aplicada
              className="w-full border border-orange-200 bg-white rounded-r-lg p-2 text-sm focus:outline-none focus:border-orange-400 font-mono" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};