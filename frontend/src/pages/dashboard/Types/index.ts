import type { IconType } from "react-icons";

export interface DashboardModuleCard {
    id: string;
    titulo: string;
    descripcion: string;
    ruta: string;
    icono: IconType;
    colorFondo: string;
    colorIcono: string;
}