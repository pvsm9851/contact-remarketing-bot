import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CustomHeader: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-500">Zenvia</h1>
        </Link>

        <div className="flex items-center gap-4">
          {auth.isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/whatsapp")}
                variant="outline"
                size="sm"
                className="text-sm border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                WhatsApp
              </Button>
              
              <Button
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                size="sm"
                className="text-sm bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                Dashboard
              </Button>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-300 hover:bg-gray-800 relative"
                    >
                      <User size={18} />
                      <span className="sr-only">Menu do usuário</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="text-gray-400" disabled>
                      {auth.user?.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:bg-gray-800"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/registro")}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Criar Conta
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
