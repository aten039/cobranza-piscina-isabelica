// Importamos respetando las mayúsculas que definiste
import { ComponentsModuleGrid } from "./Components/ComponentsModuleGrid";

const DashboardPages = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-titulo font-black text-slate-800 text-4xl uppercase tracking-tight">
            Centro de Control
          </h1>
          <p className="text-slate-500 text-lg mt-1">
            Bienvenido al Complejo de Piscinas La Isabelica 🏊‍♂️
          </p>
        </div>
        {/* Fecha actual automática */}
        <div className="text-slate-400 font-mono text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Nuestros Accesos Directos Interactivos usando tu nuevo componente */}
      <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
          ⚡ Accesos Rápidos
        </h2>
        <ComponentsModuleGrid />
      </div>

      {/* --- ZONA DE PRÓXIMAS FUNCIONALIDADES --- */}
      <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center">
        <p className="text-slate-500 font-medium">
          (Espacio reservado para el Panel de Deudores y Estadísticas)
        </p>
      </div>
    </div>
  );
}; export default DashboardPages;