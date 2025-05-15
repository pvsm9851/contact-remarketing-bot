
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated: React.FC<RedirectIfAuthenticatedProps> = ({ children }) => {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuthenticated;
