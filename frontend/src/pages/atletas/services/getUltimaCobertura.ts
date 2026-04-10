import { pb } from "@/lib/pb";
import type { UltimoPago } from "@/pages/atletas/types";


export const getUltimaCobertura = async (matriculaId: string): Promise<string | null> => {
  try {
    // Buscamos el último pago registrado para esta matrícula, ordenado por cobertura_hasta descendente
    const result = await pb.collection('pagos').getList<UltimoPago>(1, 1, {
      filter: `matricula_id="${matriculaId}" && is_null=false`,
      sort: '-cobertura_hasta',
    });

    if (result.items.length > 0) {
      // Retorna la fecha del último pago (formato YYYY-MM-DD HH:mm:ss.SSSZ)
      return result.items[0].cobertura_hasta; 
    }
    return null; // Si no hay pagos previos
  } catch (error) {
    console.error("Error obteniendo última cobertura:", error);
    throw new Error("No se pudo verificar el último pago registrado.");
  }
};