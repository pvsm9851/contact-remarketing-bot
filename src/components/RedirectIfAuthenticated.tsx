import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { auth } = useAuth();

  useEffect(() => {
    // Se estiver autenticado, força o redirecionamento
    if (auth.isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [auth.isAuthenticated]);

  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estiver autenticado, mostra loading enquanto redireciona
  if (auth.isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
