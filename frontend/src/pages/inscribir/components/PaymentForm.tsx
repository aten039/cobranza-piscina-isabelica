import type { IFormData } from '@/pages/inscribir/types';
import React, { useEffect } from 'react';
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
  
  const currentOptions = paymentOptions[formData.currency as keyof typeof paymentOptions] || paymentOptions.BS;

  // --- EFECTO DE CÁLCULO DE FECHA MEJORADO ---
  useEffect(() => {
    if (formData.paymentDate) {
      // 1. Desglosamos la fecha manualmente para evitar problemas de zona horaria (UTC vs Local)
      const [yearStr, monthStr, dayStr] = formData.paymentDate.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr); // 1 - 12
      const day = parseInt(dayStr);

      // 2. Calculamos el mes siguiente
      let nextMonth = month + 1;
      let nextYear = year;

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = year + 1;
      }

      // 3. Ajuste de días (La lógica clave)
      // Obtenemos el último día del mes destino (ej: Feb = 28 o 29)
      // new Date(año, mes, 0) devuelve el último día del mes anterior a "mes".
      // Como nextMonth es 1-based, usarlo tal cual como índice nos da el último día de ESE mes.
      const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate();

      // Si el día original (ej: 31) es mayor que los días del mes siguiente (ej: 28),
      // nos quedamos con el último día disponible (28).
      // Si no, mantenemos el mismo día (ej: 15).
      const finalDay = Math.min(day, daysInNextMonth);

      // 4. Formateamos a YYYY-MM-DD con ceros a la izquierda
      const mm = String(nextMonth).padStart(2, '0');
      const dd = String(finalDay).padStart(2, '0');
      const nextMonthStr = `${nextYear}-${mm}-${dd}`;

      // 5. Actualizamos solo si es diferente para evitar bucles
      if (formData.coverageDate !== nextMonthStr) {
          setFormData(prev => ({ ...prev, coverageDate: nextMonthStr }));
      }
    }
  }, [formData.paymentDate, setFormData]); 


  const handleCurrencyChange = (currency: 'USD' | 'BS') => {
    const defaultMethod = paymentOptions[currency][0].value;
    setFormData(prev => ({ 
      ...prev, 
      currency, 
      paymentMethod: defaultMethod 
    }));
  };

  const handlePaymentDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e); 
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
        
        <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 animate-fade space-y-4">
           
           {/* Monto */}
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

           {/* Referencia */}
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
                 onChange={handlePaymentDateChange}
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