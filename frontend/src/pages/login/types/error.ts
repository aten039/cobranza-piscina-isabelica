
export class AuthError extends Error {

  constructor(message: string = 'Error de autenticación') {
    super(message);
    this.name = "AuthError";
  }
}