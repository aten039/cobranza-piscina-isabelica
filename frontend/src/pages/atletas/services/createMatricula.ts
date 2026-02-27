// src/pages/atletas/services/createMatricula.ts
// src/pages/atletas/services/createMatricula.ts
import { pb } from "@/lib/pb";

export interface CreateMatriculaConPagoDTO {
  matricula: {
    atleta_id: string;
    clase_id: string;
    fecha_inscripcion: string;
    activo: boolean;
    // Agregamos opcionalmente el deleted por si tu BD lo requiere explícito
    deleted?: boolean; 
  };
  pago: {
    monto: number;
    referencia: string;
    fecha_pago: string;
    cobertura_desde: string;
    cobertura_hasta: string;
  };
}

export const createMatricula = async (data: CreateMatriculaConPagoDTO) => {
  let matriculaCreadaId: string | null = null;
  let pagoCreadoId: string | null = null;

  try {
    // 1. Crear la Matrícula
    const matriculaPayload = {
      ...data.matricula,
      deleted: false // Nos aseguramos de que nazca sin estar eliminada
    };
    const matricula = await pb.collection('matriculas').create(matriculaPayload);
    matriculaCreadaId = matricula.id;

    // 2. Crear el Pago asociado a la nueva matrícula
    const pagoPayload = {
      matricula_id: matriculaCreadaId,
      monto: data.pago.monto,
      referencia: data.pago.referencia,
      fecha_pago: data.pago.fecha_pago,
      cobertura_desde: data.pago.cobertura_desde,
      cobertura_hasta: data.pago.cobertura_hasta,
    };
    const pago = await pb.collection('pagos').create(pagoPayload);
    pagoCreadoId = pago.id;

    // 3. ACTIVACIÓN DEL ATLETA: 
    // Como ya tiene matrícula y pago registrados exitosamente, lo activamos.
    await pb.collection('atletas').update(data.matricula.atleta_id, {
      activo: true
    });

    return matricula;

  } catch (error) {
    console.warn("Fallo en la transacción, iniciando rollback manual...");

    // ROLLBACK MANUAL EN ORDEN INVERSO
    // Si se creó el pago (y falló la actualización del atleta), borramos el pago
    if (pagoCreadoId) {
      await pb.collection('pagos').delete(pagoCreadoId).catch(err => 
        console.error("Error crítico: No se pudo revertir el pago", err)
      );
    }

    // Si se creó la matrícula (y falló el pago o el atleta), borramos la matrícula
    if (matriculaCreadaId) {
      await pb.collection('matriculas').delete(matriculaCreadaId).catch(err => 
        console.error("Error crítico: No se pudo revertir la matrícula", err)
      );
    }
    
    // Nota: Nunca necesitamos revertir al atleta, porque si falló el paso 1 o 2, 
    // el atleta nunca se modificó. Si falló el paso 3, el atleta se quedó como estaba.

    console.error("Error en la transacción Matrícula-Pago-Atleta:", error);
    throw new Error("No se pudo procesar la inscripción completa. Se revirtieron los cambios por seguridad.");
  }
};