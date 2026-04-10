import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUsers, FaClipboardList, FaCircleExclamation,
    FaClock, FaChalkboardUser
} from 'react-icons/fa6';
import type { EstadisticasDashboard, ThemeColor } from '../Types'; 
import { obtenerEstadisticasDashboard } from '@/pages/dashboard/Services/dashboardEstadisticas';

export const DashboardStats = () => {
    const navigate = useNavigate();
    
    // Estados tipados estrictamente
    const [stats, setStats] = useState<EstadisticasDashboard | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const cargarStats = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);
                
                const datosReales = await obtenerEstadisticasDashboard();
                
                if (datosReales) {
                    setStats(datosReales);
                } else {
                    setErrorMsg("No se pudieron cargar los datos desde la vista SQL.");
                }
            } catch (error) {
                console.error("Error al cargar estadísticas en UI:", error);
                setErrorMsg("Ocurrió un error inesperado al conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };
        cargarStats();
    }, []);

    // 1. ESTADO DE CARGA
    if (loading) {
        return (
            <div className="w-full mt-6 mb-6 px-2 text-slate-500 animate-pulse font-medium">
                Cargando resumen operativo de la academia...
            </div>
        );
    }

    // 2. ESTADO DE ERROR (Si no hay stats, ahora te dirá por qué)
    if (!stats) {
        return (
            <div className="w-full mt-6 mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold shadow-sm flex items-center gap-3">
                <FaCircleExclamation className="text-xl" />
                <span>⚠️ {errorMsg || "Error al conectar con las métricas."} Por favor, verifica la vista en PocketBase.</span>
            </div>
        );
    }

    // 3. RENDERIZADO NORMAL (Array de métricas optimizado)
    const estadisticas = [
        { id: 'deudores', titulo: 'Deudores Activos', valor: stats.deudoresActivos.toString(), tendencia: 'Urgente', tendenciaPositiva: false, icono: FaCircleExclamation, color: 'rose', ruta: '/deuda' },
        { id: 'por-vencer', titulo: 'Por Vencer', valor: stats.porVencer.toString(), tendencia: 'Aviso', tendenciaPositiva: true, icono: FaClock, color: 'amber', ruta: '/deuda' },
        { id: 'atletas', titulo: 'atletas Activos', valor: stats.totalAtletas.toString(), tendencia: 'Actuales', tendenciaPositiva: true, icono: FaUsers, color: 'blue', ruta: '/atletas' },
        { id: 'matriculas', titulo: 'Matrículas Totales', valor: stats.totalMatriculas.toString(), tendencia: 'Activas', tendenciaPositiva: true, icono: FaClipboardList, color: 'teal', ruta: '/atletas' },
        { id: 'entrenadores', titulo: 'Entrenadores', valor: stats.totalEntrenadores.toString(), tendencia: 'Plantilla', tendenciaPositiva: true, icono: FaChalkboardUser, color: 'purple', ruta: '/entrenadores' }
    ];

    // Diccionario de colores SIN 'any' (Usando ThemeColor)
    const themeColors: Record<string, ThemeColor> = {
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', glow: 'from-emerald-400/20' },
        rose: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', glow: 'from-rose-400/20' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', glow: 'from-amber-400/20' },
        blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', glow: 'from-blue-400/20' },
        teal: { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', glow: 'from-teal-400/20' },
        indigo: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', glow: 'from-indigo-400/20' },
        purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', glow: 'from-purple-400/20' },
    };

    return (
        <div className="w-full mt-6 mb-6">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-2 h-6 lg:h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Resumen Operativo</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4 lg:gap-5 xl:gap-6">
                {estadisticas.map((stat) => {
                    const Icono = stat.icono;
                    const colors = themeColors[stat.color];

                    return (
                        <div
                            key={stat.id}
                            onClick={() => navigate(stat.ruta)}
                            className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.833rem)] xl:w-[calc(25%-1.125rem)] relative bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
                        >
                            <div className={`absolute -right-8 -top-8 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br ${colors.glow} to-transparent rounded-full blur-2xl lg:blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                            <div className="relative z-10 flex justify-between items-start mb-4 lg:mb-6">
                                <div className={`p-2.5 lg:p-3.5 rounded-xl lg:rounded-2xl ${colors.bg} ${colors.text} ${colors.border} border shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <Icono className="text-lg lg:text-2xl" />
                                </div>

                                <span className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black border backdrop-blur-sm shadow-sm whitespace-nowrap ${stat.tendenciaPositiva ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100' : 'bg-rose-50/80 text-rose-700 border-rose-100'}`}>
                                    {stat.tendencia}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-0.5 lg:mb-1 group-hover:text-slate-900 transition-colors">
                                    {stat.valor}
                                </h3>
                                <p className="text-xs lg:text-sm font-bold text-slate-400 line-clamp-1">{stat.titulo}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};