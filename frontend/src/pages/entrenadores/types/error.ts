



export class EntrenadorError extends Error {

  constructor(message: string = 'Error al crear entrenador') {
    super(message);
    this.name = "createEntrenadorError";
  }
}

export class CreateEntrenadorError extends EntrenadorError {}
export class GetEntrenadorError extends EntrenadorError {}
export class UpdateEntrenadorError extends EntrenadorError {}
export class GetClasesError extends EntrenadorError {}