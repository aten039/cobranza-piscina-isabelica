import { useNavigate } from 'react-router-dom';
// Volvemos a 'react-icons/fa' (FontAwesome 5) para mantener los nombres originales de tus iconos
import {
    FaSwimmer,
    FaMoneyBillWave,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaFileInvoiceDollar
} from 'react-icons/fa'; 
import type { DashboardModuleCard } from '@/pages/dashboard/Types';

export const ComponentsModuleGrid = () => {
    const navigate = useNavigate();

    const modulos: DashboardModuleCard[] = [
        { id: 'atletas', titulo: 'Atletas', descripcion: 'Gestión y perfiles.', ruta: '/atletas', icono: FaSwimmer, colorFondo: 'bg-blue-50 hover:bg-blue-100 border-blue-200', colorIcono: 'text-blue-600' },
        { id: 'pagos', titulo: 'Pagos', descripcion: 'Historial y facturas.', ruta: '/recordPagos', icono: FaMoneyBillWave, colorFondo: 'bg-green-50 hover:bg-green-100 border-green-200', colorIcono: 'text-green-600' },
        { id: 'entrenadores', titulo: 'Entrenadores', descripcion: 'Nómina y datos.', ruta: '/entrenadores', icono: FaChalkboardTeacher, colorFondo: 'bg-purple-50 hover:bg-purple-100 border-purple-200', colorIcono: 'text-purple-600' },
        { id: 'deuda', titulo: 'Deuda', descripcion: 'Gestión de morosidad.', ruta: '/deuda', icono: FaFileInvoiceDollar, colorFondo: 'bg-rose-50 hover:bg-rose-100 border-rose-200', colorIcono: 'text-rose-600' },
        { id: 'clases', titulo: 'Clases', descripcion: 'Horarios y niveles.', ruta: '/entrenadores/clases', icono: FaCalendarAlt, colorFondo: 'bg-teal-50 hover:bg-teal-100 border-teal-200', colorIcono: 'text-teal-600' }
    ];

    return (
        <div className="w-full">
            {/* Contenedor Flex Principal */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                {modulos.map((modulo) => {
                    const Icono = modulo.icono;

                    return (
                        <div
                            key={modulo.id}
                            // Control de anchos según la pantalla
                            className="w-[47%] sm:w-[30%] md:w-auto md:flex-1"
                        >
                            <button
                                onClick={() => navigate(modulo.ruta)}
                                // Paddings dinámicos (p-3 en móvil, p-5 en PC)
                                className={`w-full h-full flex flex-col items-center text-center p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer ${modulo.colorFondo}`}
                            >
                                <div className={`p-2 md:p-4 rounded-lg md:rounded-2xl bg-white shadow-sm mb-2 md:mb-3 ${modulo.colorIcono}`}>
                                    {/* Icono dinámico */}
                                    <Icono className="text-xl md:text-2xl" />
                                </div>

                                {/* Título dinámico */}
                                <h3 className="font-black text-slate-800 text-xs md:text-sm lg:text-base leading-tight">
                                    {modulo.titulo}
                                </h3>

                                {/* Descripción dinámica (Se oculta en móviles muy pequeños) */}
                                <p className="hidden sm:block text-slate-500 text-[10px] md:text-xs mt-1 md:mt-1.5 leading-tight">
                                    {modulo.descripcion}
                                </p>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};