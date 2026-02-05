
import Menu from "@/components/Menu";
import { useState } from "react";
import { MdMenu } from "react-icons/md";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex w-full h-screen bg-gray-50">
      
      <Menu 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col w-full">
        
        <header className="lg:hidden bg-white p-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <MdMenu size={24} />
          </button>
          <span className="font-bold text-gray-900">Menú</span>
        </header>

        <main className="p-6 flex-1 overflow-x-hidden">
          <Outlet /> 
        </main>
        
      </div>
    </div>
  );
}
