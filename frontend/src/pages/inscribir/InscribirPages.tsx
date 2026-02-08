import { PaymentForm } from '@/pages/inscribir/components/PaymentForm';
import { PersonalDataForm } from '@/pages/inscribir/components/PersonalDataForm';
import { RepresentativeForm } from '@/pages/inscribir/components/RepresentativeForm';
import { SummaryCard } from '@/pages/inscribir/components/SummaryCard';
import { getClases, saveInscription } from '@/pages/inscribir/services/inscribir';
import type { IClass, IFormData } from '@/pages/inscribir/types';
import React, { useState, useEffect } from 'react';
import { MdSettings, MdArrowForward, MdArrowBack } from 'react-icons/md';

const InscribirPages: React.FC = () => {
  // --- Estados ---
  const [step, setStep] = useState<number>(1);
  const [age, setAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    paymentMethod: 'zelle', // Ajustar según moneda por defecto
    paymentRef: '', paymentDate:'',
    coverageDate: '', paymentAmount: 0,
  });

  const isMinor = age !== null && age < 18;

  // --- Cargar Clases ---
  useEffect(() => {
    const loadClasses = async () => {
      const clases = await getClases();
      setAvailableClasses(clases);
    };
    loadClasses();
  }, []);

  // --- Calcular Edad ---
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
      if (calculatedAge < 18) {
        setFormData(prev => ({ ...prev, phoneNum: '' }));
      }
    } else {
      setAge(null);
    }
  }, [formData.dob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      // Si es paymentAmount, nos aseguramos que se guarde como número
      [name]: type === 'checkbox' ? checked : (name === 'paymentAmount' ? parseFloat(value) : value)
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
    
    // --- NUEVA VALIDACIÓN DE MONEDA ---
    if (formData.currency === 'BS') {
        if (!formData.paymentAmount || formData.paymentAmount <= 0) {
            alert("⚠️ Error: El MONTO es obligatorio para pagos en Bolívares.");
            return; // Detenemos el envío
        }
    }
    // ----------------------------------

    setIsLoading(true);
    try {
      // Como ya actualizaste PocketBase, formData.currency y formData.paymentAmount se guardarán
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seleccione una Clase</label>
                  <select 
                    name="classId" 
                    value={formData.classId} 
                    onChange={handleChange} 
                    className="w-full border border-blue-200 bg-blue-50/30 rounded-xl p-3 text-sm font-medium outline-none text-blue-800"
                  >
                    <option value="">-- Seleccione Horario --</option>
                    {availableClasses.map((clase) => {
                      const nombreProfe = clase.expand?.entrenador_id?.nombre || 'Sin entrenador';
                      const apellidoProfe = clase.expand?.entrenador_id?.apellido || '';
                      return (
                        <option key={clase.id} value={clase.id}>
                          {clase.nombre} | {nombreProfe} {apellidoProfe} | ${clase.costo}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button 
                  onClick={handleNextStep} 
                  className="cursor-pointer w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-transform active:scale-95"
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