import { pb } from "@/lib/pb";
import type { Entrenador } from "@/pages/entrenadores/types";
import { GetEntrenadorError } from "@/pages/entrenadores/types/error";


export const getEntrenadorById = async (id: string): Promise<Entrenador> => {
  try {
    const record = await pb.collection('entrenadores').getOne<Entrenador>(id);
    return record;
  } catch (error) {
    console.error(`Error al obtener el entrenador con ID ${id}:`, error);
    // Lanzamos el error personalizado para que la UI muestre el mensaje correcto
    throw new GetEntrenadorError("No se pudo cargar la información del entrenador.");
  }
};