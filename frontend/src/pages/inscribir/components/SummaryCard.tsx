import type { IClass, IFormData, IHorario } from '@/pages/inscribir/types'; // Asegúrate de importar IHorario
import React from 'react';

interface SummaryProps {
  formData: IFormData;
  age: number | null;
  isMinor: boolean;
  selectedClass?: IClass; 
}

export const SummaryCard: React.FC<SummaryProps> = ({ formData, age, isMinor, selectedClass }) => {

  // Lógica para formatear la información de la clase
  const renderClassDetails = () => {
    // 1. Si no hay clase seleccionada
    if (!selectedClass) {
      return <p className="text-gray-400">Sin asignar</p>;
    }

    // 2. Extraer Entrenador
    // Nota: Verifica si en tu BD es 'name' o 'nombre'. Usualmente users usa 'name'.
    const entrenadorObj = selectedClass.expand?.entrenador_id;

    const nombreProfe = entrenadorObj?.nombre  || 'Sin Instructor';
    
    // 3. LOGICA COMPLEJA: Extraer Horarios de la tabla intermedia
    // Accedemos a la relación inversa usando corchetes por los paréntesis en el nombre
    const relacionesIntermedias = selectedClass.expand?.['clases_horarios(clase_id)'] || [];

    // Limpiamos: entramos al pivote -> expand -> horario_id
    const horariosLimpios = relacionesIntermedias
      .map((item) => item.expand?.horario_id)
      .filter((h): h is IHorario => h !== undefined); // Filtramos los vacíos

    // 4. Generar el texto final
    const textoHorarios = horariosLimpios.length > 0
      ? horariosLimpios.map(h => `${h.dia} ${h.hora}`).join(', ') // Ajusta 'hora_inicio' según tu interfaz real
      : 'Horario por definir';

    return (
      <div className="flex flex-col gap-1">
        {/* Nombre de la clase */}
        <p className="text-blue-600 font-bold text-xl leading-tight">
          {selectedClass.nombre}
        </p>

        {/* Detalles: Profesor y Horario */}
        <div className="text-gray-500 text-sm font-medium">
           <p>Prof: <span className="text-gray-700 uppercase">{nombreProfe}</span></p>
           <p className="mt-0.5">{textoHorarios}</p>
        </div>

        {/* Precio */}
        <p className="text-green-600 font-bold text-lg mt-1">
          ${selectedClass.costo}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* HEADER AZUL */}
      <div className="bg-blue-600 p-6 text-white relative">
        <h2 className="text-3xl font-black uppercase truncate">
          {formData.name || '---'} {formData.surname || '---'}
        </h2>
        <div className="flex gap-4 mt-2 text-sm font-medium opacity-90">
          <span>{formData.cedulaType}-{formData.cedulaNum || '---'}</span>
          <span>•</span>
          <span>{age !== null ? `${age} Años` : '--'}</span>
        </div>
      </div>
      
      <div className="p-6 text-sm text-gray-600 space-y-4">
        <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
          
          {/* SECCIÓN DE CLASE ACTUALIZADA */}
          <div className="col-span-1">
            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Clase Seleccionada</p>
            {renderClassDetails()}
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Dirección</p>
            <p className="text-gray-800 uppercase line-clamp-3">{formData.address || '---'}</p>
          </div>
        </div>
        
        {/* CONTACTO */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase mb-2">Contacto Principal</p>
          {isMinor ? (
            <>
              <p className="font-bold text-gray-900 text-lg uppercase">{formData.repName} {formData.repSurname}</p>
              <p className="text-gray-500">{formData.repPhoneCode}-{formData.repPhoneNum}</p>
              <span className="text-xs text-orange-500 font-bold mt-1 inline-block bg-orange-100 px-2 py-0.5 rounded">REPRESENTANTE</span>
            </>
          ) : (
              <p className="font-bold text-gray-900 text-lg">{formData.phoneCode}-{formData.phoneNum}</p>
          )}
        </div>

        {formData.hasMedical && (
          <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-red-800 animate-fade">
              <strong className="block text-xs uppercase text-red-400 mb-1">Condición Médica</strong>
              <span className="uppercase font-medium">{formData.medicalDesc}</span>
          </div>
        )}
      </div>
    </div>
  );
};