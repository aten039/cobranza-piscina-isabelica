
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  FaUserAstronaut, 
  FaIdCard, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaChevronRight,
  FaSearch
} from 'react-icons/fa';
import type { Atleta } from '@/pages/atletas/types';
import { AtletaError } from '@/pages/atletas/types/error';
import { getAtletas } from '@/pages/atletas/services/getAtletas';

const ListAtletas: React.FC = () => {
  const navigate = useNavigate();
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAtletas();
        setAtletas(data);
      } catch (err) {
        alert((err as AtletaError).message || 'Error al cargar atletas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAtletas = atletas.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(filter.toLowerCase()) || 
    a.cedula.includes(filter)
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen text-cyan-600">
      <FaSpinner className="animate-spin text-6xl mb-4" />
      <p className="font-bold tracking-widest uppercase text-sm">Sincronizando Atletas...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">
            Censo de <span className="text-cyan-600">Atletas</span>
          </h2>
          <p className="text-slate-500">Listado oficial de nadadores inscritos.</p>
        </div>
        
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-full bg-white focus:ring-2 focus:ring-cyan-500 outline-none w-full md:w-80 transition-all"
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Atletas */}
      {filteredAtletas.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">No se encontraron atletas que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAtletas.map((atleta) => (
            <div 
              key={atleta.id}
              className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/atletas/detalle/${atleta.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <FaUserAstronaut size={20} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-800 truncate">{atleta.nombre} {atleta.apellido}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <FaIdCard /> {atleta.cedula}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FaPhoneAlt className="text-cyan-500 text-xs" />
                  <span className="font-mono text-xs">{atleta.telefono || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500 italic">
                  <FaMapMarkerAlt className="text-cyan-500 text-xs mt-1 shrink-0" />
                  <span className="text-xs line-clamp-1">{atleta.direccion || 'Sin dirección'}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs font-bold text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>VER MATRÍCULAS</span>
                <FaChevronRight />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListAtletas;