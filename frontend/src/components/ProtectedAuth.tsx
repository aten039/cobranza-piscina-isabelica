
import { pb } from '@/lib/pb';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAuth = ({ redirectPath = '/login' }) => {
  // pb.authStore.isValid comprueba si hay un token y si no ha expirado
  if (!pb.authStore.isValid) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si está autenticado, renderiza los componentes hijos
  return <Outlet />;
};

export default ProtectedAuth;