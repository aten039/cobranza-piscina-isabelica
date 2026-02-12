
import { pb } from '@/lib/pb';
import type { Entrenador } from '@/pages/entrenadores/types';
import {  GetEntrenadorError } from '@/pages/entrenadores/types/error';

export const getEntrenadores = async (): Promise<Entrenador[]> => {
  try {
    // IMPORTANTE: No pongas "filter: 'activo=true'" aquí.
    // Necesitamos traer TODOS para que el componente pueda filtrar entre activos e inactivos.
    const records = await pb.collection('entrenadores').getFullList<Entrenador>({
      sort: '-created',
      // Si tenías filter, bórralo o coméntalo:
      // filter: 'activo=true', <--- ESTO CAUSA EL PROBLEMA
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching entrenadores:', error);
    throw new GetEntrenadorError("Error al obtener entrenadores");
  }
};