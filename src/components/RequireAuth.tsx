
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
