import { pb } from "@/lib/pb";
import type { ProfessorData } from "@/pages/entrenadores/types";
import { CreateEntrenadorError } from "@/pages/entrenadores/types/error";

export const createEntrenador = async (data: ProfessorData) => {
  
  // 1. Transformación de datos
  // Aquí unimos el prefijo con el número para cumplir tu requerimiento
  const dbRecord = {
    nombre: data.nombre,
    apellido: data.apellido,
    // Formato: V-12345678
    cedula: `${data.cedulaType}-${data.cedula}`, 
    // Formato: 0414-1234567
    telefono: `${data.phoneCode}-${data.telefono}`, 
    direccion: data.direccion,
    activo: true, // Por defecto al crear (según tu imagen tienes un campo booleano)
  };

  try {
    // 'entrenadores' es el nombre de tu colección en PocketBase (cámbialo si es distinto)
    const record = await pb.collection('entrenadores').create(dbRecord);
    return record;
  } catch (error) {
    console.error("Error al crear el entrenador:", error);
    throw new CreateEntrenadorError("Error al crear el entrenador: ");
  }
};