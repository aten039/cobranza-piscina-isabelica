import type { RecordModel } from "pocketbase";

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

export interface ClaseWithExpand extends Clase {
  expand?: {
    entrenador_id?: {
      nombre: string;
      apellido: string;
    }
  }
}

// --- Tipos para Alumnos (Atletas) ---
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