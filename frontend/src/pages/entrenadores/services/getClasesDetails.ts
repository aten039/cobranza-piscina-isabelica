import { pb } from '@/lib/pb';
import type { ClaseFull, ClaseHorario, Matricula } from '@/pages/entrenadores/types';
import { GetClasesDetailsError } from '@/pages/entrenadores/types/error';

export const getClaseDetails = async (claseId: string) => {
  try {
    // 1. Obtener la Clase y su Entrenador
    const clasePromise = pb.collection('clases').getOne<ClaseFull>(claseId, {
      expand: 'entrenador_id',
    });

    // 2. Obtener los Horarios (Tabla intermedia clase_horario)
    // Filtramos por la clase actual y expandimos el detalle del horario (dia/hora)
    const horariosPromise = pb.collection('clases_horarios').getFullList<ClaseHorario>({
      filter: `clase_id="${claseId}"`,
      expand: 'horario_id',
      sort: 'created' 
    });

    // 3. Obtener Alumnos Matriculados
    // Solo los activos, expandiendo los datos del atleta
    const matriculasPromise = pb.collection('matriculas').getFullList<Matricula>({
      filter: `clase_id="${claseId}" && activo=true`,
      expand: 'atleta_id',
      sort: '-created'
    });

    // Ejecutamos todas las promesas en paralelo
    // Si una falla, el Promise.all lanza el error y cae en el catch
    const [clase, horarios, matriculas] = await Promise.all([
      clasePromise,
      horariosPromise,
      matriculasPromise
    ]);

    return { clase, horarios, matriculas };

  } catch (error) {
    // Console log opcional para depuración en desarrollo
    console.error("Error al obtener clase:", error);

    
    // Lanzamos el error personalizado
    throw new GetClasesDetailsError("Error al obtener los detalles de la clase");
  }
};