
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
          {
            path: "atletas", element: <AtletasPages />,
            children: [
              { element: <ListAtletas />, index: true },
              { path: "perfil/:id", element: <AtletaPerfil /> },
              { path: "matricular/:id", element: <AtletaMatricular /> },
              { path: "*", element: <Navigate to="/atletas" replace /> }
            ]
          },
          {
            path: "entrenadores", element: <EntrenadoresPages />,
            children: [
              { element: <ListEntrenadores />, index: true },
              { path: "crear", element: <EntrenadoresForm /> },
              { path: "clases", element: <ListClases /> },
              { path: "horarios", element: <ClasesForm /> },
              { path: "perfil/:id", element: <EntrenadorPerfil /> },
              { path: "clases/:id", element: <ClasesDetails /> },
              { path: "*", element: <Navigate to="/entrenadores" replace /> }
            ]
          },
          { path: "inscribir", element: <InscribirPages /> },

        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
])