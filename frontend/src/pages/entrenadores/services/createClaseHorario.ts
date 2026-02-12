import { pb } from "@/lib/pb";
import type { ClaseFormData } from "@/pages/entrenadores/types";

export async function createClaseConHorarios(data: ClaseFormData) {
  let createdClaseId: string | null = null;

  try {
    // 1. Creamos la Clase primero para obtener su ID
    const claseRecord = await pb.collection('clases').create({
      nombre: data.nombre,
      costo: data.costo,
      entrenador_id: data.entrenador_id,
      edadMin: data.edadMin,
      activo:true
    });
    
    // Guardamos el ID por si necesitamos borrarlo en el catch
    createdClaseId = claseRecord.id;

    // 2. Preparamos el batch para las relaciones
    const batch = pb.createBatch();

    for (const h of data.horarios) {
      let horarioId = "";
      
      try {
        // Buscamos si el horario existe (esto es un GET, no afecta la DB)
        const existente = await pb.collection('horarios').getFirstListItem(
          `dia="${h.dia}" && hora="${h.hora}"`
        );
        horarioId = existente.id;
      } catch {
        // Si no existe, lo creamos
        const nuevoHorario = await pb.collection('horarios').create({
          dia: h.dia,
          hora: h.hora
        });
        horarioId = nuevoHorario.id;
      }

      // Agregamos la relación clase <-> horario al lote
      batch.collection('clases_horarios').create({
        clase_id: createdClaseId,
        horario_id: horarioId
      });
    }

    // 3. Intentamos enviar todas las relaciones juntas
    await batch.send();

    return claseRecord;

  } catch (error) {
    // --- LÓGICA DE ROLLBACK ---
    if (createdClaseId) {
      console.warn("⚠️ Falló la creación de horarios. Eliminando clase para mantener integridad...");
      await pb.collection('clases').delete(createdClaseId);
    }
    
    console.error("Error en el proceso de creación:", error);
    throw new Error("No se pudo crear la clase ni su cronograma. Intente de nuevo.");
  }
}