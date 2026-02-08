import { Outlet, NavLink } from 'react-router-dom';
import { MdList, MdPersonAdd, MdDateRange } from "react-icons/md";

export default function EntrenadoresPages() {
  
  // Función para las clases dinámicas
  const getButtonClass = ({ isActive }: { isActive: boolean }) => {
    // Clases base: Diseño general, transición y alineación
    const baseClass = "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-300 border w-full sm:w-auto";
    
    // Estado ACTIVO (Azul vibrante)
    const activeClass = "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30 scale-[1.02]";
    
    // Estado INACTIVO (Blanco limpio con hover azul suave)
    const inactiveClass = "bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500 hover:shadow-sm";

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      
      {/* --- ENCABEZADO --- */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Gestión de Entrenadores
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Administra la nómina, clases y horarios.
          </p>
        </div>
      </div>

      {/* --- MENÚ DE NAVEGACIÓN --- */}
      {/* Mobile: Columna (flex-col) | Desktop: Fila (sm:flex-row) */}
      <nav className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
        
        {/* Botón 1: Lista */}
        <NavLink to="/entrenadores" end className={getButtonClass}>
          <MdList size={22} />
          <span>Lista de Entrenadores</span>
        </NavLink>

         <NavLink to="/entrenadores/clases" className={getButtonClass}>
          <MdDateRange size={22} />
          <span>Lista de clases</span>
        </NavLink>

        {/* Botón 2: Crear */}
        <NavLink to="/entrenadores/crear" className={getButtonClass}>
          <MdPersonAdd size={22} />
          <span>Nuevo Ingreso</span>
        </NavLink>

        {/* Botón 3: Horarios */}
        <NavLink to="/entrenadores/horarios" className={getButtonClass}>
          <MdDateRange size={22} />
          <span>nueva Clase</span>
        </NavLink>

      </nav>

      {/* --- CONTENIDO (Formularios / Listas) --- */}
      {/* Agregamos un fondo sutil o animación de entrada si deseas */}
      <div className="animate-fade-in">
        <Outlet />
      </div>

    </div>
  );
}