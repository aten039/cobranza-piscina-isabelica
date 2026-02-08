import { pb } from "@/lib/pb";
import type { Entrenador } from "@/pages/entrenadores/types";
import { UpdateEntrenadorError } from "@/pages/entrenadores/types/error";

export const updateEntrenador = async (id: string, data: Partial<Entrenador>) => {
  try {
    const record = await pb.collection('entrenadores').update<Entrenador>(id, data);
    return record;
  } catch (error) {
    console.error(`Error al actualizar el entrenador con ID ${id}:`, error);
    throw new UpdateEntrenadorError("Error al guardar los cambios del perfil.");
  }
};