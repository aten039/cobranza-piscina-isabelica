import { pb } from "@/lib/pb";
import type { Clase, Matricula } from "../types";

/**
 * Obtiene las clases activas en las que el atleta NO está matriculado actualmente.
 * @param atletaId El ID del atleta seleccionado.
 */
export const getClasesDisponibles = async (atletaId: string): Promise<Clase[]> => {
  try {
    // 1. Obtener las clases en las que el atleta ya tiene una matrícula activa
    const matriculasActivas = await pb.collection('matriculas').getFullList<Matricula>({
      filter: `atleta_id = "${atletaId}" && deleted = false`,
      fields: 'clase_id', // Optimización: Solo traemos el campo que nos interesa
    });

    const clasesInscritasIds = matriculasActivas.map(m => m.clase_id);

    // 2. Construir el filtro base para las clases
    let filterQuery = 'activo = true';

    // 3. Si tiene clases inscritas, las excluimos del filtro
    if (clasesInscritasIds.length > 0) {
      // PocketBase permite concatenar condiciones. Ej: id != "123" && id != "456"
      const exclusiones = clasesInscritasIds.map(id => `id != "${id}"`).join(' && ');
      filterQuery += ` && (${exclusiones})`;
    }

    // 4. Obtener las clases disponibles aplicando el filtro dinámico
    const records = await pb.collection('clases').getFullList<Clase>({
      filter: filterQuery,
      expand: 'entrenador_id',
      sort: 'nombre',
    });

    return records;
  } catch (error) {
    console.error(`[getClasesDisponibles] Error al obtener clases para el atleta ${atletaId}:`, error);
    // Lanzamos el error tipado personalizado de nuestra capa de dominio
    throw new Error("No se pudieron cargar las clases disponibles.");
  }
};