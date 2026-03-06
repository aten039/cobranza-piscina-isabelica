
import { pb } from "@/lib/pb";
import type { FiltrosHistorial, PagoHistorial } from "@/pages/historialPagos/types";
import { FetchPagosError } from "@/pages/historialPagos/types/error";
import type { ListResult } from "pocketbase";

export const getHistorialPagos = async ({
  fechaInicio,
  fechaFin,
  claseId,
  profesorId,
  searchTerm,
  page = 1,
  perPage = 15,
  soloPendientes
}: FiltrosHistorial): Promise<ListResult<PagoHistorial>> => {
  try {
    // 1. Tomamos los strings "YYYY-MM-DD" y los forzamos a medianoche en nuestra hora local
    const startDate = new Date(`${fechaInicio}T00:00:00`);
    const endDate = new Date(`${fechaFin}T23:59:59`);

    // 2. Los convertimos al estándar ISO (UTC) que espera PocketBase 
    // Ejemplo: 2026-03-06T04:00:00.000Z
    // Pocketbase maneja mejor las fechas con un espacio en vez de la 'T', así que la reemplazamos
    const startUtc = startDate.toISOString().replace('T', ' ');
    const endUtc = endDate.toISOString().replace('T', ' ');

    // 3. Pasamos las fechas convertidas a la consulta
    const conditions = [`fecha_pago >= "${startUtc}"`, `fecha_pago <= "${endUtc}"`];
    
    // NUEVO: Filtramos solo los que no han sido liquidados
    if (soloPendientes) {
      conditions.push(`liquidacion_id = ""`);
    }

    if (claseId) {
      conditions.push(`matricula_id.clase_id = "${claseId}"`);
    }
    if (claseId) {
      conditions.push(`matricula_id.clase_id = "${claseId}"`);
    }

    if (profesorId) {
      conditions.push(`matricula_id.clase_id.entrenador_id = "${profesorId}"`);
    }

    if (searchTerm) {
      const term = searchTerm.replace(/"/g, '\\"');
      conditions.push(`(matricula_id.atleta_id.nombre ~ "${term}" || matricula_id.atleta_id.apellido ~ "${term}" || matricula_id.atleta_id.cedula ~ "${term}")`);
    }

    const filter = conditions.join(' && ');

    const result = await pb.collection('pagos').getList<PagoHistorial>(page, perPage, {
      filter,
      sort: '-fecha_pago',
      expand: 'matricula_id.atleta_id, matricula_id.clase_id.entrenador_id',
    });

    return result;
  } catch (error) {
    console.error("[Service Error] getHistorialPagos:", error);
    throw new FetchPagosError(" No se pudo cargar el historial de pagos. Intente nuevamente.");
  }
};
