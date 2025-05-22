
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWhatsApp } from "@/contexts/WhatsAppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, User } from "lucide-react";

export const CustomHeader: React.FC = () => {
  const { clearCache } = useWhatsApp();
  const { auth } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-500">Zenviax</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearCache}
            className="gap-2 text-sm border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Trash2 size={14} />
            Limpar Cache
          </Button>
          
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
          
          {auth.user && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-800"
              onClick={() => navigate("/dashboard")}
            >
              <User size={18} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
