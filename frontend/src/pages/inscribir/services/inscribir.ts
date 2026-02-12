import { pb } from '@/lib/pb';
import { ClientResponseError } from 'pocketbase';
import type { IClass, IFormData } from '@/pages/inscribir/types';

// 1. Modificamos la función para recibir la edad (studentAge)
export const getClases = async (studentAge: number): Promise<IClass[]> => {
  try {
    // Validación de seguridad: si la edad no es válida o es 0, no traemos nada
    // o podrías quitar este if si quieres traer todo cuando no hay edad.
    if (studentAge === null || studentAge === undefined) return [];

    return await pb.collection('clases').getFullList<IClass>({
      sort: 'created',
      // 2. Aplicamos el filtro: 
      //    activo=true (Clase activa) Y 
      //    edadMin <= studentAge (La edad mínima requerida es menor o igual a la edad del alumno)
      filter: `activo=true && edadMin <= ${studentAge}`, 
      
      expand: 'entrenador_id,clases_horarios_via_clase_id.horario_id', 
    });
  } catch (error) {
    console.error("Error al cargar clases:", error);
    return [];
  }
};

export const saveInscription = async (formData: IFormData, age: number | null) => {
  // 1. Validaciones Previas
  if (age === null) throw new Error("La edad no ha sido calculada correctamente.");
  if (!formData.classId) throw new Error("Debe seleccionar un horario de clase.");
  if (!formData.paymentDate || !formData.coverageDate) {
    throw new Error("Debe indicar la Fecha de Pago y la Fecha de Cobertura.");
  }

  // Lógica de variables
  const isMinor = age < 18;
  const finalPhone = isMinor ? `${formData.repPhoneCode}-${formData.repPhoneNum}` : `${formData.phoneCode}-${formData.phoneNum}`;
  const finalCedula = `${formData.cedulaType}-${formData.cedulaNum}`;
  const repFullName = `${formData.repName} ${formData.repSurname}`.trim();
  const repCedula = `${formData.repCedulaType}-${formData.repCedulaNum}`;

  // VARIABLES DE CONTROL PARA ROLLBACK
  let createdAtletaId: string | null = null;
  let createdMatriculaId: string | null = null;

  try {
    // --- PASO A: OBTENER DATOS DE LA CLASE ---
    const claseRecord = await pb.collection('clases').getOne<IClass>(formData.classId);

    // --- PASO B: CREAR ATLETA ---
    const atletaData = {
      nombre: formData.name,
      apellido: formData.surname,
      cedula: finalCedula,
      telefono: finalPhone,
      direccion: formData.address,
      fecha_nacimiento: new Date(formData.dob).toISOString(),
      representante_nombre: isMinor ? repFullName : '',
      representante_cedula: isMinor ? repCedula : '',
      condicion_medica: formData.hasMedical ? formData.medicalDesc : '',
      activo: true,
    };

    const atleta = await pb.collection('atletas').create(atletaData);
    createdAtletaId = atleta.id; 

    // --- PASO C: CREAR MATRÍCULA ---
    const matriculaData = {
      atleta_id: atleta.id,
      clase_id: claseRecord.id,
      activo: true,
      fecha_inscripcion: new Date().toISOString()
    };

    const matricula = await pb.collection('matriculas').create(matriculaData);
    createdMatriculaId = matricula.id; 

    // --- PASO D: REGISTRAR PAGO ---
    const pagoData = {
      matricula_id: matricula.id,
      monto: formData.paymentAmount || claseRecord.costo || 0,
      referencia: formData.paymentMethod === 'efectivo' ? 'EFECTIVO' : formData.paymentRef,
      metodo: formData.paymentMethod,
      type: formData.currency,
      fecha_pago: new Date(formData.paymentDate).toISOString(),
      cobertura_desde: new Date(formData.paymentDate).toISOString(),
      cobertura_hasta: new Date(formData.coverageDate).toISOString(),
    };

    const pago = await pb.collection('pagos').create(pagoData);

    return {
      success: true,
      atletaId: atleta.id,
      matriculaId: matricula.id,
      pagoId: pago.id
    };

  } catch (error: unknown) {
    console.error("❌ Error en el proceso. Iniciando ROLLBACK...", error);

    // --- LÓGICA DE ROLLBACK ---
    try {
      if (createdMatriculaId) {
        await pb.collection('matriculas').delete(createdMatriculaId);
        console.log(`Rollback: Matrícula ${createdMatriculaId} eliminada.`);
      }
      
      if (createdAtletaId) {
        await pb.collection('atletas').delete(createdAtletaId);
        console.log(`Rollback: Atleta ${createdAtletaId} eliminado.`);
      }
    } catch (rollbackError) {
      console.error("CRÍTICO: Falló el Rollback manual.", rollbackError);
    }

    if (error instanceof ClientResponseError) {
      const details = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new Error(`Error al guardar: ${details}`);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Error desconocido durante la inscripción.");
    }
  }
};