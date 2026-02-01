import PocketBase from 'pocketbase';

// 1. Cambia esto por la URL de tu servidor (ej. en producción o localhost)
const POCKETBASE_URL = 'http://127.0.0.1:8090';

// 2. Instancia "Singleton"
export const pb = new PocketBase(POCKETBASE_URL);

// 3. (Opcional) Desactivar la auto-cancelación de peticiones
// Esto evita que si haces 2 clicks rápidos, se cancele la primera petición.
pb.autoCancellation(false);