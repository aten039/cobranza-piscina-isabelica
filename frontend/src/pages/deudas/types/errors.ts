// src/pages/deuda/types/error.ts
export class DeudaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeudaError';
  }
}

export class GetDeudasError extends DeudaError {
  constructor(message: string = "Error al obtener la lista de deudas.") {
    super(message);
    this.name = 'GetDeudasError';
  }
}