import { loginService } from '@/pages/login/services/login';
import type { LoginCredentials } from '@/pages/login/types';
import { AuthError } from '@/pages/login/types/error';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loginService(credentials);
      
      navigate('/'); 
      
    } catch (err) {
        if (err instanceof AuthError) {
          setError(err.message);
        } else {
          setError('Ocurrió un error inesperado. Por favor, intenta de nuevo o reinicia la aplicación.');
        }
      
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error
  };
};