import { pb } from '@/lib/pb';
import type { PaginatedClases, GetClasesParams } from '@/pages/entrenadores/types';
import { GetClasesError } from '@/pages/entrenadores/types/error';

export const getPaginatedClases = async ({
  page = 1,
  perPage = 12,
  searchTerm = ''
}: GetClasesParams): Promise<PaginatedClases> => {
  try {
    // REGLA ESTRICTA: Solo traemos las clases que no están eliminadas lógicamente
    let filterStr = 'activo = true';

    // Búsqueda por nombre de la clase
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().replace(/"/g, '\\"');
      filterStr += ` && (nombre ~ "${term}")`;
    }

    const records = await pb.collection('clases').getList<PaginatedClases["items"][number]>(page, perPage, {
      sort: '-created',
      filter: filterStr,
      expand: 'entrenador_id'
    });
    
    return records as unknown as PaginatedClases;

  } catch (error) {
    console.error('Error fetching paginated clases:', error);
    throw new GetClasesError("Error al obtener las clases. Verifique su conexión.");
  }
};