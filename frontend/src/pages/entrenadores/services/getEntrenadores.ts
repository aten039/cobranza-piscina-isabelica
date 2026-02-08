import { pb } from "@/lib/pb";
import type { Entrenador } from "@/pages/entrenadores/types";
import { EntrenadorError } from "@/pages/entrenadores/types/error";

export async function getEntrenadores(): Promise<Entrenador[]> {
    try {   

        return await pb.collection('entrenadores').getFullList({
        sort: 'apellido', // Ordenamos alfabéticamente por apellido
        });
 
    } catch (error) {
        console.error("Error al cargar entrenadores:", error);
        throw new EntrenadorError("Error al cargar entrenadores");
    }
}