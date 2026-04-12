import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaSpinner, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { getAtletas } from '@/pages/atletas/services/getAtletas';
import type { Atleta } from '@/pages/atletas/types';

const ListAtletas: React.FC = () => {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // NUEVO ESTADO: Pestañas Activos/Inactivos
  const [tabActivo, setTabActivo] = useState<boolean>(true); 

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchAtletas = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAtletas({ 
          page, 
          perPage: 30, // <--- AUMENTADO DE 10 A 30 REGISTROS
          searchTerm, 
          activo: tabActivo // Pasamos el estado de la pestaña
        });
        
        setAtletas(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    // Pequeño debounce manual para la búsqueda
    const timeoutId = setTimeout(() => {
      fetchAtletas();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [page, searchTerm, tabActivo]); // Se vuelve a ejecutar si cambia la pestaña

  // --- MANEJADORES ---
  const handleTabChange = (isActive: boolean) => {
    setTabActivo(isActive);
    setPage(1); // REGLA DE ORO: Al cambiar de filtro, volver a la página 1
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Atletas</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de miembros del complejo</p>
        </div>
        <button 
          onClick={() => navigate('/inscribir')}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-200 cursor-pointer text-sm"
        >
          <FaPlus /> Inscribir Atleta
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Controles de Filtro y Búsqueda */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          
          {/* NUEVO: Pestañas (Tabs) */}
          <div className="flex bg-slate-200/60 p-1 rounded-lg w-full md:w-auto">
            <button
              onClick={() => handleTabChange(true)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                tabActivo ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaUserCheck /> Activos
            </button>
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !tabActivo ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FaUserTimes /> Inactivos
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute top-3 left-3 text-slate-400 z-10" />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // También resetear a la pág 1 al buscar
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-white"
            />
          </div>
        </div>

        {/* Tabla / Lista de Atletas */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-3xl text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : atletas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No se encontraron atletas {tabActivo ? 'activos' : 'inactivos'}.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <th className="p-4">Atleta</th>
                  <th className="p-4">Cédula</th>
                  <th className="p-4 hidden md:table-cell">Teléfono</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {atletas.map((atleta) => (
                  <tr key={atleta.id} className={`hover:bg-slate-50 transition-colors ${!atleta.activo ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 uppercase">{atleta.nombre} {atleta.apellido}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-mono">{atleta.cedula}</td>
                    <td className="p-4 text-sm text-slate-600 hidden md:table-cell font-mono">{atleta.telefono}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        atleta.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {atleta.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/atletas/perfil/${atleta.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        Ver Perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-slate-500">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListAtletas;