import { pb } from "@/lib/pb";
import type { Clase } from "@/pages/entrenadores/types";
import { GetClasesError } from "@/pages/entrenadores/types/error";

export const getClasesByEntrenador = async (entrenadorId: string): Promise<Clase[]> => {
  try {
    const records = await pb.collection('clases').getFullList<Clase>({
      filter: `entrenador_id = "${entrenadorId}"`,
      sort: '-created', // Muestra primero las activas
    });
    return records;
  } catch (error) {
    console.error(`Error al obtener clases del entrenador ${entrenadorId}:`, error);
    throw new GetClasesError("No se pudieron cargar las clases asignadas.");
  }
};