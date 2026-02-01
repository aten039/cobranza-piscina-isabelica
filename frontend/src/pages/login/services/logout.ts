import { pb } from "@/lib/pb";

export const logoutService = () => {
  pb.authStore.clear(); // Limpia el token y el usuario actual
};