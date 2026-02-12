import { pb } from '@/lib/pb';

export interface SimpleHorario {
  dia: string;
  hora: string;
}

export const syncHorarios = async (claseId: string, nuevosHorarios: SimpleHorario[]) => {
  try {
    // 1. Obtener relaciones existentes para esta clase
    const relacionesViejas = await pb.collection('clases_horarios').getFullList({
        filter: `clase_id="${claseId}"`
    });

    // 2. Borrar todas las relaciones viejas (Limpieza)
    // Usamos Promise.all para hacerlo en paralelo
    const deletePromises = relacionesViejas.map(rel => 
        pb.collection('clases_horarios').delete(rel.id)
    );
    await Promise.all(deletePromises);

    // 3. Crear las nuevas relaciones
    for (const h of nuevosHorarios) {
        // A. Buscar si el horario maestro (ej: LUNES 08:00) ya existe en la tabla 'horarios'
        // Esto evita duplicar "LUNES 08:00" mil veces en la tabla maestra
        let horarioRecord;
        try {
            horarioRecord = await pb.collection('horarios').getFirstListItem(
                `dia="${h.dia}" && hora="${h.hora}"`
            );
        } catch ( e) {

            horarioRecord = await pb.collection('horarios').create({ 
                dia: h.dia, 
                hora: h.hora 
            });
        }

        // C. Crear la relación en la tabla intermedia
        await pb.collection('clases_horarios').create({
            clase_id: claseId,
            horario_id: horarioRecord.id
        });
    }

    return true;
  } catch (error) {
    console.error("Error sincronizando horarios:", error);
    throw new Error("Error al actualizar los horarios de la clase");
  }
};