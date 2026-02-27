import { useNavigate } from 'react-router-dom';
import { FaSwimmer, FaMoneyBillWave, FaChalkboardTeacher, FaCalendarAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import type { DashboardModuleCard } from '../Types';

export const ComponentsModuleGrid = () => {
    const navigate = useNavigate();

    // Aquí definimos los accesos directos
    const modulos: DashboardModuleCard[] = [
        {
            id: 'atletas',
            titulo: 'Atletas',
            descripcion: 'Gestión y perfiles.',
            ruta: '/atletas',
            icono: FaSwimmer,
            colorFondo: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
            colorIcono: 'text-blue-600'
        },
        {
            id: 'pagos',
            titulo: 'Pagos',
            descripcion: 'Historial y facturas.',
            ruta: '/pagos',
            icono: FaMoneyBillWave,
            colorFondo: 'bg-green-50 hover:bg-green-100 border-green-200',
            colorIcono: 'text-green-600'
        },
        {
            id: 'entrenadores',
            titulo: 'Entrenadores',
            descripcion: 'Nómina y datos.',
            ruta: '/entrenadores',
            icono: FaChalkboardTeacher,
            colorFondo: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
            colorIcono: 'text-purple-600'
        },
        {
            id: 'liquidaciones',
            titulo: 'Liquidaciones',
            descripcion: 'Cálculo de pagos.',
            ruta: '/liquidaciones',
            icono: FaFileInvoiceDollar,
            colorFondo: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
            colorIcono: 'text-orange-600'
        },
        {
            id: 'clases',
            titulo: 'Clases',
            descripcion: 'Horarios y niveles.',
            ruta: '/entrenadores/clases', // ¡Ruta corregida hacia entrenadores/clases!
            icono: FaCalendarAlt,
            colorFondo: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
            colorIcono: 'text-teal-600'
        }
    ];

    return (
        // Contenedor Flex horizontal: con scroll en móviles, y 5 columnas exactas en PC
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
            {modulos.map((modulo) => {
                const Icono = modulo.icono;
                return (
                    <button
                        key={modulo.id}
                        onClick={() => navigate(modulo.ruta)}
                        // Cambiamos a flex-col e items-center para que el icono quede arriba y escale perfecto
                        className={`min-w-[160px] snap-center flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer ${modulo.colorFondo}`}
                    >
                        <div className={`p-4 rounded-2xl bg-white shadow-sm mb-3 ${modulo.colorIcono}`}>
                            <Icono size={28} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-sm lg:text-base">{modulo.titulo}</h3>
                            <p className="text-slate-500 text-xs mt-1 leading-tight">{modulo.descripcion}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};