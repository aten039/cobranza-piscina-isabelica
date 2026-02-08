import { NavLink } from "react-router-dom";
import { 
  MdDashboard, 
  MdGroups, 
  MdPersonAdd, 
  MdSportsKabaddi, 
  MdPayments, 
  MdPool, 
  MdClose 
} from "react-icons/md";

export default function Menu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const menuItems = [
    { label: 'Inicio', icon: <MdDashboard size={24} />, path: '/' },
    { label: 'Atletas', icon: <MdGroups size={24} />, path: '/atletas' },
    { label: 'Inscribir', icon: <MdPersonAdd size={24} />, path: '/inscribir' },
    { label: 'Entrenadores', icon: <MdSportsKabaddi size={24} />, path: '/entrenadores' },
    { label: 'Pagos', icon: <MdPayments size={24} />, path: '/pagos' },
  ];

  return (
    <>

      <div 
        className={`fixed inset-0 bg-gray-900/50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-40 
          w-72 h-full flex flex-col shrink-0 
          bg-white border-r border-gray-200 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">

                <MdPool size={26} /> 
              </div>
              <h1 className="text-xl font-bold leading-tight text-gray-900">Swim Admin</h1>
            </div>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
              
              <MdClose size={24} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()} // Cierra el menú al hacer click en móvil
                end={item.path === '/'} // 'end' asegura que "/" no se marque siempre activo
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600' // Estilo Activo
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Estilo Inactivo
                  }
                `}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 flex items-center gap-3">
            
            <div>
              <p className="text-sm font-bold text-gray-900">Sistema de gestion de cobranzas</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
