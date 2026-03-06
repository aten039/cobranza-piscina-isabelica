import { pb } from "@/lib/pb";
import type { CreateLiquidacionDTO } from "@/pages/historialPagos/types";
import { CrearLiquidacionError } from "@/pages/historialPagos/types/error";

export const procesarLiquidacion = async (
  datosLiquidacion: CreateLiquidacionDTO,
  pagosIds: string[]
): Promise<boolean> => {
  try {
    // 1. Creamos el registro en la tabla 'liquidaciones'
    const nuevaLiquidacion = await pb.collection('liquidaciones').create(datosLiquidacion);

    // 2. Actualizamos todos los pagos para asignarles el ID de esta liquidación
    const promesasActualizacion = pagosIds.map(id => 
      pb.collection('pagos').update(id, { liquidacion_id: nuevaLiquidacion.id })
    );

    // Ejecutamos todas las actualizaciones en paralelo
    await Promise.all(promesasActualizacion);

    return true;
  } catch (error) {
    console.error("[Service Error] procesarLiquidacion:", error);
    throw new CrearLiquidacionError("Ocurrió un error al procesar la liquidación. Intente nuevamente.");
  }
};