



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
export class UpdateClasesError extends EntrenadorError {}
export class GetClasesDetailsError extends EntrenadorError {}
export class DeleteClasesError extends EntrenadorError {}
export class UpdateEntrenadorStatusError extends EntrenadorError {}