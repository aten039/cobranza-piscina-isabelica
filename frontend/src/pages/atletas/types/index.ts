
export interface Atleta   {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fecha_nacimiento: string; 
    representante_nombre?: string;
    representante_cedula?: string;
    condicion_medica?: string;
  // Campos de PocketBase (opcionales pero útiles)
  created?: string;
  updated?: string;
}