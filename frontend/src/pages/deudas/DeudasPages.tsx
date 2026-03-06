// src/pages/deuda/pages/DeudasPage.tsx
import { ListDeudas } from "@/pages/deudas/components/ListDeudas";
import React from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";

export const DeudasPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-300">
      {/* Encabezado de la Página */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600">
          <FaFileInvoiceDollar className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Control de Deudas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisa el estado de cuenta, vencimientos y coberturas de los atletas.
          </p>
        </div>
      </div>

      {/* Contenedor del Componente Principal */}
      <div className="w-full">
        <ListDeudas />
      </div>
    </div>
  );
};