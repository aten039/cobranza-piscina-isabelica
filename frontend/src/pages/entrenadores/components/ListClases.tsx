import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetClasesError } from '@/pages/entrenadores/types/error';

import { 
  FaSwimmingPool, 
  FaUserTie, 
  FaMoneyBillWave, 
  FaChild, 
  FaSpinner, 
  FaEdit,
  FaArrowRight
} from 'react-icons/fa';
import type { ClaseWithExpand } from '@/pages/entrenadores/types';
import { getClases } from '@/pages/entrenadores/services/getClases';

const ListClases: React.FC = () => {
  const navigate = useNavigate();
  const [clases, setClases] = useState<ClaseWithExpand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClases();
        setClases(data);
      } catch (err) {
        if (err instanceof GetClasesError) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar las clases.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Renderizado de Carga ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-blue-600">
        <FaSpinner className="animate-spin text-5xl mb-4" />
        <p className="font-medium animate-pulse">Cargando clases...</p>
      </div>
    );
  }

  // --- Renderizado de Error ---
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded shadow-sm" role="alert">
        <p className="font-bold flex items-center gap-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 border-b-2 border-blue-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            <span className="text-blue-600">Clases</span> Disponibles
          </h2>
          <p className="text-slate-500 mt-1">Gestión de oferta académica y horarios.</p>
        </div>
        {/* Aquí podrías poner un botón de "Crear Nueva Clase" si lo necesitas */}
      </div>

      {/* Grid de Tarjetas */}
      {clases.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-100 dashed">
          <FaSwimmingPool className="text-blue-300 text-6xl mx-auto mb-4" />
          <p className="text-blue-400 font-medium">No hay clases registradas en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase) => (
            <div 
              key={clase.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col"
            >
              {/* Header de la Tarjeta */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <FaSwimmingPool className="text-xl" />
                  </div>
                  <h3 className="font-bold text-slate-700 text-lg leading-tight line-clamp-1">
                    {clase.nombre}
                  </h3>
                </div>
              </div>

              {/* Cuerpo de Datos */}
              <div className="p-5 space-y-4 flex-grow">
                
                {/* Entrenador (Usando expand) */}
                <div className="flex items-start gap-3">
                  <FaUserTie className="text-slate-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Entrenador</p>
                    <p className="text-slate-700 font-medium">
                      {clase.expand?.entrenador_id 
                        ? `${clase.expand.entrenador_id.nombre} ${clase.expand.entrenador_id.apellido}`
                        : <span className="text-slate-400 italic">No asignado</span>
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Costo */}
                  <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FaMoneyBillWave className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 uppercase font-bold">Costo</span>
                    </div>
                    <p className="text-emerald-700 font-bold font-mono text-lg">
                      ${clase.costo}
                    </p>
                  </div>

                  {/* Edad Mínima */}
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                     <div className="flex items-center gap-2 mb-1">
                      <FaChild className="text-blue-500" />
                      <span className="text-[10px] text-blue-600 uppercase font-bold">Edad Min.</span>
                    </div>
                    <p className="text-blue-700 font-bold text-lg">
                      {clase.edadMin}+ <span className="text-xs font-normal">años</span>
                    </p>
                  </div>
                </div>

              </div>
              
              {/* Footer / Botón de Acción */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors">
                <span className="text-xs text-slate-400 font-mono">ID: {clase.id.substring(0, 8)}...</span>
                
                <button 
                  className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group/btn"
                  onClick={() => navigate(`/entrenadores/clases/${clase.id}`)} 
                >
                  <FaEdit className="text-xs" />
                  Gestionar
                  <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListClases;