import { pb } from '@/lib/pb';

export const checkActiveClasses = async (entrenadorId: string): Promise<boolean> => {
  try {
    // Solicitamos solo 1 registro. Si devuelve algo (totalItems > 0), es que TIENE clases.
    const result = await pb.collection('clases').getList(1, 1, {
      filter: `entrenador_id="${entrenadorId}" && activo=true`,
    });
    
    return result.totalItems > 0;
  } catch (error) {
    console.error("Error verificando clases:", error);
    return false; 
  }
};