import { pb } from "@/lib/pb";
import type { ProfesorOpcion } from "@/pages/historialPagos/types";

export const getProfesoresOptions = async (): Promise<ProfesorOpcion[]> => {
  try {
    const records = await pb.collection('entrenadores').getFullList({
      sort: 'nombre',
      fields: 'id,nombre,apellido',
      filter : 'activo = true' // Solo entrenadores activos y no eliminados
    });
    return records.map(r => ({ id: r.id, nombre: r.nombre, apellido: r.apellido }));
  } catch (error) {
    console.error("[Service Error] getProfesoresOptions:", error);
    return [];
  }
};