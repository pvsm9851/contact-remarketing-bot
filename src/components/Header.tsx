
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Trash2 } from "lucide-react";

export function Header() {
  const { auth, logout, clearCache } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="font-bold text-xl text-brand-800">
          WhatsReMKT
        </Link>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-600 hover:text-brand-600 transition"
            >
              Dashboard
            </Link>
            <Link 
              to="/whatsapp" 
              className="text-gray-600 hover:text-brand-600 transition"
            >
              WhatsApp
            </Link>
            <Link 
              to="/contatos" 
              className="text-gray-600 hover:text-brand-600 transition"
            >
              Contatos
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
                <User size={16} />
                <span className="hidden sm:inline">{auth.user?.name || "Usuário"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium">{auth.user?.name || "Usuário"}</p>
                <p className="text-xs text-gray-500 truncate">{auth.user?.email || ""}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Settings size={16} className="mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearCache}>
                <Trash2 size={16} className="mr-2" />
                Limpar Cache
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
