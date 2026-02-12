import { pb } from '@/lib/pb'; // O tu instancia de pocketbase
import type { Entrenador } from '@/pages/entrenadores/types';
import { UpdateEntrenadorStatusError } from '@/pages/entrenadores/types/error';

export const updateEntrenadorStatus = async (id: string, activo: boolean): Promise<Entrenador> => {
  try {
    // Actualizamos solo el campo 'activo'
    const record = await pb.collection('entrenadores').update<Entrenador>(id, {
      activo: activo
    });
    return record;
  } catch (error) {
    console.error('Error updating entrenador status:', error);
    throw new UpdateEntrenadorStatusError('Error al actualizar el estado del entrenador');
  }
};