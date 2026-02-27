// src/pages/atletas/services/toggleAtletaStatus.ts
import { pb } from '@/lib/pb';
import type { Atleta, Matricula } from '../types';

export const toggleAtletaStatus = async (atleta: Atleta): Promise<Atleta> => {
  // Arreglo temporal para llevar el registro de lo que hemos modificado con éxito
  const matriculasModificadas: Matricula[] = [];

  try {
    // 1. BUSCAR MATRÍCULAS AFECTADAS
    // Buscamos todas las matrículas del atleta que aún no estén eliminadas lógicamente
    const matriculasAfectadas = await pb.collection('matriculas').getFullList<Matricula>({
      filter: `atleta_id = "${atleta.id}" && deleted = false`
    });

    // 2. SOFT DELETE DE MATRÍCULAS (Se ejecuta primero, según tu requerimiento)
    if (matriculasAfectadas.length > 0) {
      for (const matriculaOriginal of matriculasAfectadas) {
        // Las marcamos como eliminadas e inactivas
        await pb.collection('matriculas').update(matriculaOriginal.id, { 
          activo: false, 
          deleted: true 
        });
        
        // Guardamos la matrícula ORIGINAL en nuestro historial de éxito
        // para saber exactamente cómo estaba antes del cambio
        matriculasModificadas.push(matriculaOriginal);
      }
    }

    // 3. DESACTIVAR AL ATLETA (Se ejecuta de último)
    // Si este paso falla, se disparará el Catch y protegeremos a las matrículas
    const updatedAtleta = await pb.collection('atletas').update<Atleta>(atleta.id, {
      activo: false
    });

    return updatedAtleta;

  } catch (error) {
    console.warn("Fallo durante la desactivación. Iniciando rollback manual...");

    // 4. ROLLBACK DE MATRÍCULAS
    // Si ocurrió un error (en las matrículas o en el atleta), revertimos los cambios
    // utilizando el estado original que guardamos en nuestro arreglo temporal
    if (matriculasModificadas.length > 0) {
      for (const mOriginal of matriculasModificadas) {
        await pb.collection('matriculas').update(mOriginal.id, {
          activo: mOriginal.activo,   // Restauramos a true o false según estaba antes
          deleted: mOriginal.deleted  // Restauramos a false
        }).catch(err => {
           // Si el rollback falla (ej. se cayó el internet del todo), lo logueamos 
           // para auditoría, pero no rompemos el hilo principal del rollback.
           console.error(`Error CRÍTICO de Rollback en matrícula ${mOriginal.id}:`, err);
        });
      }
    }

    console.error("Error en la transacción Desactivar Atleta:", error);
    // Lanzamos un error claro para el Frontend
    throw new Error("No se pudo completar la desactivación. Se han revertido los cambios en las clases por seguridad. Verifique su conexión.");
  }
};