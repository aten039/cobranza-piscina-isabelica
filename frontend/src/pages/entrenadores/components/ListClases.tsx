import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { getPaginatedClases } from '@/pages/entrenadores/services/getPaginatedClases';

// Tipos y Errores
import type { ClaseWithExpand } from '@/pages/entrenadores/types';
import { GetClasesError } from '@/pages/entrenadores/types/error';

// Iconos
import { 
  FaSwimmingPool, FaUserTie, FaMoneyBillWave, FaChild, 
  FaSpinner, FaEdit, FaArrowRight, FaSearch, 
  FaChevronLeft, FaChevronRight, FaFilter
} from 'react-icons/fa';

const ListClases: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados de Datos
  const [clases, setClases] = useState<ClaseWithExpand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Paginación y Búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const perPage = 12;

  // Implementación de Debounce (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reiniciar a la primera página tras buscar
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Recargar datos al cambiar la página o la búsqueda (debounced)
  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaginatedClases({
        page,
        perPage,
        searchTerm: debouncedSearch
      });
      setClases(data.items);
      setTotalPages(data.totalPages);
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

  // --- Renderizado de Error ---
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
      {/* Encabezado y Buscador */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b-2 border-blue-100 pb-4 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-bold text-slate-800">
            <span className="text-blue-600">Clases</span> Disponibles
          </h2>
          <p className="text-slate-500 mt-1">Gestión de oferta académica activa.</p>
        </div>

        <div className="w-full md:w-auto">
          {/* Buscador Minimalista */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar clase por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas o Carga */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-blue-600">
          <FaSpinner className="animate-spin text-5xl mb-4" />
          <p className="font-medium animate-pulse">Cargando clases...</p>
        </div>
      ) : clases.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 dashed">
          <FaFilter className="text-slate-300 text-4xl mx-auto mb-3" />
          <p className="text-slate-400 font-medium">
            {searchTerm ? "No se encontraron clases con ese nombre." : "No hay clases registradas en el sistema."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clases.map((clase) => (
              <div 
                key={clase.id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group flex flex-col"
              >
                {/* Header de la Tarjeta */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      <FaSwimmingPool className="text-xl" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg leading-tight line-clamp-1">
                      {clase.nombre}
                    </h3>
                  </div>
                </div>

                {/* Cuerpo de Datos */}
                <div className="p-5 space-y-4 flex-grow">
                  
                  {/* Entrenador */}
                  <div className="flex items-start gap-3">
                    <FaUserTie className="text-slate-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Entrenador</p>
                      <p className="text-slate-700 font-medium line-clamp-1">
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

export default ListClases;