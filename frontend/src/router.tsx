
import ProtectedAuth from "@/components/ProtectedAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import AtletasPages from "@/pages/atletas/AtletasPages";
import LoginPage from "@/pages/login/LoginPage";
import { createBrowserRouter, Navigate } from "react-router-dom";



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
          { index: true, element: <AtletasPages /> },
          { path: "atletas", element: <AtletasPages /> },
          { path: "entrenadores", element: <AtletasPages /> },
        
        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
])