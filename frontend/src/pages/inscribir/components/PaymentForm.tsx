import type { IFormData } from '@/pages/inscribir/types';
import React from 'react';
import { MdPayments, MdCheckCircle, MdDateRange } from 'react-icons/md';

interface PaymentProps {
  formData: IFormData;
  setFormData: React.Dispatch<React.SetStateAction<IFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const PaymentForm: React.FC<PaymentProps> = ({ formData, setFormData, handleChange, handleSubmit, isLoading }) => {

  // Lógica de Opciones de Pago
  const paymentOptions = {
    BS: [
      { value: 'pago_movil', label: 'Pago Móvil' },
      { value: 'transferencia', label: 'Transferencia Bancaria' },
      { value: 'efectivo', label: 'Efectivo (Bs)' },
      { value: 'punto', label: 'Punto de Venta' }
    ],
    USD: [
      { value: 'zelle', label: 'Zelle' },
      { value: 'efectivo', label: 'Efectivo ($)' },
      { value: 'binance', label: 'Binance / USDT' },
      { value: 'transferencia_int', label: 'Transferencia Intl.' }
    ]
  };
  
  // Selección dinámica de opciones
  const currentOptions = paymentOptions[formData.currency as keyof typeof paymentOptions] || paymentOptions.BS;

  const handleCurrencyChange = (currency: 'USD' | 'BS') => {
    const defaultMethod = paymentOptions[currency][0].value;
    setFormData(prev => ({ 
      ...prev, 
      currency, 
      paymentMethod: defaultMethod 
      // Opcional: Si cambias de moneda, podrías querer resetear el monto
      // paymentAmount: 0 
    }));
  };

  // Auto-Calcular Cobertura (Mes siguiente)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    setFormData(prev => {
      if (!newDate) return { ...prev, paymentDate: newDate };
      
      const dateObj = new Date(newDate);
      dateObj.setMonth(dateObj.getMonth() + 1);
      const nextMonthStr = dateObj.toISOString().split('T')[0];

      return {
        ...prev,
        paymentDate: newDate,
        coverageDate: nextMonthStr 
      };
    });
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl border border-gray-700">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <MdPayments className="text-green-400 text-2xl" /> Registrar Pago
      </h3>
      
      <div className="space-y-5">
        {/* Toggle Moneda y Select Método */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['USD', 'BS'] as const).map((curr) => (
              <button 
                key={curr} type="button" onClick={() => handleCurrencyChange(curr)}
                className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${formData.currency === curr ? 'bg-white text-gray-900' : 'text-gray-400'}`}
              >
                {curr}
              </button>
            ))}
          </div>
          <select 
            name="paymentMethod" 
            value={formData.paymentMethod} 
            onChange={handleChange} 
            className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm text-white focus:ring-green-500 focus:border-green-500 p-2 outline-none"
          >
            {currentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        
        {/* --- SECCIÓN DE DETALLES DEL PAGO --- */}
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 animate-fade space-y-4">
           
           {/* CAMPO DE MONTO CON VALIDACIÓN CONDICIONAL */}
           <div>
             <label className="text-xs text-gray-400 font-bold mb-1 block">
               Monto a Pagar {formData.currency === 'BS' && <span className="text-red-500">*</span>}
             </label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                 {formData.currency === 'USD' ? '$' : 'Bs'}
               </span>
               <input 
                 type="number" 
                 name="paymentAmount" 
                 value={formData.paymentAmount || ''} 
                 onChange={handleChange} 
                 placeholder="0.00"
                 min="0"
                 step="0.01"
                 // AQUÍ ESTÁ LA CLAVE: Si es BS, el campo es requerido por HTML5
                 required={formData.currency === 'BS'}
                 className={`w-full bg-gray-700 border rounded p-2 pl-8 text-sm text-white focus:outline-none placeholder-gray-500
                   ${formData.currency === 'BS' && (!formData.paymentAmount || formData.paymentAmount <= 0) ? 'border-red-500/50 focus:border-red-500' : 'border-gray-600 focus:border-green-500'}
                 `} 
               />
             </div>
             {formData.currency === 'BS' && (!formData.paymentAmount || formData.paymentAmount <= 0) && (
               <p className="text-[10px] text-red-400 mt-1">* Obligatorio en Bolívares</p>
             )}
           </div>

           {/* Referencia (Solo si no es efectivo) */}
           {!formData.paymentMethod.includes('efectivo') && (
             <div>
               <label className="text-xs text-gray-400 font-bold mb-1 block">Número de Referencia</label>
               <input 
                 type="text" name="paymentRef" value={formData.paymentRef} onChange={handleChange} required={!formData.paymentMethod.includes('efectivo')}
                 placeholder="Ej: 123456" 
                 className="w-full bg-gray-700 border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-green-500" 
               />
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
             {/* Fecha Pago */}
             <div>
               <label className="text-xs text-gray-400 font-bold mb-1 block">Fecha de Pago</label>
               <input 
                 type="date" 
                 name="paymentDate"
                 value={formData.paymentDate}
                 onChange={handleDateChange}
                 className="w-full bg-gray-700 border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-green-500" 
               />
             </div>

             {/* Fecha Cobertura */}
             <div>
               <label className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                 <MdDateRange /> Cobertura Hasta
               </label>
               <input 
                 type="date" 
                 name="coverageDate"
                 value={formData.coverageDate}
                 onChange={handleChange}
                 className="w-full bg-gray-900 border border-green-600/50 rounded p-2 text-sm text-green-400 font-bold focus:outline-none focus:border-green-500" 
               />
             </div>
           </div>
        </div>

        <button onClick={handleSubmit} disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 mt-4 transition-all ${isLoading ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-500 text-white active:scale-95'}`}>
          {isLoading ? <span className="flex items-center gap-2">Guardando...</span> : <><MdCheckCircle className="text-xl" /> Confirmar Inscripción</>}
        </button>
      </div>
    </div>
  );
};