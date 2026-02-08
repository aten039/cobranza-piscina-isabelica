import { getEntrenadores } from '@/pages/entrenadores/services/getEntrenadores';
import type { Entrenador } from '@/pages/entrenadores/types';
import { EntrenadorError } from '@/pages/entrenadores/types/error';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook de navegación

import { 
  FaUserTie, 
  FaIdCard, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaArrowRight 
} from 'react-icons/fa';

const ListEntrenadores: React.FC = () => {
  const navigate = useNavigate(); // 2. Inicializamos el hook
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEntrenadores();
        setEntrenadores(data);
      } catch (err) {
        if (err instanceof EntrenadorError) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado al cargar los entrenadores.');
        } 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Renderizado de Carga
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-blue-600">
        <FaSpinner className="animate-spin text-5xl mb-4" />
        <p className="font-medium animate-pulse">Cargando equipo...</p>
      </div>
    );
  }

  // Renderizado de Error
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded shadow-sm" role="alert">
        <p className="font-bold flex items-center gap-2">Error de conexión</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 border-b-2 border-blue-100 pb-4">
        <h2 className="text-3xl font-bold text-slate-800">
          <span className="text-blue-600">Entrenadores</span> La Isabelica
        </h2>
        <p className="text-slate-500 mt-1">Gestión del personal técnico de la piscina.</p>
      </div>

      {/* Grid de Tarjetas */}
      {entrenadores.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-100 dashed">
          <p className="text-blue-400 font-medium">No hay entrenadores registrados en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entrenadores.map((entrenador) => (
            <div 
              key={entrenador.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm">
                    <FaUserTie className="text-2xl" />
                  </div>
                  <div className="overflow-hidden"> {/* Added overflow hidden for truncation safety */}
                    <h3 className="text-white font-bold text-lg leading-tight truncate">
                      {entrenador.nombre} {entrenador.apellido}
                    </h3>
                    <span className="text-blue-100 text-xs font-light uppercase tracking-wide block">
                      Entrenador
                    </span>
                  </div>
                </div>
              </div>

              {/* Cuerpo de Datos */}
              <div className="p-5 space-y-4">
                
                {/* Cédula */}
                <div className="flex items-start gap-3 group-hover:bg-blue-50/50 p-2 rounded transition-colors -mx-2">
                  <FaIdCard className="text-blue-400 text-xl mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cédula</p>
                    <p className="text-slate-700 font-semibold">{entrenador.cedula}</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start gap-3 group-hover:bg-blue-50/50 p-2 rounded transition-colors -mx-2">
                  <FaPhoneAlt className="text-blue-400 text-lg mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Teléfono</p>
                    <p className="text-slate-700 font-medium font-mono">
                      {entrenador.telefono || 'Sin asignar'}
                    </p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start gap-3 group-hover:bg-blue-50/50 p-2 rounded transition-colors -mx-2">
                  <FaMapMarkerAlt className="text-blue-400 text-lg mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dirección</p>
                    <p className="text-slate-600 text-sm leading-snug line-clamp-2">
                      {entrenador.direccion || 'Dirección no especificada'}
                    </p>
                  </div>
                </div>

              </div>
              
              {/* Footer / Botón de Acción */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group/btn"
                  onClick={() => navigate(`/entrenadores/perfil/${entrenador.id}`)} 
                >
                  {/* Nota: Usualmente querrás pasar el ID en la URL. 
                      Si tu ruta es fija sin ID, usa solo navigate('/entrenadores/perfil') */}
                  Ver Perfil 
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

export default ListEntrenadores;