
import { pb } from '@/lib/pb';
import type { ClaseWithExpand } from '@/pages/entrenadores/types';
import { GetClasesError } from '@/pages/entrenadores/types/error'; // Tu error personalizado

// Interfaz auxiliar para cuando expandimos la relación con entrenador


export const getClases = async (): Promise<ClaseWithExpand[]> => {
  try {
    // Solicitamos la lista completa ordenando por creación
    // 'expand' es clave aquí: le dice a PB que traiga los datos del ID relacionado
    const records = await pb.collection('clases').getFullList<ClaseWithExpand>({
      sort: '-created',
      filter: 'activo=true', // Solo traemos las clases activas
      expand: 'entrenador_id', 
    });
    
    return records;
  } catch (err) {

    console.error("Error al obtener las clases:", err);
    throw new GetClasesError("No se pudo cargar la información de las clases. " );
  }
};