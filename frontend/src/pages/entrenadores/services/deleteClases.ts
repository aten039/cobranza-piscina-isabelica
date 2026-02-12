import { pb } from '@/lib/pb';
import { DeleteClasesError } from '@/pages/entrenadores/types/error';

export const deleteClase = async (id: string) => {
  try {
    // PASO 1: Desactivar las matrículas asociadas (Soft Delete en Cascada)
    // Buscamos todas las matrículas que pertenezcan a esta clase y estén activas
    const matriculasActivas = await pb.collection('matriculas').getFullList({
        filter: `clase_id="${id}" && activo=true`
    });

    // Preparamos las promesas para actualizar cada matrícula a false
    const desactivarMatriculasPromises = matriculasActivas.map(m => 
        pb.collection('matriculas').update(m.id, { activo: false })
    );
    
    // Ejecutamos la actualización de matrículas en paralelo
    await Promise.all(desactivarMatriculasPromises);


    // PASO 2: Desactivar la Clase (Soft Delete Principal)
    // En lugar de .delete(), usamos .update()
    await pb.collection('clases').update(id, { 
        activo: false 
    });
    
    return true;

  } catch (error) {
    console.error("Error al desactivar la clase:", error);
    console.error("Error al desactivar las matrículas asociadas:", error);
    throw new DeleteClasesError("Error al eliminar la clase. Por favor, inténtalo de nuevo.");
  }
};