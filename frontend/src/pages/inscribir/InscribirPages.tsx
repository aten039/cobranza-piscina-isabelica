import React, { useState, useEffect } from 'react';
import { MdSettings, MdArrowForward, MdArrowBack, MdEventNote } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

// Componentes
import { PaymentForm } from '@/pages/inscribir/components/PaymentForm';
import { PersonalDataForm } from '@/pages/inscribir/components/PersonalDataForm';
import { RepresentativeForm } from '@/pages/inscribir/components/RepresentativeForm';
import { SummaryCard } from '@/pages/inscribir/components/SummaryCard';

// Tipos
import type { IClass, IFormData } from '@/pages/inscribir/types';
import { getClases, saveInscription } from '@/pages/inscribir/services/inscribir';

const InscribirPages: React.FC = () => {
  // --- Estados ---
  const [step, setStep] = useState<number>(1);
  const [age, setAge] = useState<number | null>(null);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false); // Nuevo estado para el select
  
  const [availableClasses, setAvailableClasses] = useState<IClass[]>([]);

  const [formData, setFormData] = useState<IFormData>({
    name: '', surname: '', cedulaType: 'V', cedulaNum: '', dob: '',
    phoneCode: '0414', phoneNum: '', address: '',
    repName: '', repSurname: '', repCedulaType: 'V', repCedulaNum: '',
    repPhoneCode: '0414', repPhoneNum: '',
    hasMedical: false, medicalDesc: '',
    classId: '', 
    // Valores por defecto para pagos
    currency: 'USD', 
    paymentMethod: 'zelle', 
    paymentRef: '', paymentDate: new Date().toISOString().split('T')[0],
    coverageDate: '', paymentAmount: 0,
  });

  const isMinor = age !== null && age < 18;

  // --- 1. Calcular Edad (Trigger: cambio en fecha de nacimiento) ---
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);

      // Limpiar teléfono si pasa de mayor a menor (opcional)
      if (calculatedAge < 18) {
        setFormData(prev => ({ ...prev, phoneNum: '' }));
      }
    } else {
      setAge(null);
      setAvailableClasses([]); // Si borra la fecha, limpiamos las clases
    }
  }, [formData.dob]);

  // --- 2. Cargar Clases Filtradas (Trigger: cambio en edad) ---
  useEffect(() => {
    const fetchClases = async () => {
      // Solo buscamos si hay una edad válida calculada
      if (age !== null && age >= 0) {
        setLoadingClasses(true);
        // Limpiamos la selección actual para evitar inconsistencias
        setFormData(prev => ({ ...prev, classId: '' })); 
        
        try {
            // Llamamos al servicio nuevo que recibe la edad
            const clases = await getClases(age);
            setAvailableClasses(clases);
        } catch (error) {
            console.error(error);
            setAvailableClasses([]);
        } finally {
            setLoadingClasses(false);
        }
      } else {
        setAvailableClasses([]);
      }
    };

    fetchClases();
  }, [age]); // Se ejecuta cada vez que la edad cambia

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Manejo seguro de checkbox
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'paymentAmount' ? parseFloat(value) || 0 : value)
    }));
  };

  // ==========================================
  // 🚀 VALIDACIÓN DEL PASO 1 (Datos Personales)
  // ==========================================
  const handleNextStep = () => {
    const errors: string[] = [];

    // 1. Validar Datos Básicos
    if (!formData.name.trim()) errors.push("Nombre del alumno");
    if (!formData.surname.trim()) errors.push("Apellido del alumno");
    if (!formData.dob) errors.push("Fecha de nacimiento");
    if (!formData.address.trim()) errors.push("Dirección");

    // 2. Validar Lógica de Contacto
    if (isMinor) {
      if (!formData.repName.trim()) errors.push("Nombre del representante");
      if (!formData.repSurname.trim()) errors.push("Apellido del representante");
      if (!formData.repCedulaNum.trim()) errors.push("Cédula del representante");
      if (!formData.repPhoneNum.trim()) errors.push("Teléfono del representante");
    } else {
      if (!formData.phoneNum.trim()) errors.push("Teléfono del alumno");
      if (!formData.cedulaNum.trim()) errors.push("Cédula del alumno");
    }

    // 3. Validar Selección de Clase
    if (!formData.classId) errors.push("Horario de clase");

    if (errors.length > 0) {
      alert(`⚠️ Faltan datos obligatorios para continuar:\n\n- ${errors.join('\n- ')}`);
      return;
    }

    setStep(2);
  };

  // ==========================================
  // 🚀 SUBMIT FINAL (Validación de Pagos)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación extra de moneda
    if (formData.currency === 'BS') {
        if (!formData.paymentAmount || formData.paymentAmount <= 0) {
            alert("⚠️ Error: El MONTO es obligatorio para pagos en Bolívares.");
            return;
        }
    }

    setIsLoading(true);
    try {
      // Usamos el servicio modularizado saveInscription
      await saveInscription(formData, age);
      alert("✅ Inscripción exitosa.");
      window.location.reload();
    } catch (error) {
        if (error instanceof Error) {
          alert(`❌ Error: ${error.message}`)
        } else {
          alert("❌ Error desconocido al guardar la inscripción.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClassObj = availableClasses.find(c => c.id === formData.classId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-start font-sans">
      <div className="w-full max-w-5xl">
        
        {/* PASO 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade">
            <div className="space-y-4">
              <PersonalDataForm formData={formData} handleChange={handleChange} age={age} isMinor={isMinor} />
              
              {isMinor && (
                 <div className="bg-white p-1 rounded-2xl border border-orange-200 shadow-sm">
                   <RepresentativeForm formData={formData} handleChange={handleChange} />
                 </div>
              )}

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="hasMedical" checked={formData.hasMedical} onChange={handleChange} className="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
                  <span className="text-sm font-bold text-gray-700">¿Posee condición médica?</span>
                </label>
                {formData.hasMedical && (
                  <div className="mt-3 p-4 bg-red-50 rounded-xl border border-red-100 animate-fade">
                    <textarea name="medicalDesc" value={formData.medicalDesc} onChange={handleChange} className="w-full border border-red-200 bg-white rounded-lg p-2.5 text-sm uppercase focus:outline-none focus:border-red-400" placeholder="Describa la condición..."></textarea>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN CONFIGURACIÓN */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-4">
              <h3 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2">
                <MdSettings className="text-xl" /> Horarios Disponibles
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Seleccione una Clase</label>
                    {age !== null && (
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Edad del alumno: {age} años
                        </span>
                    )}
                  </div>

                  <div className="relative">
                      <select 
                        name="classId" 
                        value={formData.classId} 
                        onChange={handleChange} 
                        disabled={loadingClasses || age === null}
                        className={`w-full border rounded-xl p-3 text-sm font-medium outline-none appearance-none transition-colors
                            ${loadingClasses ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50/30 border-blue-200 text-blue-800'}
                        `}
                      >
                        {/* Lógica de opciones del Select */}
                        {age === null ? (
                            <option value="">-- Indique Fecha de Nacimiento Primero --</option>
                        ) : loadingClasses ? (
                            <option value="">Buscando clases compatibles...</option>
                        ) : availableClasses.length === 0 ? (
                            <option value="">-- No hay clases para esta edad --</option>
                        ) : (
                            <option value="">-- Seleccione Horario --</option>
                        )}

                        {availableClasses.map((clase) => {
                          const nombreProfe = clase.expand?.entrenador_id?.nombre || 'Sin entrenador';
                          const apellidoProfe = clase.expand?.entrenador_id?.apellido || '';
                          
                          // Formateo de horarios si vienen expandidos (opcional, depende de tu estructura)
                          // const horariosText = ...
                          
                          return (
                            <option key={clase.id} value={clase.id}>
                              {clase.nombre} | {nombreProfe} {apellidoProfe} | ${clase.costo} | Min: {clase.edadMin} años
                            </option>
                          );
                        })}
                      </select>
                      
                      {/* Indicador de carga absoluto */}
                      {loadingClasses && (
                          <div className="absolute right-3 top-3.5 text-blue-500 animate-spin">
                              <FaSpinner />
                          </div>
                      )}
                  </div>
                  
                  {age === null && (
                      <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                          <MdEventNote /> Debe ingresar la fecha de nacimiento para filtrar las clases.
                      </p>
                  )}
                </div>

                <button 
                  onClick={handleNextStep} 
                  disabled={loadingClasses || availableClasses.length === 0}
                  className={`cursor-pointer w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95
                    ${loadingClasses || availableClasses.length === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-900 hover:bg-black text-white'}
                  `}
                >
                  Siguiente <MdArrowForward className="text-xl" />
                </button>

              </div>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade">
            <button onClick={() => setStep(1)} disabled={isLoading} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-bold disabled:opacity-50">
              <MdArrowBack className="text-lg" /> Corregir Datos
            </button>
            
           <SummaryCard 
              formData={formData}
              age={age}
              isMinor={isMinor}
              selectedClass={selectedClassObj} 
            />
            
            <PaymentForm
              formData={formData} 
              setFormData={setFormData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit} 
              isLoading={isLoading} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InscribirPages;