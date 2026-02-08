
export class FormValidError extends Error {

  constructor(message: string = 'Error validación de formulario') {
    super(message);
    this.name = "FormValidError";
  }
}