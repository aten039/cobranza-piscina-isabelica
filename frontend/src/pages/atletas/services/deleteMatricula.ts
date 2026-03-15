import { pb } from '@/lib/pb';
import type { Matricula } from '../types';
import { DeleteMatriculaError, RollbackError } from '@/pages/atletas/types/error';

export const deleteMatricula = async (id: string): Promise<boolean> => {
  let matriculaOriginal: Matricula | null = null;
  let matriculaModificada = false;

  try {
    // 1. Obtenemos el estado original de la matrícula para saber a qué atleta pertenece
    // y para poder restaurarla en caso de que algo falle después (Rollback)
    matriculaOriginal = await pb.collection('matriculas').getOne<Matricula>(id);

    // 2. Soft Delete: Marcamos la matrícula como eliminada y la desactivamos
    await pb.collection('matriculas').update(id, {
      deleted: true,
      activo: false,
    });
    matriculaModificada = true;

    // 3. Verificamos si el atleta tiene otras matrículas NO eliminadas (sean activas o inactivas)
    // Excluimos la matrícula actual de la búsqueda por seguridad, aunque ya esté con deleted=true
    const remainingMatriculas = await pb.collection('matriculas').getList(1, 1, {
      filter: `atleta_id = "${matriculaOriginal.atleta_id}" && deleted != true && id != "${id}"`,
    });

    // 4. Si no le quedan más matrículas al atleta, procedemos a desactivarlo
    if (remainingMatriculas.totalItems === 0) {
      await pb.collection('atletas').update(matriculaOriginal.atleta_id, {
        activo: false,
      });
    }

    return true;

  } catch (error) {
    console.error("Error en el proceso de eliminación:", error);

    // 5. SISTEMA DE ROLLBACK (Compensación)
    // Si la matrícula se modificó pero falló la actualización del atleta u otra cosa, la restauramos
    if (matriculaModificada && matriculaOriginal) {
      try {
        console.warn("Iniciando rollback manual de la matrícula...");
        await pb.collection('matriculas').update(id, {
          deleted: matriculaOriginal.deleted ?? false,
          activo: matriculaOriginal.activo ?? false,
        });
        console.log("Rollback completado con éxito.");
      } catch (rollbackError) {
        // En un caso real, esto debería disparar una alerta crítica en Sentry o similar
        console.error("CRÍTICO: Falló el rollback. La base de datos puede estar inconsistente.", rollbackError);
        throw new RollbackError("Fallo crítico: No se pudo eliminar ni revertir el estado anterior.");
      }
    }

    throw new DeleteMatriculaError("No se pudo eliminar la inscripción. Se revirtieron los cambios para mantener la consistencia.");
  }
};