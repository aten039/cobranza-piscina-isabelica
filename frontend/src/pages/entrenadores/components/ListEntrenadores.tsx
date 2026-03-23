import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { getEntrenadores } from '@/pages/entrenadores/services/getEntrenadores';
import { checkActiveClasses } from '@/pages/entrenadores/services/checkActiveClass';
import { updateEntrenadorStatus } from '@/pages/entrenadores/services/updateEntrenadorStatus';

// Tipos y Errores
import type { Entrenador } from '@/pages/entrenadores/types';
import { GetEntrenadorError, UpdateEntrenadorStatusError } from '@/pages/entrenadores/types/error';

// Iconos
import { 
  FaUserTie, FaIdCard, FaPhoneAlt, 
  FaSpinner, FaArrowRight, FaFilter, FaPowerOff, FaCheckCircle, FaTimesCircle, FaSearch, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';

const ListEntrenadores: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados de Datos
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Paginación y Búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const perPage = 12; // Cantidad visible de profesores

  // Estados de UI
  const [showInactive, setShowInactive] = useState<boolean>(false); 
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Implementación de Debounce para el buscador (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Regresar a la página 1 al hacer una nueva búsqueda
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Recargar datos cuando cambia la página, el tab de activo/inactivo o el término de búsqueda
  useEffect(() => {
    fetchData();
  }, [page, showInactive, debouncedSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEntrenadores({
        page,
        perPage,
        searchTerm: debouncedSearch,
        showInactive
      }); 
      setEntrenadores(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err instanceof GetEntrenadorError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al cargar los entrenadores.');
      } 
    } finally {
      setLoading(false);
    }
  };

  // Cambio de Tab (Activos/Inactivos)
  const handleTabChange = (inactive: boolean) => {
    if (showInactive === inactive) return;
    setShowInactive(inactive);
    setPage(1); // Reset de paginación al cambiar de pestaña
  };

  const handleToggleStatus = async (entrenador: Entrenador) => {
    if (entrenador.activo) {
        setUpdatingId(entrenador.id);
        try {
          // Utiliza la tabla clases_horario (manejado internamente en tu servicio)
          const tieneClases = await checkActiveClasses(entrenador.id);
          
          if (tieneClases) {
              setUpdatingId(null);
              alert("⛔ NO SE PUEDE DESACTIVAR\n\nEste entrenador tiene clases activas asignadas. No puede desactivarlo hasta que elimine sus clases o se las asigne a otro profesor.");
              return;
          }
        } catch (checkErr) {
           console.error("Error al verificar clases:", checkErr);
           alert("Error al verificar las clases del entrenador. Intente nuevamente.");
           setUpdatingId(null);
           return;
        }
    }

    const accion = entrenador.activo ? 'desactivar' : 'activar';
    
    if (!window.confirm(`¿Confirmas que deseas ${accion} a ${entrenador.nombre}?`)) {
      setUpdatingId(null);
      return;
    }

    try {
      setUpdatingId(entrenador.id);
      const nuevoEstado = !entrenador.activo;
      
      await updateEntrenadorStatus(entrenador.id, nuevoEstado);

      // Optimistic Update: Removemos de la vista actual porque su estado cambió de tab
      setEntrenadores(prev => prev.filter(e => e.id !== entrenador.id));

      // Si nos quedamos sin entrenadores en esta página, forzamos refetch para acomodar paginación
      if (entrenadores.length === 1) {
        fetchData();
      }

    } catch (err) {
      console.error(err);
      if (err instanceof UpdateEntrenadorStatusError) {
        alert(`Error: ${err.message}`);
      } else {
        alert('Ocurrió un error inesperado al actualizar el estado del entrenador.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded shadow-sm" role="alert">
        <p className="font-bold flex items-center gap-2">Error de conexión</p>
        <p>{error}</p>
        <button onClick={fetchData} className="mt-2 text-sm font-semibold underline hover:text-red-900">
            Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado y Filtros */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b-2 border-blue-100 pb-4 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-bold text-slate-800">
            <span className="text-blue-600">Entrenadores</span> La Isabelica
          </h2>
          <p className="text-slate-500 mt-1">Gestión del personal técnico.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Buscador Minimalista */}
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, cédula..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Botones de Filtro */}
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => handleTabChange(false)}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${
                !showInactive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaCheckCircle /> Activos
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all ${
                showInactive ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaTimesCircle /> Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Manejo de estado de carga vs Grid de Tarjetas */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-blue-600">
          <FaSpinner className="animate-spin text-5xl mb-4" />
          <p className="font-medium animate-pulse">Cargando equipo...</p>
        </div>
      ) : entrenadores.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 dashed">
          <FaFilter className="text-slate-300 text-4xl mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No se encontraron entrenadores.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entrenadores.map((entrenador) => (
              <div 
                key={entrenador.id} 
                className={` 
                  rounded-xl shadow-sm border overflow-hidden transition-all duration-300
                  ${entrenador.activo 
                    ? 'bg-white border-slate-100 hover:shadow-xl' 
                    : 'bg-slate-50 border-slate-200 opacity-90 grayscale-[0.8] hover:grayscale-0'}
                `}
              >
                {/* Header */}
                <div className={`p-4 flex items-center justify-between ${
                  entrenador.activo ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-slate-500'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full text-white backdrop-blur-sm">
                      <FaUserTie className="text-2xl" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-white font-bold text-lg leading-tight truncate">
                        {entrenador.nombre} {entrenador.apellido}
                      </h3>
                      <span className="text-white/80 text-xs font-light uppercase tracking-wide block">
                        {entrenador.activo ? 'Disponible' : 'No Disponible'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Datos */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3 p-2 -mx-2">
                    <FaIdCard className="text-blue-400 text-xl mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cédula</p>
                      <p className="text-slate-700 font-semibold">{entrenador.cedula}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 -mx-2">
                    <FaPhoneAlt className="text-blue-400 text-lg mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Teléfono</p>
                      <p className="text-slate-700 font-medium font-mono">{entrenador.telefono || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Footer Acciones */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(entrenador); }}
                    disabled={updatingId === entrenador.id}
                    className={`
                      cursor-pointer flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all
                      ${entrenador.activo 
                        ? 'text-red-500 border-red-200 hover:bg-red-50' 
                        : 'text-green-600 border-green-200 hover:bg-green-50'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {updatingId === entrenador.id ? <FaSpinner className="animate-spin" /> : <FaPowerOff />}
                    {entrenador.activo ? 'Desactivar' : 'Activar'}
                  </button>

                  <button 
                    className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group/btn"
                    onClick={() => navigate(`/entrenadores/perfil/${entrenador.id}`)} 
                  >
                    Ver Perfil <FaArrowRight className="cursor-pointer text-xs group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <FaChevronLeft />
              </button>
              
              <span className="text-sm font-medium text-slate-600">
                Página <span className="font-bold text-blue-600">{page}</span> de {totalPages}
              </span>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListEntrenadores;