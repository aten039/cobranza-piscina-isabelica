import { pb } from "@/lib/pb";
import type { LoginCredentials, UserAuthResponse } from "@/pages/login/types";
import { AuthError } from "@/pages/login/types/error";


export const loginService = async ({ email, password }: LoginCredentials): Promise<UserAuthResponse> => {
  try {

    const authData = await pb.collection('users').authWithPassword(
      email,
      password
    );
    
    return {
      token: authData.token
    };
  } catch (error) {

    console.error("Error en servicio de auth:", error);
    throw new AuthError('Credenciales inválidas o error de conexión');
  }
};
