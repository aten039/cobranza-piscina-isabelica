
import { pb } from "@/lib/pb";
import type { DeudaRecord, PaginatedResult } from "@/pages/deudas/types";
import { GetDeudasError } from "@/pages/deudas/types/errors";

/**
 * Obtiene la lista de deudas paginada desde la vista de PocketBase.
 * Asegúrate de que la colección de vista se llame 'vista_deudas'.
 */
export const obtenerDeudasPaginadas = async (
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResult<DeudaRecord>> => {
  try {
    // Ordenamos por cobertura_hasta ascendente. Los vencidos salen de primeros.
    const result = await pb.collection("vista_clase_alumnos").getList<DeudaRecord>(page, perPage, {
      sort: "+cobertura_hasta", 
      filter: "matricula_activa = true"
    });

    return {
      page: result.page,
      perPage: result.perPage,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      items: result.items,
    };
  } catch (error) {
    console.error("Error en obtenerDeudasPaginadas:", error);
    throw new GetDeudasError("No se pudo cargar la información de las deudas en este momento.");
  }
};