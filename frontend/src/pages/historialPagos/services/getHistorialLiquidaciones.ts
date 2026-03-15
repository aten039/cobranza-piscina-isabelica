
import { pb } from "@/lib/pb";
import type { FiltrosLiquidacion, LiquidacionHistorial } from "../types";

export const getHistorialLiquidaciones = async (
  filtros: FiltrosLiquidacion
): Promise<{ items: LiquidacionHistorial[]; totalPages: number }> => {
  try {
    const { fechaInicio, fechaFin, profesorId, searchTerm, page, perPage } = filtros;
    
    // 1. Tomamos los strings "YYYY-MM-DD" y los forzamos a medianoche en nuestra hora local
    const startDate = new Date(`${fechaInicio}T00:00:00`);
    const endDate = new Date(`${fechaFin}T23:59:59`);

    // 2. Los convertimos al estándar ISO (UTC) que espera PocketBase 
    // y reemplazamos la 'T' por un espacio
    const startUtc = startDate.toISOString().replace('T', ' ');
    const endUtc = endDate.toISOString().replace('T', ' ');

    // 3. Pasamos las fechas convertidas a la consulta usando el formato de arreglo
    const conditions = [`fecha_pago >= "${startUtc}"`, `fecha_pago <= "${endUtc}"`];

    // Filtro por Profesor
    if (profesorId) {
      conditions.push(`entrenador_id = "${profesorId}"`);
    }

    // Filtro de Búsqueda (Referencia o Nombre/Apellido del entrenador)
    if (searchTerm) {
      const term = searchTerm.trim().replace(/"/g, '\\"');
      conditions.push(`(referencia ~ "${term}" || entrenador_id.nombre ~ "${term}" || entrenador_id.apellido ~ "${term}")`);
    }

    // Unimos todas las condiciones
    const filter = conditions.join(' && ');

    const result = await pb.collection("liquidaciones").getList<LiquidacionHistorial>(page, perPage, {
      filter,
      sort: "-fecha_pago", // Orden descendente (más recientes primero)
      expand: "entrenador_id",
    });

    return {
      items: result.items,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error("[Service Error] getHistorialLiquidaciones:", error);
    throw new Error("Ocurrió un error al consultar el historial de liquidaciones de la base de datos.");
  }
};