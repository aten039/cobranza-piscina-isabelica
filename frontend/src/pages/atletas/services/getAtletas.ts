
import { pb } from '@/lib/pb';
import type { Atleta } from '../types';
import {AtletaNotGetError } from '../types/error';

export const getAtletas = async (): Promise<Atleta[]> => {
  try {
    // Obtenemos todos los registros de la colección 'atletas'
    // sorted por nombre para que aparezcan ordenados en la lista
    const records = await pb.collection('atletas').getFullList<Atleta>({
      filter: 'activo = true',
      sort: 'nombre',
    });

    return records;
  } catch (error) {
    console.error('Error fetching atletas:', error);
    
    
    throw new AtletaNotGetError(
        'Error al obtener atletas.'
    );
  }
};