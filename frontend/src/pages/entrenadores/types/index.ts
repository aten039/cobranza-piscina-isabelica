import type { ListResult, RecordModel } from "pocketbase";

export interface ProfessorData {
  nombre: string;
  apellido: string;
  cedulaType: 'V' | 'E'; // Nuevo campo
  cedula: string;
  phoneCode: string;
  telefono: string;
  direccion: string;
}

export interface Entrenador extends RecordModel {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion?: string; // Es opcional (?) según tu diagrama
}

export interface Clase extends RecordModel {
  id: string;
  nombre: string;
  costo: number;
  entrenador_id: string;
  edadMin:number;
}
// Interfaces locales
export interface HorarioInterno {
  dia: string;
  hora: string;
}

export interface ClaseFormData {
  nombre: string;
  costo: number;
  edadMin: number;
  entrenador_id: string;
  horarios: HorarioInterno[];
}

// --- Tipos para atletas (Atletas) ---
export interface Atleta extends RecordModel {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  // ... otros campos
}

export interface Matricula extends RecordModel {
  id: string;
  atleta_id: string;
  clase_id: string;
  activo: boolean;
  deleted: boolean;
  expand?: {
    atleta_id: Atleta;
  };
}

// --- Tipos para Horarios ---
export interface Horario extends RecordModel {
  dia: string;
  hora: string;
}

export interface ClaseHorario extends RecordModel {
  clase_id: string;
  horario_id: string;
  expand?: {
    horario_id: Horario;
  };
}

// --- Tipo extendido de Clase ---
export interface ClaseFull extends RecordModel {
  nombre: string;
  costo: number;
  edadMin: number;
  entrenador_id: string;
  expand?: {
    entrenador_id: Entrenador;
  };
}

export interface VistaClaseAlumno {
  id: string; // ID de la matrícula
  clase_id: string;
  matricula_activa: boolean;
  atleta_id: string;
  atleta_nombre: string;
  atleta_apellido: string;
  atleta_cedula: string;
  atleta_telefono: string;
  cobertura_hasta: string | null;
}

// Tipo de respuesta paginada nativa de PocketBase
export type PaginatedEntrenadores = ListResult<Entrenador>;

// Interfaz para los parámetros de búsqueda del servicio
export interface GetEntrenadoresParams {
  page?: number;
  perPage?: number;
  searchTerm?: string;
  showInactive?: boolean;
}

export interface ClaseWithExpand extends RecordModel {
  id: string;
  nombre: string;
  costo: number;
  edadMin: number;
  activo: boolean;
  entrenador_id?: string;
  expand?: {
    entrenador_id?: {
      nombre: string;
      apellido: string;
    };
  };
}

// Tipo de respuesta paginada nativa de PocketBase para Clases
export type PaginatedClases = ListResult<ClaseWithExpand>;

// Interfaz para los parámetros del nuevo servicio
export interface GetClasesParams {
  page?: number;
  perPage?: number;
  searchTerm?: string;
}

export interface ClaseFormState extends Omit<Partial<ClaseFull>, 'costo' | 'edadMin'> {
  costo?: number | string;
  edadMin?: number | string;
}