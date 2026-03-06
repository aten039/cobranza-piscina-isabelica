import type { RecordModel } from "pocketbase";

// ... (resto de tus tipos)

export interface AtletaInfo extends RecordModel {
  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nacimiento: string; // Necesario para calcular edad
  // Ajusta estos campos según cómo se llamen en tu tabla "atletas" o "representantes"
  nombre_representante?: string;
  cedula_representante?: string;
  telefono_representante?: string; 
}

// ... (resto de tus tipos)
export interface EntrenadorInfo extends RecordModel {
  nombre: string;
  apellido: string;
}

export interface ClaseInfo extends RecordModel {
  nombre: string;
  entrenador_id: string;
  expand?: {
    entrenador_id?: EntrenadorInfo;
  };
}

export interface MatriculaExpandida extends RecordModel {
  atleta_id: string;
  clase_id: string;
  expand?: {
    atleta_id?: AtletaInfo;
    clase_id?: ClaseInfo;
  };
}

export interface PagoHistorial extends RecordModel {
  id: string;
  matricula_id: string;
  monto: number;
  referencia: string;
  fecha_pago: string;
  type: 'USD' | 'BS'; // Moneda del pago
  metodo: string;     // Método de pago (zelle, pago_movil, efectivo, etc.)
  liquidacion_id?: string;
  expand?: {
    matricula_id?: MatriculaExpandida;
  };
}

export interface FiltrosHistorial {
  fechaInicio: string;
  fechaFin: string;
  claseId: string;
  profesorId: string;
  searchTerm: string;
  page: number;
  perPage: number;
  soloPendientes?: boolean; 
}

export interface ClaseOpcion {
  id: string;
  nombre: string;
}

export interface ProfesorOpcion {
  id: string;
  nombre: string;
  apellido: string;
}

export interface PagoHistorial extends RecordModel {
  id: string;
  matricula_id: string;
  monto: number;
  referencia: string;
  fecha_pago: string;
  cobertura_desde: string; // Fecha de inicio del mes pagado
  cobertura_hasta: string; // Fecha de fin del mes pagado
  type: 'USD' | 'BS'; 
  metodo: string;     
  liquidacion_id?: string; // Si está vacío, no se ha liquidado
  expand?: {
    matricula_id?: MatriculaExpandida;
  };
}

export interface CreateLiquidacionDTO {
  entrenador_id: string;
  monto: number;
  referencia: string;
}