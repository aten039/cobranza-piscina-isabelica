export class AtletaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtletaError';
  }
}

export class AtletaNotGetError extends AtletaError {}

export class MatriculaServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatriculaServiceError';
  }
}

export class DeleteMatriculaError extends MatriculaServiceError {}
export class RollbackError extends MatriculaServiceError {}