
import ProtectedAuth from "@/components/ProtectedAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import AtletasPages from "@/pages/atletas/AtletasPages";
import DashboardPages from "@/pages/dashboard/DashboardPages";
import EntrenadoresForm from "@/pages/entrenadores/components/EntrenadoresForm";
import ListClases from "@/pages/entrenadores/components/ListClases";
import ListEntrenadores from "@/pages/entrenadores/components/ListEntrenadores";
import EntrenadoresPages from "@/pages/entrenadores/EntrenadoresPages";
import InscribirPages from "@/pages/inscribir/InscribirPages";
import LoginPage from "@/pages/login/LoginPage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import EntrenadorPerfil from "@/pages/entrenadores/components/EntrenadorPerfil";
import ClasesForm from "@/pages/entrenadores/components/ClasesForm";
import ClasesDetails from "@/pages/entrenadores/components/ClasesDetails";
import ListAtletas from "@/pages/atletas/components/ListAtletas";
import AtletaPerfil from "@/pages/atletas/components/AtletaPerfil";
import AtletaMatricular from "@/pages/atletas/components/AtletaMatricular";
import PagosPages from "@/pages/pagos/PagosPages";
import FormPayment from "@/pages/pagos/components/FormPayment";
import { ListDeudas } from "@/pages/deudas/components/ListDeudas";
import PagosRecordPages from "@/pages/historialPagos/PagosRecordPages";
import PagosHistory from "@/pages/historialPagos/components/PagosHistory";
import Liquidaciones from "@/pages/historialPagos/components/PagosLiquidaciones";
import PagosDetails from "@/pages/historialPagos/components/PagosDetails";
import LiquidacionesHistory from "@/pages/historialPagos/components/LiquidacionesHistory";
import LiquidacionDetails from "@/pages/historialPagos/components/LiquidacionDetails";

export const router = createBrowserRouter([
  { 
    path: "/login",
    element: <LoginPage />, 
  },
  {

    element: <ProtectedAuth />, 
    path: "/",
    children: [
      {
        path: "/",
        element: <DashboardLayout />, 
        children: [
          { index: true, element: <DashboardPages /> },
          { path: "atletas", element: <AtletasPages />,
            children: [
              {  element: <ListAtletas /> , index:true},
              { path: "perfil/:id", element: <AtletaPerfil /> },
              { path: "matricular/:id", element: <AtletaMatricular /> },
              {path: "*", element: <Navigate to="/atletas" replace />}
            ]
           },
          { path: "pagos", element: <PagosPages />,
            children: [
              { path: "atleta/:id", element: <FormPayment /> },
              {path: "*", element: <Navigate to="/" replace />}
            ]
           },
          { path: "recordPagos", element: <PagosRecordPages />,
            children: [
              {  element: <PagosHistory /> , index:true},
              { path: "details/:id", element: <PagosDetails /> },
              { path: "liquidaciones", element: <Liquidaciones /> },
              { path: "liq/details/:id", element: <LiquidacionDetails /> },
              { path: "liqhistory", element: <LiquidacionesHistory /> },
              {path: "*", element: <Navigate to="/" replace />}
            ]
           },
          { path: "deuda", element: <PagosPages />,
            children: [
              {  element: <ListDeudas /> , index:true},
              {path: "*", element: <Navigate to="/" replace />}
            ]
           },
          { path: "entrenadores", element: <EntrenadoresPages />,
            children: [ 
              {  element: <ListEntrenadores /> , index:true},
              { path: "crear", element: <EntrenadoresForm /> },
              { path: "clases", element: <ListClases /> },
              { path: "horarios", element: <ClasesForm /> },
              { path: "perfil/:id", element: <EntrenadorPerfil /> },
              { path: "clases/:id", element: <ClasesDetails /> },
              {path: "*", element: <Navigate to="/entrenadores" replace />}
            ]
          },
          { path: "inscribir", element: <InscribirPages/> },
        
        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
])