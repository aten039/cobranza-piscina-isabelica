
import { pb } from "@/lib/pb";
import type { PagoHistorial } from "@/pages/historialPagos/types";
import { FetchPagoDetalleError } from "@/pages/historialPagos/types/error";

export const getPagoById = async (id: string): Promise<PagoHistorial> => {
  try {
    const record = await pb.collection('pagos').getOne<PagoHistorial>(id, {
      expand: 'matricula_id.atleta_id, matricula_id.clase_id.entrenador_id',
    });
    return record;
  } catch (error) {
    console.error(`[Service Error] getPagoById (${id}):`, error);
    throw new FetchPagoDetalleError(" No se pudieron cargar los detalles del pago.");
  }
};