import { pb } from '@/lib/pb';
import type { PaginatedEntrenadores, GetEntrenadoresParams } from '@/pages/entrenadores/types';
import { GetEntrenadorError } from '@/pages/entrenadores/types/error';

export const getEntrenadores = async ({
  page = 1,
  perPage = 12, // 12 es un buen número para grillas de 1, 2 o 3 columnas (múltiplo común)
  searchTerm = '',
  showInactive = false
}: GetEntrenadoresParams): Promise<PaginatedEntrenadores> => {
  try {
    // Filtro base: Mostrar inactivos (false) o activos (true)
    let filterStr = showInactive ? 'activo = false' : 'activo = true';

    // Si hay término de búsqueda, agregamos la condición con el operador LIKE (~) de PocketBase
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().replace(/"/g, '\\"'); // Prevenir inyección de comillas
      filterStr += ` && (nombre ~ "${term}" || apellido ~ "${term}" || cedula ~ "${term}")`;
    }

    const records = await pb.collection('entrenadores').getList(page, perPage, {
      sort: '-created',
      filter: filterStr,
    });
    
    return records as unknown as PaginatedEntrenadores;

  } catch (error) {
    console.error('Error fetching entrenadores:', error);
    throw new GetEntrenadorError("Error al obtener entrenadores. Verifique su conexión.");
  }
};