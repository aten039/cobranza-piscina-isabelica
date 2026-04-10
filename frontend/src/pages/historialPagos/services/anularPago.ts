import { pb } from "@/lib/pb";
import { PagosError } from "@/pages/pagos/types/error";


export const anularPago = async (id: string): Promise<boolean> => {
  try {
    // Solo actualizamos el campo is_null a true
    await pb.collection("pagos").update(id, {
      is_null: true
    });
    return true;
  } catch (error) {
    console.error("Error en el servicio anularPago:", error);
    throw new PagosError("No se pudo anular el pago. Verifica tu conexión o los permisos.");
  }
};