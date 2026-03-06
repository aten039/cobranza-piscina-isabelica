import { pb } from "@/lib/pb";
import type { ClaseOpcion } from "@/pages/historialPagos/types";

export const getClasesOptions = async (): Promise<ClaseOpcion[]> => {
  try {
    const records = await pb.collection('clases').getFullList({
      sort: 'nombre',
      fields: 'id,nombre',
      filter: 'activo = true' // Solo clases activas y no eliminadas
    });
    return records.map(r => ({ id: r.id, nombre: r.nombre }));
  } catch (error) {
    console.error("[Service Error] getClasesOptions:", error);
    return [];
  }
};