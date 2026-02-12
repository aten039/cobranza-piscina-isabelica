import { pb } from '@/lib/pb';
import type { ClaseFull } from '@/pages/entrenadores/types';
import { UpdateClasesError } from '@/pages/entrenadores/types/error';

export const updateClase = async (id: string, data: Partial<ClaseFull>) => {
  try {
    // Solo actualizamos los campos nativos de la colección 'clases'
    const record = await pb.collection('clases').update<ClaseFull>(id, data);
    return record;
  } catch (error) {
    console.error("Error al actualizar la clase:", error);
    // Usamos el mensaje original de PocketBase si existe, si no, el genérico
    throw new UpdateClasesError("Error al actualizar la clase: " );
  }
};