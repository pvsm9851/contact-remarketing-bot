import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWhatsApp } from "@/contexts/WhatsAppContext";

interface RequireWhatsAppConnectionProps {
  children: React.ReactNode;
}

const RequireWhatsAppConnection: React.FC<RequireWhatsAppConnectionProps> = ({ children }) => {
  const { session } = useWhatsApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se não houver sessão ou não estiver conectado e não estiver na página do WhatsApp,
    // redireciona para a página do WhatsApp
    if (!session?.connected && location.pathname !== "/whatsapp") {
      console.log("Not connected, redirecting to WhatsApp page from RequireWhatsAppConnection");
      navigate("/whatsapp");
    }
  }, [session?.connected, location.pathname]);

  // Se não estiver conectado e não estiver na página do WhatsApp, não renderiza o conteúdo
  if (!session?.connected && location.pathname !== "/whatsapp") {
    return null;
  }

  return <>{children}</>;
};

export default RequireWhatsAppConnection; 