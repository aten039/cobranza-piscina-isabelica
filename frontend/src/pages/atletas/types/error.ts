export class AtletaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtletaError';
  }
}

export class AtletaNotGetError extends AtletaError {}