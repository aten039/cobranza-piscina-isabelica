// ARCHIVO: src/pages/historialLiquidaciones/services/getLiquidacionById.ts

import { pb } from "@/lib/pb";
import type { LiquidacionConPagos, LiquidacionHistorial } from "../types";
import type { PagoHistorial } from "@/pages/historialPagos/types";

export const getLiquidacionById = async (id: string): Promise<LiquidacionConPagos> => {
  try {
    // 1. Obtenemos la liquidación y expandimos los datos del profesor
    const liquidacion = await pb.collection("liquidaciones").getOne<LiquidacionHistorial>(id, {
      expand: "entrenador_id",
    });

    // 2. Obtenemos TODOS los pagos asociados a este ID de liquidación
    // Expandimos atleta y clase para poder mostrarlos en la lista de detalles
    const pagosAsociados = await pb.collection("pagos").getFullList<PagoHistorial>({
      filter: `liquidacion_id = "${id}"`,
      sort: "fecha_pago", // Ordenamos los pagos del más antiguo al más reciente
      expand: "matricula_id.atleta_id, matricula_id.clase_id",
    });

    return {
      liquidacion,
      pagosAsociados,
    };
  } catch (error) {
    console.error("[Service Error] getLiquidacionById:", error);
    throw new Error("No se pudo cargar los detalles de la liquidación. Verifique si el registro existe.");
  }
};