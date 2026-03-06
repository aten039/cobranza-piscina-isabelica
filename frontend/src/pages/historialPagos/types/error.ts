export class HistorialPagosError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HistorialPagosError';
  }
}

export class FetchPagosError extends HistorialPagosError {
  constructor(message: string = 'No se pudo cargar el historial de pagos. Intente nuevamente.') {
    super(message);
    this.name = 'FetchPagosError';
  }
}

export class FetchPagoDetalleError extends HistorialPagosError {
  constructor(message: string = 'No se pudieron cargar los detalles del pago. Es posible que no exista.') {
    super(message);
    this.name = 'FetchPagoDetalleError';
  }
}

// Agrega esto al final de tu archivo de errores
export class CrearLiquidacionError extends HistorialPagosError {
  constructor(message: string = 'Ocurrió un error al procesar la liquidación. Intente nuevamente.') {
    super(message);
    this.name = 'CrearLiquidacionError';
  }
}