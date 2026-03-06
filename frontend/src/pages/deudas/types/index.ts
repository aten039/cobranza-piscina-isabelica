// src/pages/deuda/types/index.ts

import type { RecordModel } from "pocketbase";

export interface DeudaRecord extends RecordModel {
  id: string;
  clase_id: string;
  clase_nombre: string;
  entrenador_nombre: string;     // <-- NUEVO
  entrenador_apellido: string;   // <-- NUEVO
  matricula_activa: boolean;
  atleta_id: string;
  atleta_nombre: string;
  atleta_apellido: string;
  atleta_cedula: string;
  atleta_telefono: string;
  cobertura_hasta: string | null;
}

export interface PaginatedResult<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}