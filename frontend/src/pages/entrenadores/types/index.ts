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